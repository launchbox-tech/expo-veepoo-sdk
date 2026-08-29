import ExpoModulesCore
import CoreBluetooth
import VeepooBleSDK

/// 连接与蓝牙状态辅助方法
extension VeepooSDKModule {
  func emitNativeError(code: String, message: String, deviceId: String? = nil, rawCode: Int? = nil) {
    var payload: [String: Any] = [
      "code": code,
      "message": message
    ]
    if let deviceId = deviceId, !deviceId.isEmpty {
      payload["deviceId"] = deviceId
    }
    if let rawCode = rawCode {
      payload["rawCode"] = rawCode
    }
    self.sendEvent(ERROR, payload)
  }

  func emitConnectionStatus(deviceId: String, status: String, code: Int? = nil) {
    var payload: [String: Any] = [
      "deviceId": deviceId,
      "status": status
    ]
    if let code = code {
      payload["code"] = code
    }
    self.sendEvent(DEVICE_CONNECT_STATUS, payload)
    self.sendEvent(CONNECTION_STATUS_CHANGED, [
      "deviceId": deviceId,
      "status": status
    ])
  }

  func ensureCentralManager() {
    #if !targetEnvironment(simulator)
    if centralManager != nil { return }
    // [SCAN-FIX] Attach a delegate so the central completes initialization and
    // delivers centralManagerDidUpdateState — a nil delegate leaves `.state`
    // stuck at `.unknown`, which made emitBluetoothStatus() lie about power-on
    // for ~10s on a cold scan.
    if stateDelegate == nil { stateDelegate = CentralStateDelegate(module: self) }
    centralManager = CBCentralManager(delegate: stateDelegate, queue: nil, options: [
      CBCentralManagerOptionShowPowerAlertKey: true
    ])
    #endif
  }

  // [SCAN-FIX] Delivered by CentralStateDelegate when the radio state changes.
  // Publishes the truthful state to JS and re-arms a scan that was issued before
  // power-on (the dropped-scan recovery the 10s auto-stop used to handle).
  func handleCentralStateUpdate(_ central: CBCentralManager) {
    #if !targetEnvironment(simulator)
    print("[VeepooSDK] [SCAN-FIX] centralManagerDidUpdateState: \(central.state.rawValue)")
    self.emitBluetoothStatus()
    self.ensureScanning(source: "delegate")
    #endif
  }

  // [SCAN-FIX] Single authority for actually starting the vendor scan. Idempotent
  // per scan session via `scanRearmedOnPowerOn`, so it can be called from
  // handleStartScan AND the power-on callbacks (delegate / vendor block) in any
  // order without racing or double-issuing — whichever runs first while the radio
  // is poweredOn wins; the rest no-op. Defers cleanly while still powering on.
  func ensureScanning(source: String) {
    #if !targetEnvironment(simulator)
    guard self.isScanning,
          !self.scanRearmedOnPowerOn,
          self.centralManager?.state == .poweredOn,
          let mgr = self.bleManager else { return }
    self.scanRearmedOnPowerOn = true
    print("[VeepooSDK] [SCAN-FIX] ensureScanning: clean stop+start (source: \(source))")
    // The first vendor scan after a cold BLE init is unreliable as a bare start
    // (logs: a start right after power-on found nothing for 24s; only a retry's
    // stop+start worked). Stop to reset vendor state, then start after a beat.
    mgr.veepooSDKStopScanDevice()
    DispatchQueue.main.asyncAfter(deadline: .now() + 0.05) { [weak self] in
      guard let self = self, self.isScanning, let mgr = self.bleManager else { return }
      mgr.veepooSDKStartScanDeviceAndReceiveScanningDevice { [weak self] peripheralModel in
        guard let self = self, let model = peripheralModel else { return }
        self.handleDiscoveredDevice(model)
      }
    }
    #endif
  }

  /// - Parameter holdPending: when true, do NOT arm the 15s abandon timer.
  ///   `veepooSDKConnectDevice` ends in `centralManager.connect(peripheral:)`,
  ///   and on iOS that call has **no timeout** — CoreBluetooth keeps it armed
  ///   indefinitely and delivers `didConnect` whenever the peripheral comes
  ///   back into range, at zero cost to us (the radio scheduler does the
  ///   waiting, not a poll loop). Abandoning it after 15s and falling back to a
  ///   5s scan threw that away and forced the app into a retry loop: measured
  ///   at 20.28s per doomed attempt on device, over and over, with the band
  ///   simply out of range (2026-08-24 11:11–11:15). Only pass false when the
  ///   peripheral is NOT native to the vendor's central — a pending connect on
  ///   a foreign peripheral never fires (ADR-0014).
  func performConnect(
    model: VPPeripheralModel,
    deviceId: String,
    password: String,
    is24Hour: Bool,
    promise: Promise,
    holdPending: Bool = false,
    fallbackToScan: (() -> Void)? = nil
  ) {
    #if !targetEnvironment(simulator)
    print("[VeepooSDK] performConnect - 开始, deviceId: \(deviceId)")
    print("[VeepooSDK] performConnect - 当前上下文, connectedDeviceId: \(self.connectedDeviceId ?? "nil"), activeConnectDeviceId: \(self.activeConnectDeviceId ?? "nil"), state: \(self.connectionState.rawValue), pendingScanStart: \(self.pendingScanStart), isScanning: \(self.isScanning)")

    activeConnectDeviceId = deviceId
    connectionState = .connecting

    guard let manager = self.bleManager else {
      print("[VeepooSDK] performConnect - 错误: bleManager 为 nil")
      activeConnectDeviceId = nil
      connectionState = .error("BLE manager is nil")
      emitNativeError(code: "SDK_NOT_INITIALIZED", message: "BLE manager is nil", deviceId: deviceId)
      promise.reject("SDK_NOT_INITIALIZED", "BLE manager is nil")
      return
    }

    print("[VeepooSDK] performConnect - 调用 veepooSDKConnectDevice")

    // The vendor SDK holds deviceConnectBlock past cleanup time. Any Promise
    // captured (directly or transitively) inside that block is destroyed by
    // ARC on a BLE thread after HMR kills the JS runtime → SIGSEGV in
    // JavaScriptPromise.deinit. Route every settlement through
    // self.pendingConnectPromise instead — cleanup() nils it, turning late
    // vendor callbacks into no-ops.
    self.pendingConnectPromise = promise

    var isSettled = false

    if holdPending {
      // The OS owns the wait from here. `isSettled` stays false, the promise
      // stays unresolved, and the vendor's connect block is still the single
      // settlement path — it fires on link-up, or on a real vendor-side
      // failure. Nothing here abandons it.
      print("[VeepooSDK] performConnect - 保持挂起连接(无超时), deviceId: \(deviceId)")
      self.sendEvent(CONNECT_PENDING, ["deviceId": deviceId])
    } else {
      connectionTimer = Timer.scheduledTimer(withTimeInterval: 15.0, repeats: false) { [weak self] _ in
        guard let self = self else { return }
        guard !isSettled else { return }
        isSettled = true
        print("[VeepooSDK] performConnect - 连接超时, deviceId: \(deviceId), state: \(self.connectionState.rawValue), connectedDeviceId: \(self.connectedDeviceId ?? "nil"), activeConnectDeviceId: \(self.activeConnectDeviceId ?? "nil")")
        self.connectionState = .error("Connection timeout")
        self.emitConnectionStatus(deviceId: deviceId, status: "error")
        self.emitNativeError(code: "CONNECTION_TIMEOUT", message: "Connection timeout after 15 seconds", deviceId: deviceId)
        if let fallbackToScan = fallbackToScan {
          fallbackToScan()
        } else {
          self.pendingConnectPromise?.reject("CONNECTION_TIMEOUT", "Connection timeout after 15 seconds")
          self.pendingConnectPromise = nil
        }
      }
    }

    manager.veepooSDKConnectDevice(model) { [weak self] connectState in
      guard let self = self else { return }

      print("[VeepooSDK] performConnect - 连接状态: \(connectState.rawValue)")
      print("[VeepooSDK] performConnect - 回调现场, deviceId: \(deviceId), state: \(self.connectionState.rawValue), connectedDeviceId: \(self.connectedDeviceId ?? "nil"), activeConnectDeviceId: \(self.activeConnectDeviceId ?? "nil"), isSettled: \(isSettled)")

      switch connectState.rawValue {
      case 2:
        guard !isSettled else { return }
        isSettled = true
        self.connectionTimer?.invalidate()
        self.connectionTimer = nil
        print("[VeepooSDK] performConnect - 连接成功")
        // [RESTORATION] A band has now been connected on this install, so a
        // later launch may arm state restoration. Gating on this keeps the
        // Bluetooth permission prompt away from a first launch that has no
        // paired band to restore.
        VeepooRestorationSubscriber.markPaired()
        self.connectionState = .connected
        self.connectedDeviceId = deviceId
        self.sendEvent(DEVICE_CONNECTED, ["deviceId": deviceId, "isOadModel": false])

        self.connectionState = .authenticating
        print("[VeepooSDK] performConnect - 准备认证，等待 0.3 秒")
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.3) {
          self.verifyPasswordInternal(deviceId: deviceId, password: password, is24Hour: is24Hour)
        }

        self.pendingConnectPromise?.resolve(nil)
        self.pendingConnectPromise = nil

      case 0:
        guard !isSettled else { return }
        isSettled = true
        self.connectionTimer?.invalidate()
        self.connectionTimer = nil
        self.connectionState = .error("Device disconnected before connection completed")
        self.emitConnectionStatus(deviceId: deviceId, status: "error", code: connectState.rawValue)
        self.emitNativeError(
          code: "DEVICE_DISCONNECTED",
          message: "Device disconnected before connection completed",
          deviceId: deviceId,
          rawCode: connectState.rawValue
        )
        if let fallbackToScan = fallbackToScan {
          print("[VeepooSDK] performConnect - 连接前断开，改走隐藏扫描兜底")
          fallbackToScan()
        } else {
          self.pendingConnectPromise?.reject("DEVICE_DISCONNECTED", "Device disconnected before connection completed")
          self.pendingConnectPromise = nil
        }

      case 1:
        self.connectionState = .connecting
        print("[VeepooSDK] performConnect - 仍在连接中, deviceId: \(deviceId), 将继续等待成功/失败终态")
        self.emitConnectionStatus(deviceId: deviceId, status: "connecting", code: connectState.rawValue)

      case 3:
        guard !isSettled else { return }
        isSettled = true
        self.connectionTimer?.invalidate()
        self.connectionTimer = nil
        self.connectionState = .error("Connection failed")
        self.emitConnectionStatus(deviceId: deviceId, status: "error", code: connectState.rawValue)
        self.emitNativeError(
          code: "CONNECTION_FAILED",
          message: "Connection failed",
          deviceId: deviceId,
          rawCode: connectState.rawValue
        )
        if let fallbackToScan = fallbackToScan {
          fallbackToScan()
        } else {
          self.pendingConnectPromise?.reject("CONNECTION_FAILED", "Connection failed")
          self.pendingConnectPromise = nil
        }

      case 6:
        guard !isSettled else { return }
        isSettled = true
        self.connectionTimer?.invalidate()
        self.connectionTimer = nil
        self.connectionState = .error("Connection timeout")
        self.emitConnectionStatus(deviceId: deviceId, status: "error", code: connectState.rawValue)
        self.emitNativeError(
          code: "TIMEOUT",
          message: "Connection timeout",
          deviceId: deviceId,
          rawCode: connectState.rawValue
        )
        if let fallbackToScan = fallbackToScan {
          fallbackToScan()
        } else {
          self.pendingConnectPromise?.reject("TIMEOUT", "Connection timeout")
          self.pendingConnectPromise = nil
        }

      default:
        guard !isSettled else { return }
        isSettled = true
        self.connectionTimer?.invalidate()
        self.connectionTimer = nil
        self.connectionState = .error("Unknown connection error: \(connectState.rawValue)")
        self.emitConnectionStatus(deviceId: deviceId, status: "error", code: connectState.rawValue)
        self.emitNativeError(
          code: "UNKNOWN",
          message: "Unknown connection error: \(connectState.rawValue)",
          deviceId: deviceId,
          rawCode: connectState.rawValue
        )
        if let fallbackToScan = fallbackToScan {
          fallbackToScan()
        } else {
          self.pendingConnectPromise?.reject("UNKNOWN", "Unknown connection error: \(connectState.rawValue)")
          self.pendingConnectPromise = nil
        }
      }
    }
    #endif
  }

  func startScanConnectFallback(
    deviceId: String,
    password: String,
    is24Hour: Bool,
    promise: Promise,
    timeout: TimeInterval = 5.0
  ) {
    #if !targetEnvironment(simulator)
    print("[VeepooSDK] startScanConnectFallback - 开始, deviceId: \(deviceId), timeout: \(timeout), isScanning: \(self.isScanning), discoveredCount: \(self.discoveredDevices.count)")
    self.pendingConnectDeviceId = deviceId
    self.pendingConnectPassword = password
    self.pendingConnectIs24Hour = is24Hour
    self.pendingConnectPromise = promise
    self.pendingScanStart = true

    if !self.isScanning {
      guard let manager = self.bleManager else {
        promise.reject("BLUETOOTH_UNAVAILABLE", "Bluetooth manager not available")
        return
      }
      self.isScanning = true
      self.emitBluetoothStatus(force: true)
      print("[VeepooSDK] startScanConnectFallback - 启动扫描兜底, deviceId: \(deviceId)")
      manager.veepooSDKStartScanDeviceAndReceiveScanningDevice { [weak self] peripheralModel in
        guard let self = self, let model = peripheralModel else { return }
        self.handleDiscoveredDevice(model)
      }
    }

    DispatchQueue.main.asyncAfter(deadline: .now() + timeout) { [weak self] in
      guard let self = self else { return }
      if self.pendingConnectDeviceId == deviceId {
        print("[VeepooSDK] startScanConnectFallback - 扫描兜底超时, deviceId: \(deviceId), discoveredCount: \(self.discoveredDevices.count)")
        self.bleManager?.veepooSDKStopScanDevice()
        self.isScanning = false
        self.pendingScanStart = false
        self.emitBluetoothStatus(force: true)
        if let pendingPromise = self.pendingConnectPromise {
          self.pendingConnectPromise = nil
          self.pendingConnectDeviceId = nil
          self.pendingConnectPassword = nil
          self.pendingConnectIs24Hour = false
          pendingPromise.reject("DEVICE_NOT_FOUND", "Device not found after scanning.")
        }
      }
    }
    #endif
  }

  func setupVeepooCallbacks() {
    #if !targetEnvironment(simulator)
    guard let manager = self.bleManager else { return }

    manager.vpBleCentralManageChangeBlock = { [weak self] _ in
      DispatchQueue.main.async {
        guard let self = self else { return }
        self.emitBluetoothStatus(force: true)
        // [SCAN-FIX] Backstop to the delegate path — same idempotent authority.
        self.ensureScanning(source: "vendorBlock")
      }
    }

    manager.vpBleConnectStateChangeBlock = { [weak self] state in
      guard let self = self else { return }

      let deviceId = self.connectedDeviceId ?? self.activeConnectDeviceId ?? ""
      let status: String
      switch state.rawValue {
      case 0:
        status = "disconnected"
      case 1:
        status = "connecting"
      case 2:
        status = "connected"
      default:
        status = "error"
      }

      if !deviceId.isEmpty {
        self.emitConnectionStatus(deviceId: deviceId, status: status, code: state.rawValue)
      }

      if state.rawValue == 0 {
        let failedDuringConnect: Bool
        switch self.connectionState {
        case .connecting, .connected, .discoveringServices, .authenticating:
          failedDuringConnect = true
        default:
          failedDuringConnect = false
        }

        self.connectedDeviceId = nil
        self.activeConnectDeviceId = nil
        if !deviceId.isEmpty {
          self.sendEvent(DEVICE_DISCONNECTED, ["deviceId": deviceId])
        }
        if failedDuringConnect {
          self.connectionState = .error("Device disconnected during connection")
          self.emitNativeError(
            code: "DEVICE_DISCONNECTED",
            message: "Device disconnected during connection",
            deviceId: deviceId,
            rawCode: state.rawValue
          )
        } else {
          self.connectionState = .disconnected
        }
      }
    }

    self.peripheralManage?.receiveDeviceSOSCommand = { [weak self] in
      guard let self = self else { return }
      self.sendEvent(DEVICE_SOS_TRIGGERED, [
        "deviceId": self.connectedDeviceId ?? ""
      ])
    }

    self.peripheralManage?.veepooSDKAddPTTStateListener { [weak self] pttState in
      guard let self = self else { return }
      let state = pttState == 1 ? "active" : "inactive"
      self.sendEvent(PTT_STATE_CHANGED, [
        "deviceId": self.connectedDeviceId ?? "",
        "state": state
      ])
    }

    self.peripheralManage?.deviceSportDidFinishBlock = { [weak self] _ in
      guard let self = self else { return }
      // deviceSportDidFinishBlock only signals that a sport session ended
      // (BOOL success). Unlike Android's SportModelStateData it carries no
      // discipline, and the device's runningType is a 0-3 busy state (per the
      // SDK header), not a mode index. The event contract is
      // `mode: SportMode | null`, so report nil here rather than a fabricated
      // discipline — the real discipline is read from the stored running data
      // (readDeviceRunningData / Exercise).
      self.sendEvent(SPORT_MODE_DATA, [
        "deviceId": self.connectedDeviceId ?? "",
        "mode": nil as Any?
      ])
    }
    #endif
  }

  func handleDiscoveredDevice(_ peripheralModel: VPPeripheralModel) {
    #if !targetEnvironment(simulator)
    let rawAddr = peripheralModel.deviceAddress
    let uuid = peripheralModel.peripheral.identifier.uuidString
    let name = peripheralModel.deviceName ?? "Unknown"
    let rssi = peripheralModel.rssi ?? 0

    let exportId = rawAddr ?? uuid

    print("[VeepooSDK] handleDiscoveredDevice - 发现设备, exportId: \(exportId), uuid: \(uuid), name: \(name), pendingConnectDeviceId: \(self.pendingConnectDeviceId ?? "nil")")

    self.discoveredDevices[exportId] = peripheralModel
    self.discoveredDevices[uuid] = peripheralModel

    self.sendEvent(DEVICE_FOUND, [
      "device": [
        "id": exportId,
        "name": name,
        "rssi": rssi,
        "mac": exportId,
        "uuid": uuid
      ],
      "timestamp": Date().timeIntervalSince1970 * 1000
    ])
    
    if let pendingId = self.pendingConnectDeviceId,
       let pendingPromise = self.pendingConnectPromise,
       let pendingPassword = self.pendingConnectPassword,
       (pendingId == exportId || pendingId == uuid) {
      let savedIs24Hour = self.pendingConnectIs24Hour
      let requestedDeviceId = pendingId
      self.pendingConnectDeviceId = nil
      self.pendingConnectPromise = nil
      self.pendingConnectPassword = nil
      self.pendingConnectIs24Hour = false

      if self.isScanning {
        self.bleManager?.veepooSDKStopScanDevice()
        self.isScanning = false
        self.pendingScanStart = false
        self.emitBluetoothStatus(force: true)
      }

      self.performConnect(
        model: peripheralModel,
        deviceId: requestedDeviceId,
        password: pendingPassword,
        is24Hour: savedIs24Hour,
        promise: pendingPromise
      )
    }
    #endif
  }

  func verifyPasswordInternal(deviceId: String, password: String, is24Hour: Bool) {
    #if !targetEnvironment(simulator)
    print("[VeepooSDK] verifyPasswordInternal - 开始, deviceId: \(deviceId), password: \(password), 重试次数: \(authenticationRetryCount), state: \(self.connectionState.rawValue), connectedDeviceId: \(self.connectedDeviceId ?? "nil"), activeConnectDeviceId: \(self.activeConnectDeviceId ?? "nil")")
    
    authenticationTimer?.invalidate()
    authenticationTimer = Timer.scheduledTimer(withTimeInterval: 10.0, repeats: false) { [weak self] _ in
      guard let self = self else { return }
      print("[VeepooSDK] verifyPasswordInternal - 认证超时")
      
      if self.authenticationRetryCount < self.maxAuthenticationRetries {
        self.authenticationRetryCount += 1
        print("[VeepooSDK] verifyPasswordInternal - 将进行第 \(self.authenticationRetryCount) 次重试")
        DispatchQueue.main.asyncAfter(deadline: .now() + 1.0) {
          self.verifyPasswordInternal(deviceId: deviceId, password: password, is24Hour: is24Hour)
        }
      } else {
        self.connectionState = .error("Authentication timeout")
      self.emitNativeError(
        code: "AUTH_TIMEOUT",
        message: "Authentication timeout",
        deviceId: deviceId
      )
      self.sendEvent(PASSWORD_DATA, [
        "deviceId": deviceId,
        "data": [
          "status": "TIMEOUT",
          "rawStatus": "TIMEOUT",
          "password": password,
          "pwd": password,
          "deviceNumber": "",
          "deviceVersion": "",
          "retryCount": self.authenticationRetryCount
          ]
        ])
        self.authenticationRetryCount = 0
      }
    }
    
    guard let manager = self.bleManager else {
      print("[VeepooSDK] verifyPasswordInternal - 错误: bleManager 为 nil")
      authenticationTimer?.invalidate()
      authenticationTimer = nil
      connectionState = .error("BLE manager is nil")
      self.emitNativeError(code: "SDK_NOT_INITIALIZED", message: "BLE manager is nil", deviceId: deviceId)
      self.sendEvent(PASSWORD_DATA, [
        "deviceId": deviceId,
        "data": [
          "status": "FAILED",
          "rawStatus": "FAILED",
          "password": password,
          "pwd": password,
          "deviceNumber": "",
          "deviceVersion": "",
          "error": "BLE manager is nil"
        ]
      ])
      return
    }
    
    print("[VeepooSDK] verifyPasswordInternal - bleManager 存在")
    manager.is24HourFormat = is24Hour

    guard let passwordType = SynchronousPasswordType(rawValue: 0) else {
      print("[VeepooSDK] verifyPasswordInternal - 错误: SynchronousPasswordType 创建失败")
      authenticationTimer?.invalidate()
      authenticationTimer = nil
      connectionState = .error("Invalid password type")
      self.emitNativeError(code: "INVALID_PASSWORD_TYPE", message: "Invalid password type", deviceId: deviceId)
      self.sendEvent(PASSWORD_DATA, [
        "deviceId": deviceId,
        "data": [
          "status": "FAILED",
          "rawStatus": "FAILED",
          "password": password,
          "pwd": password,
          "deviceNumber": "",
          "deviceVersion": "",
          "error": "Invalid password type"
        ]
      ])
      return
    }

    print("[VeepooSDK] verifyPasswordInternal - 调用 veepooSDKSynchronousPassword")
    manager.veepooSDKSynchronousPassword(with: passwordType, password: password) { [weak self] result in
      guard let self = self else {
        print("[VeepooSDK] verifyPasswordInternal - 错误: self 为 nil")
        return
      }

      self.authenticationTimer?.invalidate()
      self.authenticationTimer = nil

      print("[VeepooSDK] verifyPasswordInternal - 密码验证结果: \(result.rawValue)")

      let success = (result.rawValue == 1) || (result.rawValue == 6)
      let status = success ? "SUCCESS" : "FAILED"

      self.sendEvent(PASSWORD_DATA, [
        "deviceId": deviceId,
        "data": [
          "status": status,
          "rawStatus": result.rawValue,
          "password": password,
          "pwd": password,
          "deviceNumber": String(manager.peripheralModel?.deviceNumber ?? 0),
          "deviceVersion": manager.peripheralModel?.deviceVersion ?? "",
          "retryCount": self.authenticationRetryCount
        ]
      ])

      if success {
        print("[VeepooSDK] verifyPasswordInternal - 密码验证成功, 发送 DEVICE_READY 事件")
        self.connectionState = .ready
        self.activeConnectDeviceId = nil
        self.authenticationRetryCount = 0
        // Surface the real, stable hardware MAC (see Connect.swift handleVerifyPassword).
        // `deviceAddress` settles to it post-verification and the SDK's historical
        // reads already use it as their tableID, so it's proven correct — pairing
        // keys device identity on this instead of the scan id (which flips to the
        // iOS CBPeripheral UUID on re-pair). This is the auto-verify-on-connect
        // path the app actually hits.
        // The vendor re-sends the password on every service discovery, so this
        // block runs more than once per verify and reads `deviceAddress` at both
        // ends of the settle. `VeepooDeviceIdentity` sorts whatever it finds into
        // `mac` or `uuid` so neither emission can mislabel a UUID as a MAC (#218).
        let identity = VeepooDeviceIdentity.from(
          deviceAddress: manager.peripheralModel?.deviceAddress)
        // `rawStatus` is the vendor's `PasswordSynchronTpye`, and 1 and 6 are not
        // the same thing: 1 is "password verified", 6 is "password verified AND
        // time synchronized" — the header calls 6 the value normally returned.
        // Both reach `ready` here, so a consumer that only sees the event cannot
        // tell a half-finished handshake from a complete one. Carry the number so
        // it can (rayu.ai's deaf-link investigation, Addendum 5).
        self.sendEvent(DEVICE_READY, [
          "deviceId": deviceId,
          "mac": identity.macPayload,
          "uuid": identity.uuidPayload,
          "isOadModel": false,
          "rawStatus": result.rawValue,
        ])
      } else {
        print("[VeepooSDK] verifyPasswordInternal - 密码验证失败, result: \(result.rawValue)")
        
        if self.authenticationRetryCount < self.maxAuthenticationRetries {
          self.authenticationRetryCount += 1
          print("[VeepooSDK] verifyPasswordInternal - 将进行第 \(self.authenticationRetryCount) 次重试")
          DispatchQueue.main.asyncAfter(deadline: .now() + 1.0) {
            self.verifyPasswordInternal(deviceId: deviceId, password: password, is24Hour: is24Hour)
          }
        } else {
          self.connectionState = .error("Authentication failed after \(self.authenticationRetryCount) retries")
          self.emitNativeError(
            code: "AUTH_FAILED",
            message: "Authentication failed after \(self.authenticationRetryCount) retries",
            deviceId: deviceId,
            rawCode: result.rawValue
          )
          self.authenticationRetryCount = 0
        }
      }
    }
    #endif
  }

  /// Publish the radio's state to JS — but ONLY when it actually changed.
  ///
  /// [BT-TRANSITION] This is called from a dozen sites (scan start/stop, the
  /// connect fallback timeout, the vendor central-manage block, cleanup) as a
  /// convenience snapshot. `isScanning` / `pendingScanStart` are SCAN state, not
  /// radio state — they ride along as context but are deliberately NOT part of
  /// the dedupe key, because a scan starting is not a bluetooth state change and
  /// JS must not react to it as one.
  ///
  /// Pass `force: true` from the SCAN-LIFECYCLE sites — the ones that really do
  /// mutate `isScanning` / `pendingScanStart`. The pair screen re-issues a lost
  /// scan off exactly that signal (`band.scan.start_issued reason=bt_heal`), so
  /// deduping those away would break pairing. Also force where the consumer has
  /// no prior value at all: a fresh `OnStartObserving`, or `cleanup()` (which
  /// resets the key anyway).
  ///
  /// What stays deduped is the majority — the connect path and the vendor
  /// callbacks, which republished an unchanged radio state thousands of times
  /// (2,572 of 2,618 events in a 19-hour trace) for no reader at all.
  func emitBluetoothStatus(force: Bool = false) {
    #if !targetEnvironment(simulator)
    var stateName = "unknown"

    if let central = centralManager {
      switch central.state {
      case .unknown: stateName = "unknown"
      case .resetting: stateName = "resetting"
      case .unsupported: stateName = "unsupported"
      case .unauthorized: stateName = "unauthorized"
      case .poweredOff: stateName = "poweredOff"
      case .poweredOn: stateName = "poweredOn"
      @unknown default: stateName = "unknown"
      }
    }

    let authorizationName: String

    if #available(iOS 13.0, *) {
      switch CBManager.authorization {
      case .notDetermined: authorizationName = "notDetermined"
      case .restricted: authorizationName = "restricted"
      case .denied: authorizationName = "denied"
      case .allowedAlways: authorizationName = "allowedAlways"
      @unknown default: authorizationName = "notDetermined"
      }
    } else {
      authorizationName = "notDetermined"
    }

    let key = "\(stateName)|\(authorizationName)"
    if !force && lastEmittedBluetoothKey == key { return }
    lastEmittedBluetoothKey = key

    self.sendEvent(BLUETOOTH_STATE_CHANGED, [
      "state": stateName,
      "stateName": stateName,
      "authorization": authorizationName,
      "authorizationName": authorizationName,
      "isScanning": isScanning,
      "pendingScanStart": pendingScanStart
    ])
    #endif
  }

  func cleanup() {
    #if !targetEnvironment(simulator)
    bleManager?.veepooSDKStopScanDevice()
    bleManager?.veepooSDKDisconnectDevice()
    
    authenticationTimer?.invalidate()
    authenticationTimer = nil
    
    connectionTimer?.invalidate()
    connectionTimer = nil
    
    authenticationRetryCount = 0
    #endif
    isScanning = false
    pendingScanStart = false
    scanRearmedOnPowerOn = false
    connectedDeviceId = nil
    isInitialized = false
    pendingConnectDeviceId = nil
    pendingConnectPassword = nil
    pendingConnectIs24Hour = false
    pendingConnectPromise = nil
    permissionPromise = nil
    clearAllPromiseBoxes()
    #if !targetEnvironment(simulator)
    discoveredDevices.removeAll()
    #endif
    connectionState = .idle
    // Teardown drops the subscriber's context — the next emit must be truthful
    // from scratch, not deduped against a key from the previous session.
    lastEmittedBluetoothKey = nil
    emitBluetoothStatus(force: true)
  }
}
