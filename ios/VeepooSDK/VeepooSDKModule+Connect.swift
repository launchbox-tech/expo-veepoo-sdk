import ExpoModulesCore
import VeepooBleSDK

extension VeepooSDKModule {
  func handleConnect(deviceId: String, options: [String: Any]?, promise: Promise) {
    #if targetEnvironment(simulator)
    self.connectedDeviceId = deviceId
    self.sendEvent(DEVICE_CONNECTED, ["deviceId": deviceId, "isOadModel": false])
    self.sendEvent(DEVICE_READY, ["deviceId": deviceId, "isOadModel": false])
    promise.resolve(nil)
    #else
    print("[VeepooSDK] connect - 请求连接, deviceId: \(deviceId), options: \(String(describing: options)), currentState: \(self.connectionState.rawValue), connectedDeviceId: \(self.connectedDeviceId ?? "nil"), activeConnectDeviceId: \(self.activeConnectDeviceId ?? "nil"), discoveredCount: \(self.discoveredDevices.count)")
    guard self.isInitialized else {
      promise.reject("SDK_NOT_INITIALIZED", "SDK not initialized")
      return
    }
    guard let _ = self.bleManager else {
      promise.reject("SDK_NOT_INITIALIZED", "BLE manager is nil")
      return
    }
    let password = options?["password"] as? String ?? "0000"
    let is24Hour = options?["is24Hour"] as? Bool ?? false
    let uuidString = options?["uuid"] as? String
    // [PENDING-CONNECT] Opt-in, because the right answer differs by caller.
    // A background reconnect WANTS the OS to hold the connect indefinitely —
    // nobody is waiting on a screen, and the alternative is a poll loop. A
    // pairing tap does NOT: a user is sitting in front of a modal, so that
    // connect must be bounded and must be able to fail.
    let holdPendingOpt = options?["hold_pending"] as? Bool ?? false

    // [CONNECT-ID] Fail fast, and say why, when neither id can address a
    // peripheral. CoreBluetooth resolves ONLY a CBPeripheral UUID: a MAC makes
    // `UUID(uuidString:)` nil below, so `retrievePeripherals` is skipped, and
    // the scan fallback cannot match it either because `deviceAddress` is nil
    // at scan time. The old behaviour was to spend ~5s in that doomed scan and
    // reject DEVICE_NOT_FOUND — indistinguishable from a band that is simply
    // out of range, which is how a MAC-keyed pairing went undiagnosed until it
    // had stranded users behind an unpair/re-pair (launchbox-tech/rayu.ai#456).
    //
    // A cached model from THIS scan session is still a legal way in (the pair
    // screen taps a device it just discovered), so only reject when there is no
    // cache hit either.
    if UUID(uuidString: deviceId) == nil,
       uuidString.flatMap({ UUID(uuidString: $0) }) == nil,
       self.discoveredDevices[deviceId] == nil {
      print("[VeepooSDK] connect - 拒绝: deviceId 不是 UUID 且无缓存, deviceId: \(deviceId)")
      self.emitConnectionStatus(deviceId: deviceId, status: "error")
      promise.reject(
        "INVALID_CONNECT_ID",
        "'\(deviceId)' is not a CBPeripheral UUID. iOS can only reconnect by peripheral UUID — a MAC address is unresolvable. Re-pair the band to store a valid connect id."
      )
      return
    }

    self.emitConnectionStatus(deviceId: deviceId, status: "connecting")

    // 优先使用当前扫描/缓存到的设备模型。
    // 对于扫描页点击连接，直接使用扫描结果里的 peripheralModel 更稳定；
    // 只有在本地没有缓存模型时，才回退到 UUID 恢复外围设备。
    var peripheralModel: VPPeripheralModel? = nil
    var modelSource = "none"
    peripheralModel = self.discoveredDevices[deviceId]
    if peripheralModel != nil {
      modelSource = "cache:deviceId"
    }
    if peripheralModel == nil, let uuidStr = uuidString {
      peripheralModel = self.discoveredDevices[uuidStr]
      if peripheralModel != nil {
        modelSource = "cache:uuid"
      }
    }
    // ADR-0014: retrieve on the VENDOR's central — a CBPeripheral is bound to
    // the central that created it; the old code retrieved on self.centralManager
    // (a separate permission-probe central) and handed the vendor a FOREIGN
    // peripheral, which is the likely root of the "retrieved models are
    // unstable" distrust that forced every UUID connect through a scan.
    if peripheralModel == nil, let uuidStr = uuidString, let uuid = UUID(uuidString: uuidStr),
       let vendorCentral = self.bleManager?.centralManager {
      let peripherals = vendorCentral.retrievePeripherals(withIdentifiers: [uuid])
      print("[VeepooSDK] connect - retrievePeripherals(vendor central), uuid: \(uuidStr), count: \(peripherals.count), state: \(peripherals.first?.state.rawValue ?? -1)")
      if let peripheral = peripherals.first {
        peripheralModel = VPPeripheralModel(peripher: peripheral)
        if let recoveredModel = peripheralModel {
          self.discoveredDevices[uuidStr] = recoveredModel
          self.discoveredDevices[deviceId] = recoveredModel
          modelSource = "retrieved:uuid"
        }
      }
    }

    print("[VeepooSDK] connect - 模型解析结果, deviceId: \(deviceId), modelSource: \(modelSource), uuid: \(uuidString ?? "nil"), foundModel: \(peripheralModel != nil)")

    // ADR-0014: TRUST retrieved peripherals — direct connect works whether or
    // not the band is advertising. A band still holding a stale link from a
    // killed process is INVISIBLE to scans (it doesn't advertise), so the old
    // scan-first policy produced "Device not found after scanning" churn on
    // every relaunch — while a direct connect reattaches in milliseconds
    // (G Band parity). performConnect still falls back to the hidden scan on
    // failure/timeout, so trusting the model never regresses.
    let shouldUseScanFallbackDirectly = modelSource == "none"
    let capturedModel = peripheralModel

    // Vendor SDK connect calls schedule Timers and invoke CoreBluetooth APIs
    // that require a thread with an active run loop. ExpoModulesCore dispatches
    // AsyncFunction calls on its module queue (a GCD serial queue — no run loop),
    // so all three connect paths must hop to the main thread before touching the
    // vendor SDK, the same pattern as handleInit. Without this, Timer.scheduledTimer
    // inside performConnect crashes on the module queue thread.
    DispatchQueue.main.async {
      if shouldUseScanFallbackDirectly {
        print("[VeepooSDK] connect - 当前仅有 UUID 恢复模型或无模型，直接进入隐藏扫描兜底, deviceId: \(deviceId), modelSource: \(modelSource)")
        self.startScanConnectFallback(
          deviceId: deviceId,
          password: password,
          is24Hour: is24Hour,
          promise: promise
        )
      } else if let model = capturedModel {
        self.performConnect(
          model: model,
          deviceId: deviceId,
          password: password,
          is24Hour: is24Hour,
          promise: promise,
          // Only when the caller asked. The model here is native to the
          // vendor's central (cache hit from this scan session, or ADR-0014's
          // retrieve on that same central), so an OS-level pending connect is
          // VALID — a pending connect on a foreign peripheral never fires —
          // but validity is not the same as wanting it (see `holdPendingOpt`).
          holdPending: holdPendingOpt,
          fallbackToScan: { [weak self] in
            // Do NOT capture `promise` here — this closure is strongly held by
            // the vendor deviceConnectBlock, and a captured Promise destroyed
            // after HMR crashes (see performConnect). performConnect already
            // parked the promise in pendingConnectPromise; read it from there.
            // After cleanup() nils it, this guard makes the fallback a no-op.
            guard let self = self, let pendingPromise = self.pendingConnectPromise else { return }
            print("[VeepooSDK] connect - performConnect 失败，进入扫描兜底, deviceId: \(deviceId)")
            self.startScanConnectFallback(
              deviceId: deviceId,
              password: password,
              is24Hour: is24Hour,
              promise: pendingPromise
            )
          }
        )
      } else {
        print("[VeepooSDK] connect - 无可用模型，直接进入扫描兜底, deviceId: \(deviceId), uuid: \(uuidString ?? "nil")")
        self.startScanConnectFallback(
          deviceId: deviceId,
          password: password,
          is24Hour: is24Hour,
          promise: promise
        )
      }
    }
    #endif
  }

  func handleDisconnect(deviceId: String, promise: Promise) {
    #if targetEnvironment(simulator)
    self.connectedDeviceId = nil
    self.sendEvent(DEVICE_DISCONNECTED, ["deviceId": deviceId])
    self.sendEvent(DEVICE_CONNECT_STATUS, ["deviceId": deviceId, "status": "disconnected"])
    promise.resolve(nil)
    #else
    self.connectionState = .disconnecting
    self.bleManager?.veepooSDKDisconnectDevice()
    self.connectedDeviceId = nil
    self.activeConnectDeviceId = nil
    self.activeMeasurementType = nil
    self.sendEvent(DEVICE_DISCONNECTED, ["deviceId": deviceId])
    self.emitConnectionStatus(deviceId: deviceId, status: "disconnected")
    self.connectionState = .disconnected
    promise.resolve(nil)
    #endif
  }

  func handleGetConnectionStatus(deviceId: String, promise: Promise) {
    let matchesCurrentDevice =
      self.connectedDeviceId == deviceId ||
      self.activeConnectDeviceId == deviceId

    let status = matchesCurrentDevice
      ? self.publicConnectionStatus(for: self.connectionState)
      : "disconnected"
    promise.resolve(status)
  }

  func handleVerifyPassword(password: String, is24Hour: Bool, promise: Promise) {
    #if targetEnvironment(simulator)
    self.sendEvent(PASSWORD_DATA, [
      "deviceId": self.connectedDeviceId ?? "",
      "data": ["status": "SUCCESS", "password": password, "deviceNumber": "", "deviceVersion": ""]
    ])
    self.connectionState = .ready
    self.activeConnectDeviceId = nil
    self.sendEvent(DEVICE_READY, ["deviceId": self.connectedDeviceId ?? "", "isOadModel": false])
    promise.resolve(["status": "SUCCESS", "password": password, "deviceNumber": "", "deviceVersion": ""])
    #else
    guard let manager = self.bleManager else {
      promise.reject("SDK_NOT_INITIALIZED", "BLE manager is nil")
      return
    }
    manager.is24HourFormat = is24Hour
    guard let passwordType = SynchronousPasswordType(rawValue: 0) else {
      promise.reject("PASSWORD_TYPE_ERROR", "Invalid password type")
      return
    }
    let promiseBox = self.makePromiseBox(promise)
    manager.veepooSDKSynchronousPassword(with: passwordType, password: password) { [weak self] result in
      guard let self = self else { return }
      let success = (result.rawValue == 1) || (result.rawValue == 6)
      let status = self.normalizePasswordStatus(success ? "SUCCESS" : "FAILED")
      let resultData: [String: Any] = [
        "status": status,
        "rawStatus": result.rawValue,
        "password": password,
        "pwd": password,
        "deviceNumber": String(manager.peripheralModel?.deviceNumber ?? 0),
        "deviceVersion": manager.peripheralModel?.deviceVersion ?? "",
        "deviceTestVersion": manager.peripheralModel?.deviceTestVersion ?? ""
      ]
      self.sendEvent(PASSWORD_DATA, ["deviceId": self.connectedDeviceId ?? "", "data": resultData])
      if success {
        self.cacheDeviceFunctions()
        self.connectionState = .ready
        self.activeConnectDeviceId = nil
        // Surface the real, stable hardware MAC. `deviceAddress` settles to it
        // after password verification (vendor header: "may change after password
        // verification") and the SDK's own historical-data reads already use it
        // as their `tableID`, so it's proven correct. Pairing keys device
        // identity on THIS instead of the scan-time value, which flips to the iOS
        // CBPeripheral UUID on re-pair.
        // "Settles" is the operative word: the vendor re-sends the password on
        // each service discovery and re-runs this block, so the address is read
        // both before and after the transition. `VeepooDeviceIdentity` sorts it
        // into `mac` or `uuid` by shape, which is what keeps a CBPeripheral UUID
        // out of a field named `mac` (#218). This site is only reachable through
        // the `verifyPassword` JS export — the app auto-verifies on connect and
        // never calls it — but it publishes the same field, so it gets the same
        // treatment rather than being left as a trap for the next consumer.
        let identity = VeepooDeviceIdentity.from(
          deviceAddress: manager.peripheralModel?.deviceAddress)
        // See ConnectionHelpers' note: 1 is password-verified, 6 is
        // password-verified AND time-synced. Both land here; only the number says
        // which.
        self.sendEvent(DEVICE_READY, [
          "deviceId": self.connectedDeviceId ?? "",
          "mac": identity.macPayload,
          "uuid": identity.uuidPayload,
          "isOadModel": false,
          "rawStatus": result.rawValue,
        ])
      }
      promiseBox.resolve(resultData)
    }
    #endif
  }
}
