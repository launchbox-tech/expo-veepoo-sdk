import ExpoModulesCore
import VeepooBleSDK

extension VeepooSDKModule {
  private func dialKeyToVpType(_ key: String) -> VPDeviceDialType {
    switch key.lowercased() {
    case "market":
      return VPDeviceDialType(rawValue: 1)!
    case "photo":
      return VPDeviceDialType(rawValue: 2)!
    default:
      return VPDeviceDialType(rawValue: 0)!
    }
  }

  private func vpDialTypeToKey(_ t: VPDeviceDialType) -> String {
    switch t.rawValue {
    case 1: return "market"
    case 2: return "photo"
    default: return "default"
    }
  }

  private func extractDialKey(_ options: [String: Any]?) -> String {
    guard let raw = options?["dialType"] as? String else { return "default" }
    switch raw.lowercased().trimmingCharacters(in: .whitespacesAndNewlines) {
    case "market": return "market"
    case "photo": return "photo"
    default: return "default"
    }
  }

  func handleReadWatchFaceStyle(_ options: [String: Any]?, promise: Promise) {
    #if targetEnvironment(simulator)
    promise.resolve([
      "dialType": "default",
      "screenIndex": 0,
      "operationSuccess": true
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
    let dial = dialKeyToVpType(extractDialKey(options))
    peripheralManage.veepooSDKSettingDeviceScreenStyle(
      0,
      settingMode: 2,
      dialType: dial,
      result: { dt, screenStyle, ok in
        DispatchQueue.main.async {
          if ok {
            promise.resolve([
              "dialType": self.vpDialTypeToKey(dt),
              "screenIndex": screenStyle,
              "operationSuccess": true
            ])
          } else {
            promise.reject("READ_FAILED", "Read watch face style failed")
          }
        }
      }
    )
    #endif
  }

  func handleSetWatchFaceStyle(_ settings: [String: Any], promise: Promise) {
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
    let idx: Int? = {
      if let i = settings["screenIndex"] as? Int { return i }
      if let d = settings["screenIndex"] as? Double { return Int(d) }
      return nil
    }()
    guard let screenIndex = idx else {
      promise.reject("INVALID_ARGUMENT", "screenIndex is required")
      return
    }
    let dial = dialKeyToVpType(extractDialKey(settings))
    peripheralManage.veepooSDKSettingDeviceScreenStyle(
      screenIndex,
      settingMode: 1,
      dialType: dial,
      result: { _, _, ok in
        DispatchQueue.main.async {
          if ok {
            promise.resolve(nil)
          } else {
            promise.reject("SET_FAILED", "Set watch face style failed")
          }
        }
      }
    )
    #endif
  }
}
