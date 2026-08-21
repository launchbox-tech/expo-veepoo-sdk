import ExpoModulesCore
import VeepooBleSDK

extension VeepooSDKModule {

  // MARK: - Helpers

  // Reads a vendor-typed property, so it is compiled out on the simulator —
  // every call site is inside a matching guard.
  #if !targetEnvironment(simulator)
  private func cameraSupported() -> Bool {
    // VeepooBleSDK exposes no camera-capability flag on VPPeripheralModel;
    // gate only on a connected model and let the device respond.
    return peripheralManage?.peripheralModel != nil
  }
  #endif

  // MARK: - enterCameraMode

  func handleEnterCameraMode(promise: Promise) {
    #if targetEnvironment(simulator)
    promise.resolve(nil)
    self.sendEvent(CAMERA_SHUTTER, [
      "deviceId": self.connectedDeviceId ?? "simulator",
      "status": "canTake"
    ])
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
    guard cameraSupported() else {
      promise.reject("CAPABILITY_UNSUPPORTED", "Band does not support camera remote")
      return
    }

    var promiseSettled = false
    let promiseBox = self.makePromiseBox(promise)
    peripheralManage.veepooSDKSettingCameraType(.enter) { [weak self] cameraType in
      guard let self = self else { return }
      switch cameraType {
      case .enter:
        if !promiseSettled { promiseSettled = true; promiseBox.resolve(nil) }
      case .photo:
        self.sendEvent(CAMERA_SHUTTER, [
          "deviceId": self.connectedDeviceId ?? "",
          "status": "canTake"
        ])
      case .exit:
        break
      @unknown default:
        break
      }
    }
    #endif
  }

  // MARK: - exitCameraMode

  func handleExitCameraMode(promise: Promise) {
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

    var promiseSettled = false
    let promiseBox = self.makePromiseBox(promise)
    peripheralManage.veepooSDKSettingCameraType(.exit) { cameraType in
      if !promiseSettled {
        promiseSettled = true
        promiseBox.resolve(nil)
      }
    }
    #endif
  }

  // MARK: - setMusicControlEnabled

  func handleSetMusicControlEnabled(_ enabled: Bool, promise: Promise) {
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

    // VPSettingFunctionState/CompleteState don't strip to .open/.close in Swift
    // (the VPReadFunctionState case breaks the common prefix), so use rawValue.
    // VPSettingFunctionState: 1=open, 2=close.
    let state = VPSettingFunctionState(rawValue: enabled ? 1 : 2)!
    let promiseBox = self.makePromiseBox(promise)
    peripheralManage.veepooSDKSettingBaseFunctionType(.musicControl, settingState: state) { completeState in
      // VPSettingFunctionCompleteState: 0=unknown,1=open,2=close,3=failure,4=complete.
      switch completeState.rawValue {
      case 1, 2, 4:
        promiseBox.resolve(nil)
      case 3:
        promiseBox.reject("OPERATION_FAILED", "Set music control failed")
      case 0:
        promiseBox.reject("CAPABILITY_UNSUPPORTED", "Band does not support music control toggle")
      default:
        promiseBox.resolve(nil)
      }
    }
    #endif
  }

  // MARK: - pushMusicData (iOS: not supported)

  func handlePushMusicData(_: [String: Any], promise: Promise) {
    promise.reject("CAPABILITY_UNSUPPORTED", "pushMusicData is not supported on iOS")
  }
}
