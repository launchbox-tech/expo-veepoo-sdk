import ExpoModulesCore
import VeepooBleSDK

extension VeepooSDKModule {

  // MARK: - readDeviceBTStatus

  func handleReadDeviceBTStatus(promise: Promise) {
    #if targetEnvironment(simulator)
    promise.resolve([
      "isBTOpen": false,
      "isAutoConnect": false,
      "isAudioOpen": false,
      "hasPairInfo": false,
      "state": "disconnected"
    ] as [String: Any])
    #else
    guard self.isInitialized else {
      promise.reject("SDK_NOT_INITIALIZED", "SDK not initialized")
      return
    }
    guard let model = peripheralManage?.peripheralModel else {
      promise.reject("DEVICE_NOT_CONNECTED", "No device connected")
      return
    }
    guard self.connectionState == .ready else {
      promise.reject("DEVICE_NOT_READY", "Device is not ready")
      return
    }

    // iOS doesn't have a dedicated readBTInfo API like Android.
    // Check CPUType == 1 (Jerry series supports classic BT).
    guard model.CPUType == 1 else {
      promise.reject("CAPABILITY_UNSUPPORTED", "Band does not support classic Bluetooth")
      return
    }

    // Return cached/default status — iOS has no standalone read API.
    // The VPBTConnectStateChangeBlock provides updates reactively.
    promise.resolve([
      "isBTOpen": false,
      "isAutoConnect": false,
      "isAudioOpen": false,
      "hasPairInfo": false,
      "state": "disconnected"
    ] as [String: Any])
    #endif
  }

  // MARK: - setDeviceBTSwitch

  func handleSetDeviceBTSwitch(_ open: Bool, promise: Promise) {
    #if targetEnvironment(simulator)
    promise.resolve(nil)
    #else
    guard self.isInitialized else {
      promise.reject("SDK_NOT_INITIALIZED", "SDK not initialized")
      return
    }
    guard let peripheralManage = self.peripheralManage else {
      promise.reject("DEVICE_NOT_CONNECTED", "No device connected")
      return
    }
    guard self.connectionState == .ready else {
      promise.reject("DEVICE_NOT_READY", "Device is not ready")
      return
    }

    guard let model = peripheralManage.peripheralModel,
          model.CPUType == 1 else {
      promise.reject("CAPABILITY_UNSUPPORTED", "Band does not support classic Bluetooth")
      return
    }

    if open {
      // iOS only has open — no close API
      peripheralManage.veepooSDK_openDeviceBTSwitch()

      // Set up the BT state change callback to emit events
      peripheralManage.VPBTConnectStateChangeBlock = { [weak self] btState, btSwitchOpen, mediaSwitchOpen in
        guard let self = self else { return }
        let stateStr: String
        switch btState {
        case .disConnect:
          stateStr = "disconnected"
        case .connected:
          stateStr = "connected"
        case .advertising:
          stateStr = "pairing"
        @unknown default:
          stateStr = "disconnected"
        }
        self.sendEvent(DEVICE_BT_STATE_CHANGED, [
          "deviceId": self.connectedDeviceId ?? "",
          "state": stateStr,
          "btSwitchOpen": btSwitchOpen,
          "mediaSwitchOpen": mediaSwitchOpen
        ])
      }

      promise.resolve(nil)
    } else {
      // iOS has no closeDeviceBTSwitch API
      promise.reject("CAPABILITY_UNSUPPORTED", "Closing Band Bluetooth is not supported on iOS")
    }
    #endif
  }
}
