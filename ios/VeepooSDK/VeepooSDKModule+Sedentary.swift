import ExpoModulesCore
import VeepooBleSDK

extension VeepooSDKModule {
  private func longSeatModelToDict(_ m: VPDeviceLongSeatModel) -> [String: Any] {
    return [
      "startHour": m.longSeatStartHour,
      "startMinute": m.longSeatStartMinute,
      "endHour": m.longSeatEndHour,
      "endMinute": m.longSeatEndMinute,
      "thresholdMinutes": m.longSeatGateValue,
      "enabled": m.longSeatState == 1
    ]
  }

  private func applySedentaryDict(_ d: [String: Any], to model: VPDeviceLongSeatModel) {
    model.longSeatStartHour = UInt((d["startHour"] as? Int) ?? 9)
    model.longSeatStartMinute = UInt((d["startMinute"] as? Int) ?? 0)
    model.longSeatEndHour = UInt((d["endHour"] as? Int) ?? 18)
    model.longSeatEndMinute = UInt((d["endMinute"] as? Int) ?? 0)
    model.longSeatGateValue = UInt((d["thresholdMinutes"] as? Int) ?? 60)
    model.longSeatState = (d["enabled"] as? Bool) == true ? 1 : 0
  }

  func handleReadSedentaryReminder(promise: Promise) {
    #if targetEnvironment(simulator)
    promise.resolve([
      "startHour": 9,
      "startMinute": 0,
      "endHour": 18,
      "endMinute": 0,
      "thresholdMinutes": 60,
      "enabled": true
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
    let model = VPDeviceLongSeatModel()
    peripheralManage.veepooSDKSettingDeviceLongSeat(
      withLongSeatModel: model,
      settingMode: 2,
      successResult: { result in
        guard let result = result else {
          promise.reject("READ_FAILED", "Sedentary read returned nil")
          return
        }
        promise.resolve(self.longSeatModelToDict(result))
      },
      failureResult: {
        promise.reject("CAPABILITY_UNSUPPORTED", "Band may not support sedentary reminder")
      }
    )
    #endif
  }

  func handleSetSedentaryReminder(_ settings: [String: Any], promise: Promise) {
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
    let model = VPDeviceLongSeatModel()
    self.applySedentaryDict(settings, to: model)
    let mode: UInt = (settings["enabled"] as? Bool) == true ? 1 : 0
    peripheralManage.veepooSDKSettingDeviceLongSeat(
      withLongSeatModel: model,
      settingMode: mode,
      successResult: { _ in
        promise.resolve(nil)
      },
      failureResult: {
        promise.reject("SET_FAILED", "Set sedentary reminder failed")
      }
    )
    #endif
  }
}
