import ExpoModulesCore
import VeepooBleSDK

extension VeepooSDKModule {

  private func jsTypeToVPRemindType(_ type: String) -> VPDeviceHealthRemindType {
    switch type {
    case "sedentary": return .longSeat
    case "drinkWater": return .drinkWater
    case "lookFarAway": return .lookFarAway
    case "sport": return .sport
    case "takeMedicine": return .takeMedicine
    case "read": return .read
    case "trip": return .trip
    case "washHands": return .washHands
    default: return .all
    }
  }

  private func vpRemindTypeToJs(_ type: VPDeviceHealthRemindType) -> String {
    switch type {
    case .longSeat: return "sedentary"
    case .drinkWater: return "drinkWater"
    case .lookFarAway: return "lookFarAway"
    case .sport: return "sport"
    case .takeMedicine: return "takeMedicine"
    case .read: return "read"
    case .trip: return "trip"
    case .washHands: return "washHands"
    default: return "sedentary"
    }
  }

  private func healthRemindModelToDict(_ m: VPDeviceHealthRemindModel) -> [String: Any] {
    return [
      "type": vpRemindTypeToJs(m.type),
      "startHour": m.startHour,
      "startMinute": m.startMinute,
      "endHour": m.endHour,
      "endMinute": m.endMinute,
      "interval": m.remindInterval,
      "enabled": m.open
    ]
  }

  // MARK: - readHealthReminder

  func handleReadHealthReminder(type typeStr: String, promise: Promise) {
    #if targetEnvironment(simulator)
    promise.resolve([
      "type": typeStr,
      "startHour": 8,
      "startMinute": 0,
      "endHour": 20,
      "endMinute": 0,
      "interval": 60,
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
    let remindType = jsTypeToVPRemindType(typeStr)
    var promiseSettled = false
    peripheralManage.veepooSDKSettingHealthRemind(with: remindType, opCode: 2, remindModel: nil) { [weak self] success, model in
      guard let self = self, !promiseSettled else { return }
      promiseSettled = true
      if success, let model = model {
        let dict = self.healthRemindModelToDict(model)
        self.sendEvent(HEALTH_REMIND_DATA, [
          "deviceId": self.connectedDeviceId ?? "",
          "data": dict
        ])
        promise.resolve(dict)
      } else {
        promise.reject("OPERATION_FAILED", "Read health reminder failed")
      }
    } deviceInfoDidChange: { [weak self] model in
      guard let self = self, let model = model else { return }
      self.sendEvent(HEALTH_REMIND_DATA, [
        "deviceId": self.connectedDeviceId ?? "",
        "data": self.healthRemindModelToDict(model)
      ])
    }
    #endif
  }

  // MARK: - setHealthReminder

  func handleSetHealthReminder(_ reminder: [String: Any], promise: Promise) {
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
    let typeStr = reminder["type"] as? String ?? "sedentary"
    let remindType = jsTypeToVPRemindType(typeStr)
    let model = VPDeviceHealthRemindModel()
    model.type = remindType
    model.startHour = (reminder["startHour"] as? Int) ?? 8
    model.startMinute = (reminder["startMinute"] as? Int) ?? 0
    model.endHour = (reminder["endHour"] as? Int) ?? 20
    model.endMinute = (reminder["endMinute"] as? Int) ?? 0
    model.remindInterval = (reminder["interval"] as? Int) ?? 60
    model.open = (reminder["enabled"] as? Bool) ?? true
    var promiseSettled = false
    peripheralManage.veepooSDKSettingHealthRemind(with: remindType, opCode: 1, remindModel: model) { [weak self] success, _ in
      guard !promiseSettled else { return }
      promiseSettled = true
      if success {
        promise.resolve(nil)
      } else {
        promise.reject("OPERATION_FAILED", "Set health reminder failed")
      }
    } deviceInfoDidChange: { [weak self] model in
      guard let self = self, let model = model else { return }
      self.sendEvent(HEALTH_REMIND_DATA, [
        "deviceId": self.connectedDeviceId ?? "",
        "data": self.healthRemindModelToDict(model)
      ])
    }
    #endif
  }
}
