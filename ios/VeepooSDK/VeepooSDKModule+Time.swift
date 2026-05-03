import ExpoModulesCore
import VeepooBleSDK

extension VeepooSDKModule {
  func handleSetDeviceTime(_ time: [String: Any]?, promise: Promise) {
    #if targetEnvironment(simulator)
    promise.resolve(true)
    #else
    guard let peripheralManage = self.peripheralManage else {
      promise.reject("DEVICE_NOT_CONNECTED", "No device connected")
      return
    }

    if let timeMap = time {
      let year = timeMap["year"] as? Int ?? 0
      let month = timeMap["month"] as? Int ?? 0
      let day = timeMap["day"] as? Int ?? 0
      let hour = timeMap["hour"] as? Int ?? 0
      let minute = timeMap["minute"] as? Int ?? 0
      let second = timeMap["second"] as? Int ?? 0
      peripheralManage.veepooSDKSettingTime(
        withYear: Int32(year),
        month: Int32(month),
        day: Int32(day),
        hour: Int32(hour),
        minute: Int32(minute),
        second: Int32(second),
        timeSystem: 0
      ) { success in
        promise.resolve(success)
      }
    } else {
      peripheralManage.veepooSDKSettingTime { success in
        promise.resolve(success)
      }
    }
    #endif
  }
}
