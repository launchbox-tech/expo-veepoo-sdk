import ExpoModulesCore
import VeepooBleSDK

extension VeepooSDKModule {

  // MARK: - Helpers

  private func cameraSupported() -> Bool {
    guard let model = peripheralManage?.peripheralModel else { return false }
    return model.camera != 0
  }

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
    peripheralManage.veepooSDKSettingCameraType(.enter) { [weak self] cameraType in
      guard let self = self else { return }
      switch cameraType {
      case .enter:
        if !promiseSettled { promiseSettled = true; promise.resolve(nil) }
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
    peripheralManage.veepooSDKSettingCameraType(.exit) { cameraType in
      if !promiseSettled {
        promiseSettled = true
        promise.resolve(nil)
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

    let state: VPSettingFunctionState = enabled ? .open : .close
    peripheralManage.veepooSDKSettingBaseFunctionType(.musicControl, settingState: state) { completeState in
      switch completeState {
      case .open, .close, .complete:
        promise.resolve(nil)
      case .failure:
        promise.reject("OPERATION_FAILED", "Set music control failed")
      case .unknown:
        promise.reject("CAPABILITY_UNSUPPORTED", "Band does not support music control toggle")
      @unknown default:
        promise.resolve(nil)
      }
    }
    #endif
  }

  // MARK: - pushMusicData (iOS: not supported)

  func handlePushMusicData(_: [String: Any], promise: Promise) {
    promise.reject("CAPABILITY_UNSUPPORTED", "pushMusicData is not supported on iOS")
  }
}
