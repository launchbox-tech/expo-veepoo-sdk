import ExpoModulesCore
import VeepooBleSDK

extension VeepooSDKModule {
  func handleReadHeartRateAlarm(promise: Promise) {
    #if targetEnvironment(simulator)
    promise.resolve([
      "enabled": false,
      "highThreshold": 120,
      "lowThreshold": 60
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

    let model = VPDeviceHeartAlarmModel()
    peripheralManage.veepooSDKSettingDeviceHeartAlarm(
      with: model,
      settingMode: 2,
      successResult: { result in
        guard let m = result else {
          promise.reject("READ_FAILED", "Heart alarm read returned nil")
          return
        }
        promise.resolve([
          "enabled": m.isOpen,
          "highThreshold": Int(m.heartMaxValue),
          "lowThreshold": Int(m.heartMinValue)
        ])
      },
      failureResult: {
        promise.reject("READ_FAILED", "Failed to read heart rate alarm")
      }
    )
    #endif
  }

  func handleSetHeartRateAlarm(_ alarm: [String: Any], promise: Promise) {
    #if targetEnvironment(simulator)
    promise.resolve("success")
    #else
    guard self.isInitialized else {
      promise.reject("SDK_NOT_INITIALIZED", "SDK not initialized")
      return
    }
    guard let peripheralManage = self.peripheralManage else {
      promise.reject("DEVICE_NOT_CONNECTED", "No device connected")
      return
    }

    let high = alarm["highThreshold"] as? Int ?? 120
    let low = alarm["lowThreshold"] as? Int ?? 60
    let enabled = alarm["enabled"] as? Bool ?? true
    let mode: UInt = enabled ? 1 : 0

    let model = VPDeviceHeartAlarmModel()
    model.heartMaxValue = UInt(max(0, high))
    model.heartMinValue = UInt(max(0, low))
    model.isOpen = enabled

    peripheralManage.veepooSDKSettingDeviceHeartAlarm(
      with: model,
      settingMode: mode,
      successResult: { _ in
        promise.resolve("success")
      },
      failureResult: {
        promise.resolve("fail")
      }
    )
    #endif
  }
}
