import ExpoModulesCore
import VeepooBleSDK

private func repeatDecimalToBinaryString(_ repeatState: String) -> String {
  let decimal = Int(repeatState) ?? 0
  let binary = String(decimal, radix: 2)
  let padded = String(repeating: "0", count: max(0, 7 - binary.count)) + binary
  return String(padded.suffix(7))
}

private func isoWeekdaysToRepeatDecimal(_ days: [Any]) -> String {
  var decimal = 0
  for item in days {
    if let d = (item as? NSNumber)?.intValue, d >= 1, d <= 7 {
      decimal |= (1 << (d - 1))
    }
  }
  return String(decimal)
}

private func newAlarmModelToDict(_ model: VPDeviceNewAlarmModel) -> [String: Any] {
  var dict: [String: Any] = [
    "id": Int(model.alarmID ?? "0") ?? 0,
    "hour": Int(model.alarmHour ?? "0") ?? 0,
    "minute": Int(model.alarmMinute ?? "0") ?? 0,
    "enabled": (model.alarmState ?? "0") == "1",
    "repeat": repeatDecimalToBinaryString(model.repeatState ?? "0")
  ]
  if let scene = model.alarmScene, !scene.isEmpty, let sceneInt = Int(scene) {
    dict["scene"] = sceneInt
  }
  return dict
}

private func textAlarmModelToDict(_ model: VPDeviceTextAlarmModel) -> [String: Any] {
  var dict: [String: Any] = [
    "id": Int(model.alarmID ?? "0") ?? 0,
    "hour": Int(model.alarmHour ?? "0") ?? 0,
    "minute": Int(model.alarmMinute ?? "0") ?? 0,
    "enabled": (model.alarmState ?? "0") == "1",
    "repeat": repeatDecimalToBinaryString(model.repeatState ?? "0"),
    "type": "text"
  ]
  if let text = model.alarmText, !text.isEmpty {
    dict["text"] = text
  }
  return dict
}

extension VeepooSDKModule {
  func handleReadAlarms(promise: Promise) {
    #if !targetEnvironment(simulator)
    guard self.isInitialized else {
      promise.reject("SDK_NOT_INITIALIZED", "SDK not initialized")
      return
    }

    guard let peripheralManage = self.peripheralManage else {
      promise.reject("DEVICE_NOT_CONNECTED", "No device connected")
      return
    }

    let defaultModel = VPDeviceNewAlarmModel()
    peripheralManage.veepooSDKSettingDeviceNewAlarmWithNewAlarmModel(
      defaultModel,
      settingMode: 2,
      successResult: { [weak self] alarmArray in
        guard let self = self else { return }
        let alarms = (alarmArray as? [VPDeviceNewAlarmModel] ?? []).map { newAlarmModelToDict($0) }
        self.sendEvent(ALARM_DATA, [
          "deviceId": self.connectedDeviceId ?? "",
          "alarms": alarms
        ])
        promise.resolve(alarms)
      },
      failureResult: {
        promise.reject("READ_FAILED", "Failed to read alarms")
      }
    )
    #else
    promise.resolve([])
    #endif
  }

  func handleSetAlarm(_ alarm: [String: Any], promise: Promise) {
    #if !targetEnvironment(simulator)
    guard self.isInitialized else {
      promise.reject("SDK_NOT_INITIALIZED", "SDK not initialized")
      return
    }

    guard let peripheralManage = self.peripheralManage else {
      promise.reject("DEVICE_NOT_CONNECTED", "No device connected")
      return
    }

    let alarmId = String(alarm["id"] as? Int ?? 0)
    let hour = String(alarm["hour"] as? Int ?? 0)
    let minute = String(alarm["minute"] as? Int ?? 0)
    let enabled = alarm["enabled"] as? Bool ?? true
    let scene = String(alarm["scene"] as? Int ?? 0)
    let text = alarm["text"] as? String
    let repeatDays = alarm["repeat"] as? [Any] ?? []
    let repeatDecimal = isoWeekdaysToRepeatDecimal(repeatDays)

    let supportsTextAlarm: Bool = {
      if let p1 = self.cachedDeviceFunctions["package1"] as? [String: Any] {
        return p1["textAlarm"] as? String == "support"
      }
      return false
    }()

    if let textContent = text, !textContent.isEmpty, supportsTextAlarm {
      let textModel = VPDeviceTextAlarmModel()
      textModel.alarmID = alarmId
      textModel.alarmHour = hour
      textModel.alarmMinute = minute
      textModel.alarmState = enabled ? "1" : "0"
      textModel.repeatState = repeatDecimal
      textModel.alarmText = textContent
      textModel.alarmDate = "0000-00-00"

      peripheralManage.veepooSDKSettingDeviceTextAlarmWithTextAlarmModel(
        textModel,
        settingMode: VPDeviceTextAlarmSettingModelAddOrChange,
        successResult: { _ in promise.resolve("success") },
        failureResult: { promise.resolve("fail") }
      )
    } else {
      let alarmModel = VPDeviceNewAlarmModel()
      alarmModel.alarmID = alarmId
      alarmModel.alarmHour = hour
      alarmModel.alarmMinute = minute
      alarmModel.alarmState = enabled ? "1" : "0"
      alarmModel.repeatState = repeatDecimal
      alarmModel.alarmScene = scene
      alarmModel.alarmDate = "0000-00-00"

      peripheralManage.veepooSDKSettingDeviceNewAlarmWithNewAlarmModel(
        alarmModel,
        settingMode: 1,
        successResult: { _ in promise.resolve("success") },
        failureResult: { promise.resolve("fail") }
      )
    }
    #else
    promise.resolve("success")
    #endif
  }

  func handleDeleteAlarm(_ alarmId: Int, promise: Promise) {
    #if !targetEnvironment(simulator)
    guard self.isInitialized else {
      promise.reject("SDK_NOT_INITIALIZED", "SDK not initialized")
      return
    }

    guard let peripheralManage = self.peripheralManage else {
      promise.reject("DEVICE_NOT_CONNECTED", "No device connected")
      return
    }

    let alarmModel = VPDeviceNewAlarmModel()
    alarmModel.alarmID = String(alarmId)
    alarmModel.alarmHour = "0"
    alarmModel.alarmMinute = "0"
    alarmModel.alarmState = "0"
    alarmModel.repeatState = "0"
    alarmModel.alarmScene = "0"
    alarmModel.alarmDate = "0000-00-00"

    peripheralManage.veepooSDKSettingDeviceNewAlarmWithNewAlarmModel(
      alarmModel,
      settingMode: 0,
      successResult: { _ in promise.resolve("success") },
      failureResult: { promise.resolve("fail") }
    )
    #else
    promise.resolve("success")
    #endif
  }
}
