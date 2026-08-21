import ExpoModulesCore
import VeepooBleSDK

extension VeepooSDKModule {
  func handleReadHeartRateAlarm(promise: Promise) {
    #if targetEnvironment(simulator)
    rejectUnavailableOnSimulator(promise, "readHeartRateAlarm")
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
    let promiseBox = self.makePromiseBox(promise)
    peripheralManage.veepooSDKSettingDeviceHeartAlarm(
      with: model,
      settingMode: 2,
      successResult: { result in
        guard let m = result else {
          promiseBox.reject("READ_FAILED", "Heart alarm read returned nil")
          return
        }
        promiseBox.resolve([
          "enabled": m.isOpen,
          "highThreshold": Int(m.heartMaxValue),
          "lowThreshold": Int(m.heartMinValue)
        ])
      },
      failureResult: {
        promiseBox.reject("READ_FAILED", "Failed to read heart rate alarm")
      }
    )
    #endif
  }

  func handleSetHeartRateAlarm(_ alarm: [String: Any], promise: Promise) {
    #if targetEnvironment(simulator)
    rejectUnavailableOnSimulator(promise, "setHeartRateAlarm")
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

    let promiseBox = self.makePromiseBox(promise)
    peripheralManage.veepooSDKSettingDeviceHeartAlarm(
      with: model,
      settingMode: mode,
      successResult: { _ in
        promiseBox.resolve("success")
      },
      failureResult: {
        promiseBox.resolve("fail")
      }
    )
    #endif
  }
}
