import ExpoModulesCore
import VeepooBleSDK

extension VeepooSDKModule {
  private func findDevicePhaseLabel(_ state: VPSearchDeviceFunctionState) -> String {
    switch state {
    case .unsupported:
      return "unsupported"
    case .enter:
      return "searching"
    case .exit:
      return "stopped"
    case .timeout:
      return "timeout"
    @unknown default:
      return "unsupported"
    }
  }

  private func emitFindDeviceState(_ state: VPSearchDeviceFunctionState) {
    let phase = findDevicePhaseLabel(state)
    let raw = state.rawValue
    self.sendEvent(FIND_DEVICE_STATE, [
      "deviceId": self.connectedDeviceId ?? "",
      "phase": phase,
      "rawState": raw
    ])
  }

  func handleStartFindDevice(promise: Promise) {
    #if targetEnvironment(simulator)
    promise.resolve(nil)
    self.sendEvent(FIND_DEVICE_STATE, [
      "deviceId": self.connectedDeviceId ?? "simulator",
      "phase": "searching",
      "rawState": 1
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
    let support = peripheralManage.peripheralModel?.searchDeviceFunction ?? 0
    if support == 0 {
      promise.reject(
        "CAPABILITY_UNSUPPORTED",
        "Band does not support find-device-from-phone (searchDeviceFunction)"
      )
      return
    }

    var promiseSettled = false
    peripheralManage.veepooSDK_searchDeviceFuntion(withState: true) { [weak self] _, state in
      guard let self = self else { return }
      if !promiseSettled {
        promiseSettled = true
        if state == .unsupported {
          promise.reject("CAPABILITY_UNSUPPORTED", "Band does not support find-device-from-phone")
        } else {
          promise.resolve(nil)
        }
      }
      self.emitFindDeviceState(state)
    }
    #endif
  }

  func handleStopFindDevice(promise: Promise) {
    #if targetEnvironment(simulator)
    promise.resolve(nil)
    self.sendEvent(FIND_DEVICE_STATE, [
      "deviceId": self.connectedDeviceId ?? "simulator",
      "phase": "stopped",
      "rawState": 2
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

    var promiseSettled = false
    peripheralManage.veepooSDK_searchDeviceFuntion(withState: false) { [weak self] _, state in
      guard let self = self else { return }
      if !promiseSettled {
        promiseSettled = true
        if state == .unsupported {
          promise.reject("CAPABILITY_UNSUPPORTED", "Band does not support find-device-from-phone")
        } else {
          promise.resolve(nil)
        }
      }
      self.emitFindDeviceState(state)
    }
    #endif
  }
}
