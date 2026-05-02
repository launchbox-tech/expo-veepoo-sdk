import ExpoModulesCore
import VeepooBleSDK

extension VeepooSDKModule {
  private func raiseHandModelToDict(_ m: VPDeviceRaiseHandModel) -> [String: Any] {
    var out: [String: Any] = [
      "startHour": m.raiseHandStartHour,
      "startMinute": m.raiseHandStartMinute,
      "endHour": m.raiseHandEndHour,
      "endMinute": m.raiseHandEndMinute,
      "enabled": m.raiseHandState == 1,
      "sensitivityLevel": m.sensitive,
      "supportsCustomTimeWindow": true
    ]
    if m.defaultSensitive != 0 {
      out["defaultSensitivityLevel"] = m.defaultSensitive
    }
    return out
  }

  private func applyWristFlipDict(_ d: [String: Any], to model: VPDeviceRaiseHandModel) {
    let sh = UInt((d["startHour"] as? Int) ?? 22)
    let sm = UInt((d["startMinute"] as? Int) ?? 0)
    let eh = UInt((d["endHour"] as? Int) ?? 8)
    let em = UInt((d["endMinute"] as? Int) ?? 0)
    let state: UInt = (d["enabled"] as? Bool) == true ? 1 : 0
    let sens = UInt((d["sensitivityLevel"] as? Int) ?? 5)
    model.raiseHandStartHour = sh
    model.raiseHandStartMinute = sm
    model.raiseHandEndHour = eh
    model.raiseHandEndMinute = em
    model.raiseHandState = state
    model.sensitive = sens
  }

  func handleReadWristFlipWakeSettings(promise: Promise) {
    #if targetEnvironment(simulator)
    promise.resolve([
      "startHour": 22,
      "startMinute": 0,
      "endHour": 8,
      "endMinute": 0,
      "enabled": true,
      "sensitivityLevel": 5,
      "supportsCustomTimeWindow": true
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
    let model = VPDeviceRaiseHandModel()
    peripheralManage.veepooSDKSettingRaiseHand(
      withRaiseHandModel: model,
      settingMode: 2,
      successResult: { result in
        guard let result = result else {
          promise.reject("READ_FAILED", "Wrist-flip wake read returned nil")
          return
        }
        promise.resolve(self.raiseHandModelToDict(result))
      },
      failureResult: {
        promise.reject("CAPABILITY_UNSUPPORTED", "Band may not support wrist-flip wake")
      }
    )
    #endif
  }

  func handleSetWristFlipWakeSettings(_ settings: [String: Any], promise: Promise) {
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
    let model = VPDeviceRaiseHandModel()
    self.applyWristFlipDict(settings, to: model)
    let mode: UInt = (settings["enabled"] as? Bool) == true ? 1 : 0
    peripheralManage.veepooSDKSettingRaiseHand(
      withRaiseHandModel: model,
      settingMode: mode,
      successResult: { _ in
        promise.resolve(nil)
      },
      failureResult: {
        promise.reject("SET_FAILED", "Set wrist-flip wake failed")
      }
    )
    #endif
  }
}
