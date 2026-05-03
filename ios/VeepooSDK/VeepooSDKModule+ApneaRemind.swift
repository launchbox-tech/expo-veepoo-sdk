import ExpoModulesCore
import VeepooBleSDK

extension VeepooSDKModule {

  private func apneaModelToDict(_ m: VPOxygenApneaRemindModel) -> [String: Any] {
    return [
      "enabled": m.state == 1,
      "threshold": m.lowOxygenValue
    ]
  }

  // MARK: - readApneaRemindSettings

  func handleReadApneaRemindSettings(promise: Promise) {
    #if targetEnvironment(simulator)
    promise.resolve(["enabled": false, "threshold": 90])
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
    guard let model = peripheralManage.peripheralModel, model.oxygenType == 4 else {
      promise.reject("CAPABILITY_UNSUPPORTED", "Band does not support SpO2 apnea remind")
      return
    }
    let remindModel = VPOxygenApneaRemindModel()
    peripheralManage.veepooSDKSettingOxygenApneaRemind(remindModel, settingMode: 2) { [weak self] result in
      guard let self = self, let result = result else {
        promise.reject("READ_FAILED", "Apnea remind read returned nil")
        return
      }
      let dict = self.apneaModelToDict(result)
      self.sendEvent(APNEA_REMIND_DATA, [
        "deviceId": self.connectedDeviceId ?? "",
        "data": dict
      ])
      promise.resolve(dict)
    } failureResult: {
      promise.reject("CAPABILITY_UNSUPPORTED", "Band does not support SpO2 apnea remind")
    }
    #endif
  }

  // MARK: - setApneaRemindSettings

  func handleSetApneaRemindSettings(_ settings: [String: Any], promise: Promise) {
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
    guard let model = peripheralManage.peripheralModel, model.oxygenType == 4 else {
      promise.reject("CAPABILITY_UNSUPPORTED", "Band does not support SpO2 apnea remind")
      return
    }
    let remindModel = VPOxygenApneaRemindModel()
    remindModel.state = (settings["enabled"] as? Bool) == true ? 1 : 2
    remindModel.lowOxygenValue = (settings["threshold"] as? Int) ?? 90
    remindModel.defaultTime = true
    peripheralManage.veepooSDKSettingOxygenApneaRemind(remindModel, settingMode: 1) { _ in
      promise.resolve(nil)
    } failureResult: {
      promise.reject("SET_FAILED", "Set apnea remind failed")
    }
    #endif
  }
}
