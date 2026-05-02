import ExpoModulesCore
import VeepooBleSDK

extension VeepooSDKModule {
  /// Raw values match `VPDeviceFemaleState` in `VPPublicDefine.h` (0…4).
  private func femaleStateToJs(_ raw: VPDeviceFemaleState) -> String {
    switch raw.rawValue {
    case 0:
      return "none"
    case 1:
      return "menstrual"
    case 2:
      return "pregnancy_prep"
    case 3:
      return "pregnancy"
    case 4:
      return "postpartum"
    default:
      return "none"
    }
  }

  private func femaleStateFromJs(_ key: String) -> VPDeviceFemaleState {
    let raw: Int
    switch key.lowercased() {
    case "menstrual", "menes":
      raw = 1
    case "pregnancy_prep", "preready":
      raw = 2
    case "pregnancy", "preing", "gestation":
      raw = 3
    case "postpartum", "mamami", "baoma":
      raw = 4
    default:
      raw = 0
    }
    if let s = VPDeviceFemaleState(rawValue: raw) {
      return s
    }
    return VPDeviceFemaleState(rawValue: 0)!
  }

  private func intFromDict(_ d: [String: Any], key: String, default def: Int) -> Int {
    guard let v = d[key] else { return def }
    if let i = v as? Int { return i }
    if let n = v as? Double { return Int(n) }
    if let n = v as? NSNumber { return n.intValue }
    return def
  }

  private func femaleModelToDict(_ m: VPDeviceFemaleModel) -> [String: Any] {
    var out: [String: Any] = [
      "status": femaleStateToJs(m.femaleState),
    ]
    if let s = m.lastMenstrualDate, !s.isEmpty {
      out["lastMenstrualDate"] = s
    }
    if m.menstrualCircle > 0 {
      out["menstrualCycleDays"] = m.menstrualCircle
    }
    if m.menstrualDays > 0 {
      out["menstrualLengthDays"] = m.menstrualDays
    }
    if m.currentMenstrualDays > 0 {
      out["currentMenstrualDays"] = m.currentMenstrualDays
    }
    if let s = m.expectedDateOfChildbirth, !s.isEmpty {
      out["expectedDeliveryDate"] = s
    }
    if let s = m.babyBirthday, !s.isEmpty {
      out["babyBirthday"] = s
    }
    out["babySex"] = m.isGirl ? "female" : "male"
    return out
  }

  private func applyWomenHealthDict(_ d: [String: Any], to m: VPDeviceFemaleModel) {
    let statusKey = ((d["status"] as? String) ?? "none").lowercased()
    m.femaleState = femaleStateFromJs(statusKey)
    if let s = d["lastMenstrualDate"] as? String, !s.isEmpty {
      m.lastMenstrualDate = s
    }
    if let s = d["expectedDeliveryDate"] as? String, !s.isEmpty {
      m.expectedDateOfChildbirth = s
    }
    if let s = d["babyBirthday"] as? String, !s.isEmpty {
      m.babyBirthday = s
    }
    m.menstrualDays = intFromDict(d, key: "menstrualLengthDays", default: 5)
    m.menstrualCircle = intFromDict(d, key: "menstrualCycleDays", default: 28)
    if d["currentMenstrualDays"] != nil {
      m.currentMenstrualDays = intFromDict(d, key: "currentMenstrualDays", default: 0)
    }
    let sex = (d["babySex"] as? String)?.lowercased()
    if sex == "male" || sex == "man" {
      m.isGirl = false
    } else if sex == "female" || sex == "woman" {
      m.isGirl = true
    }
  }

  func handleReadWomenHealthSettings(promise: Promise) {
    #if targetEnvironment(simulator)
    promise.resolve([
      "status": "none",
      "menstrualLengthDays": 5,
      "menstrualCycleDays": 28,
      "babySex": "female",
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
    let model = VPDeviceFemaleModel()
    peripheralManage.veepooSDKSettingDeviceFemale(
      withFemaleModel: model,
      settingMode: 2,
      successResult: { result in
        guard let result = result else {
          promise.reject("READ_FAILED", "Women's health read returned nil")
          return
        }
        promise.resolve(self.femaleModelToDict(result))
      },
      failureResult: {
        promise.reject("CAPABILITY_UNSUPPORTED", "Band may not support women's health settings")
      }
    )
    #endif
  }

  func handleSetWomenHealthSettings(_ settings: [String: Any], promise: Promise) {
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
    let model = VPDeviceFemaleModel()
    self.applyWomenHealthDict(settings, to: model)
    peripheralManage.veepooSDKSettingDeviceFemale(
      withFemaleModel: model,
      settingMode: 1,
      successResult: { _ in
        promise.resolve(nil)
      },
      failureResult: {
        promise.reject("OPERATION_FAILED", "Set women's health settings failed")
      }
    )
    #endif
  }
}
