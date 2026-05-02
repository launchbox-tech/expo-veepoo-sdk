import ExpoModulesCore
import VeepooBleSDK

extension VeepooSDKModule {
  private func brightModelToDict(_ m: VPDeviceBrightModel) -> [String: Any] {
    return [
      "nightStartHour": m.firstBrightStartHour,
      "nightStartMinute": m.firstBrightStartMinute,
      "nightEndHour": m.firstBrightEndHour,
      "nightEndMinute": m.firstBrightEndMinute,
      "nightLevel": m.firstBrightValue,
      "dayLevel": m.otherBrightValue,
      "autoAdjust": m.isAutomatic,
      "maxLevel": m.maxBrightValue,
      "lastManualDayLevel": m.lastManualBrightValue
    ]
  }

  private func applyBrightDict(_ d: [String: Any], to model: VPDeviceBrightModel) {
    model.firstBrightStartHour = (d["nightStartHour"] as? Int) ?? 22
    model.firstBrightStartMinute = (d["nightStartMinute"] as? Int) ?? 0
    model.firstBrightEndHour = (d["nightEndHour"] as? Int) ?? 7
    model.firstBrightEndMinute = (d["nightEndMinute"] as? Int) ?? 0
    model.firstBrightValue = (d["nightLevel"] as? Int) ?? 2
    model.otherBrightValue = (d["dayLevel"] as? Int) ?? 4
    model.isAutomatic = (d["autoAdjust"] as? Bool) ?? false
    model.maxBrightValue = (d["maxLevel"] as? Int) ?? 5
    if let last = d["lastManualDayLevel"] as? Int {
      model.lastManualBrightValue = last
    }
  }

  func handleReadScreenLightSettings(promise: Promise) {
    #if targetEnvironment(simulator)
    promise.resolve([
      "nightStartHour": 22,
      "nightStartMinute": 0,
      "nightEndHour": 7,
      "nightEndMinute": 0,
      "nightLevel": 2,
      "dayLevel": 4,
      "autoAdjust": false,
      "maxLevel": 5,
      "lastManualDayLevel": 4
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
    let model = VPDeviceBrightModel()
    peripheralManage.veepooSDKSettingBright(withBrightModel: model, settingMode: 2, successResult: { bright in
      guard let bright = bright else {
        promise.reject("READ_FAILED", "Screen brightness read returned nil")
        return
      }
      promise.resolve(self.brightModelToDict(bright))
    }, failureResult: {
      promise.reject("READ_FAILED", "Read screen brightness failed")
    })
    #endif
  }

  func handleSetScreenLightSettings(_ settings: [String: Any], promise: Promise) {
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
    let model = VPDeviceBrightModel()
    self.applyBrightDict(settings, to: model)
    peripheralManage.veepooSDKSettingBright(withBrightModel: model, settingMode: 1, successResult: { _ in
      promise.resolve(nil)
    }, failureResult: {
      promise.reject("SET_FAILED", "Set screen brightness failed")
    })
    #endif
  }

  func handleReadScreenLightDuration(promise: Promise) {
    #if targetEnvironment(simulator)
    promise.resolve([
      "currentSeconds": 10,
      "minSeconds": 5,
      "maxSeconds": 60,
      "recommendSeconds": 10
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
    let durationType = peripheralManage.peripheralModel?.screenDurationType ?? 0
    if durationType != 1 {
      promise.reject("CAPABILITY_UNSUPPORTED", "Band does not support screen-on duration")
      return
    }
    let model = VPScreenDurationModel()
    peripheralManage.veepooSDKSettingScreenDuration(model, settingMode: 2, successResult: { m in
      guard let m = m else {
        promise.reject("READ_FAILED", "Screen duration read returned nil")
        return
      }
      promise.resolve([
        "currentSeconds": m.currentDuration,
        "minSeconds": m.minDuration,
        "maxSeconds": m.maxDuration,
        "recommendSeconds": m.defaultDuration
      ])
    }, failureResult: {
      promise.reject("READ_FAILED", "Read screen duration failed")
    })
    #endif
  }

  func handleSetScreenLightDuration(_ seconds: Double, promise: Promise) {
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
    let durationType = peripheralManage.peripheralModel?.screenDurationType ?? 0
    if durationType != 1 {
      promise.reject("CAPABILITY_UNSUPPORTED", "Band does not support screen-on duration")
      return
    }
    let model = VPScreenDurationModel()
    model.currentDuration = Int(seconds.rounded())
    peripheralManage.veepooSDKSettingScreenDuration(model, settingMode: 1, successResult: { _ in
      promise.resolve(nil)
    }, failureResult: {
      promise.reject("SET_FAILED", "Set screen duration failed")
    })
    #endif
  }
}
