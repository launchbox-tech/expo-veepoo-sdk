import ExpoModulesCore
import VeepooBleSDK

extension VeepooSDKModule {
  func handleReadBattery(promise: Promise) {
    #if targetEnvironment(simulator)
    promise.resolve(["level": 88, "percent": 88, "powerModel": 0, "state": 1, "bat": 0, "isPercent": true, "isLowBattery": false])
    #else
    guard let peripheralManage = self.peripheralManage else {
      promise.reject("SDK_NOT_INITIALIZED", "Peripheral manager is nil")
      return
    }
    var hasResolved = false
    peripheralManage.veepooSDKReadDeviceBatteryAndChargeInfo { isPercent, chargeState, percenTypeIsLowBat, battery in
      if hasResolved { return }
      hasResolved = true
      let payload: [String: Any] = [
        "level": battery,
        "percent": isPercent ? battery : 0,
        "powerModel": 0,
        "state": chargeState.rawValue,
        "bat": 0,
        "isPercent": isPercent,
        "isLowBattery": percenTypeIsLowBat
      ]
      self.sendEvent(BATTERY_DATA, ["deviceId": self.connectedDeviceId ?? "", "data": payload])
      promise.resolve(payload)
    }
    #endif
  }
}
