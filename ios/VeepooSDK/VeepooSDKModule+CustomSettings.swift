import ExpoModulesCore
import VeepooBleSDK

extension VeepooSDKModule {

  // MARK: - readCustomSettings

  func handleReadCustomSettings(promise: Promise) {
    #if targetEnvironment(simulator)
    promise.resolve([
      "temperatureUnit": "celsius",
      "bloodGlucoseUnit": "mmolL",
      "skinTone": 1
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

    var tempUnit: String? = nil
    var glucoseUnit: String? = nil
    var skinTone: Int? = nil
    var errorOccurred = false

    func emitIfComplete() {
      guard !errorOccurred, let t = tempUnit, let g = glucoseUnit, let s = skinTone else { return }
      let data: [String: Any] = ["temperatureUnit": t, "bloodGlucoseUnit": g, "skinTone": s]
      self.sendEvent(CUSTOM_SETTINGS_DATA, [
        "deviceId": self.connectedDeviceId ?? "",
        "data": data
      ])
      promise.resolve(data)
    }

    peripheralManage.veepooSDKSettingBaseFunctionType(.temperatureUnit, settingState: .readFunctionState) { state in
      guard !errorOccurred else { return }
      switch state {
      case .functionCompleteUnknown:
        errorOccurred = true
        promise.reject("CAPABILITY_UNSUPPORTED", "Band does not support temperature unit setting")
      case .functionCompleteOpen:
        tempUnit = "celsius"
        emitIfComplete()
      case .functionCompleteClose:
        tempUnit = "fahrenheit"
        emitIfComplete()
      case .functionCompleteFailure:
        errorOccurred = true
        promise.reject("READ_FAILED", "Failed to read temperature unit")
      default:
        tempUnit = "celsius"
        emitIfComplete()
      }
    }

    peripheralManage.veepooSDKSettingBaseFunctionType(.bloodGlucoseUnit, settingState: .readFunctionState) { state in
      guard !errorOccurred else { return }
      switch state {
      case .functionCompleteUnknown:
        glucoseUnit = "mmolL"
        emitIfComplete()
      case .functionCompleteOpen:
        glucoseUnit = "mmolL"
        emitIfComplete()
      case .functionCompleteClose:
        glucoseUnit = "mgdL"
        emitIfComplete()
      default:
        glucoseUnit = "mmolL"
        emitIfComplete()
      }
    }

    peripheralManage.veepooSDKSettingBaseFunctionType(.ledGrade, settingState: .readFunctionState) { state in
      guard !errorOccurred else { return }
      let rawValue = state.rawValue
      if rawValue >= 1 && rawValue <= 6 {
        skinTone = rawValue
      } else {
        skinTone = state == .functionCompleteClose ? 6 : 1
      }
      emitIfComplete()
    }
    #endif
  }

  // MARK: - writeCustomSettings

  func handleWriteCustomSettings(_ settings: [String: Any], promise: Promise) {
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

    var pendingCount = 0
    var errorOccurred = false

    func tryResolve() {
      pendingCount -= 1
      if pendingCount == 0 && !errorOccurred {
        promise.resolve(nil)
      }
    }

    if let tempUnitStr = settings["temperatureUnit"] as? String {
      let state: VPSettingFunctionState = tempUnitStr == "fahrenheit" ? .settingFunctionClose : .settingFunctionOpen
      pendingCount += 1
      peripheralManage.veepooSDKSettingBaseFunctionType(.temperatureUnit, settingState: state) { completeState in
        guard !errorOccurred else { return }
        switch completeState {
        case .functionCompleteFailure:
          errorOccurred = true
          promise.reject("SET_FAILED", "Failed to set temperature unit")
        default:
          tryResolve()
        }
      }
    }

    if let glucoseUnitStr = settings["bloodGlucoseUnit"] as? String {
      let state: VPSettingFunctionState = glucoseUnitStr == "mgdL" ? .settingFunctionClose : .settingFunctionOpen
      pendingCount += 1
      peripheralManage.veepooSDKSettingBaseFunctionType(.bloodGlucoseUnit, settingState: state) { completeState in
        guard !errorOccurred else { return }
        switch completeState {
        case .functionCompleteFailure:
          errorOccurred = true
          promise.reject("SET_FAILED", "Failed to set blood glucose unit")
        default:
          tryResolve()
        }
      }
    }

    if let skinToneValue = settings["skinTone"] as? Int {
      let clamped = max(1, min(6, skinToneValue))
      if let state = VPSettingFunctionState(rawValue: clamped) {
        pendingCount += 1
        peripheralManage.veepooSDKSettingBaseFunctionType(.ledGrade, settingState: state) { completeState in
          guard !errorOccurred else { return }
          switch completeState {
          case .functionCompleteFailure:
            errorOccurred = true
            promise.reject("SET_FAILED", "Failed to set skin tone")
          default:
            tryResolve()
          }
        }
      }
    }

    if pendingCount == 0 {
      promise.resolve(nil)
    }
    #endif
  }
}
