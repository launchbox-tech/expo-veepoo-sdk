import ExpoModulesCore
import VeepooBleSDK

extension VeepooSDKModule {
  func handleStartHrvTest(promise: Promise) {
    promise.reject(
      "CAPABILITY_UNSUPPORTED",
      "iOS VeepooBleSDK (this bundle) has no public realtime HRV manual-test API comparable to Android readDeviceManualData(HRV); use historical HRV sync or Android. See docs/vendor-api/vendor-parity-matrix.md (HRV row)."
    )
  }

  func handleStopHrvTest(promise: Promise) {
    promise.resolve(nil)
  }

  func handleStartEcgTest(options: [String: Any]?, promise: Promise) {
    #if targetEnvironment(simulator)
    promise.resolve(nil)
    #else
    guard self.ensureMeasurementCanStart(type: "ecg", promise: promise) else {
      return
    }
    guard let peripheralManage = self.peripheralManage else {
      promise.reject("SDK_NOT_INITIALIZED", "Peripheral manager is nil")
      return
    }

    let includeWaveform = (options?["includeWaveform"] as? Bool) ?? false
    self.ecgIncludeWaveform = includeWaveform

    peripheralManage.veepooSDKTestECGStart(true) { [weak self] state, progress, testModel in
      guard let self = self else { return }

      let rawState = String(describing: state)
      var payload: [String: Any] = [
        "state": self.ecgTestStateLabel(state),
        "rawState": rawState,
        "progress": progress,
      ]

      if let model = testModel {
        if let anyHeart = model.aveHeart {
          if let s = anyHeart as? String, let v = Int(s) {
            payload["heartRate"] = v
          } else if let n = anyHeart as? NSNumber {
            payload["heartRate"] = n.intValue
          }
        }
        if let anyHrv = model.aveHrv {
          if let s = anyHrv as? String, let hv = Int(s) {
            payload["hrv"] = hv
          } else if let n = anyHrv as? NSNumber {
            payload["hrv"] = n.intValue
          }
        }
        if includeWaveform, let fs = model.filterSignals as? [NSNumber] {
          payload["waveform"] = fs.map { $0.intValue }
        }
      }

      self.sendEvent(ECG_TEST_RESULT, [
        "deviceId": self.connectedDeviceId ?? "",
        "result": payload
      ])

      if self.ecgStateIsTerminal(state) {
        peripheralManage.veepooSDKTestECGStart(false) { _, _, _ in }
        self.finishMeasurement(type: "ecg", reason: "terminal_\(rawState)")
      }
    }

    promise.resolve(nil)
    #endif
  }

  func handleStopEcgTest(promise: Promise) {
    #if targetEnvironment(simulator)
    promise.resolve(nil)
    #else
    guard let peripheralManage = self.peripheralManage else {
      promise.resolve(nil)
      return
    }
    peripheralManage.veepooSDKTestECGStart(false) { _, _, _ in }
    self.finishMeasurement(type: "ecg", reason: "manual_stop")
    promise.resolve(nil)
    #endif
  }

  func handleStartFatigueTest(promise: Promise) {
    #if targetEnvironment(simulator)
    promise.resolve(nil)
    #else
    guard self.ensureMeasurementCanStart(type: "fatigue", promise: promise) else {
      return
    }
    guard let peripheralManage = self.peripheralManage else {
      promise.reject("SDK_NOT_INITIALIZED", "Peripheral manager is nil")
      return
    }

    peripheralManage.veepooSDKTestFatigueStart(true) { [weak self] state, progress, fatigueValue in
      guard let self = self else { return }
      let rawState = String(describing: state)
      self.sendEvent(FATIGUE_TEST_RESULT, [
        "deviceId": self.connectedDeviceId ?? "",
        "result": [
          "state": self.fatigueStateLabel(state),
          "rawState": rawState,
          "progress": progress,
          "level": fatigueValue
        ]
      ])

      if self.fatigueStateIsTerminal(state) {
        peripheralManage.veepooSDKTestFatigueStart(false) { _, _, _ in }
        self.finishMeasurement(type: "fatigue", reason: "terminal_\(rawState)")
      }
    }

    promise.resolve(nil)
    #endif
  }

  func handleStopFatigueTest(promise: Promise) {
    #if targetEnvironment(simulator)
    promise.resolve(nil)
    #else
    self.peripheralManage?.veepooSDKTestFatigueStart(false) { _, _, _ in }
    self.finishMeasurement(type: "fatigue", reason: "manual_stop")
    promise.resolve(nil)
    #endif
  }

  func handleStartBreathingTest(promise: Promise) {
    #if targetEnvironment(simulator)
    promise.resolve(nil)
    #else
    guard self.ensureMeasurementCanStart(type: "breathing", promise: promise) else {
      return
    }
    guard let peripheralManage = self.peripheralManage else {
      promise.reject("SDK_NOT_INITIALIZED", "Peripheral manager is nil")
      return
    }

    peripheralManage.veepooSDKTestBreathingRateStart(true) { [weak self] state, progress, breathingRateValue in
      guard let self = self else { return }
      let rawState = String(describing: state)
      self.sendEvent(BREATHING_TEST_RESULT, [
        "deviceId": self.connectedDeviceId ?? "",
        "result": [
          "state": self.breathingStateLabel(state),
          "rawState": rawState,
          "progress": progress,
          "rate": breathingRateValue
        ]
      ])

      if self.breathingStateIsTerminal(state) {
        peripheralManage.veepooSDKTestBreathingRateStart(false) { _, _, _ in }
        self.finishMeasurement(type: "breathing", reason: "terminal_\(rawState)")
      }
    }

    promise.resolve(nil)
    #endif
  }

  func handleStopBreathingTest(promise: Promise) {
    #if targetEnvironment(simulator)
    promise.resolve(nil)
    #else
    self.peripheralManage?.veepooSDKTestBreathingRateStart(false) { _, _, _ in }
    self.finishMeasurement(type: "breathing", reason: "manual_stop")
    promise.resolve(nil)
    #endif
  }

  func handleStartBodyCompositionTest(promise: Promise) {
    #if targetEnvironment(simulator)
    promise.resolve(nil)
    #else
    guard self.ensureMeasurementCanStart(type: "bodyComposition", promise: promise) else {
      return
    }
    guard let peripheralManage = self.peripheralManage else {
      promise.reject("SDK_NOT_INITIALIZED", "Peripheral manager is nil")
      return
    }
    if (self.bleManager?.peripheralModel?.bodyCompositionType ?? 0) == 0 {
      self.finishMeasurement(type: "bodyComposition", reason: "capability_unsupported")
      promise.reject("CAPABILITY_UNSUPPORTED", "Band does not support body composition")
      return
    }

    peripheralManage.veepooSDKTestBodyCompositionStart(true, progress: { [weak self] lead, nsProgress in
      guard let self = self else { return }
      let pct = Int((nsProgress.fractionCompleted * 100.0).rounded())
      self.sendEvent(BODY_COMPOSITION_TEST_RESULT, [
        "deviceId": self.connectedDeviceId ?? "",
        "result": [
          "state": "testing",
          "progress": pct,
          "lead": lead,
          "rawState": "progress",
          "isEnd": false
        ]
      ])
    }, testResult: { [weak self] state, model in
      guard let self = self else { return }
      let rawVal = state.rawValue
      var payload: [String: Any] = [
        "state": self.bodyCompositionStateLabel(state),
        "rawState": rawVal,
        "isEnd": self.bodyCompositionStateIsTerminal(state)
      ]
      if let model = model {
        payload["composition"] = self.bodyCompositionValueModelToMap(model)
      }
      if let p = self.bodyCompositionProgressHint(state) {
        payload["progress"] = p
      }
      self.sendEvent(BODY_COMPOSITION_TEST_RESULT, [
        "deviceId": self.connectedDeviceId ?? "",
        "result": payload
      ])
      if self.bodyCompositionStateIsTerminal(state) {
        peripheralManage.veepooSDKTestBodyCompositionStart(false, progress: { _, _ in }, testResult: { _, _ in })
        self.finishMeasurement(type: "bodyComposition", reason: "terminal_\(rawVal)")
      }
    })

    promise.resolve(nil)
    #endif
  }

  func handleStopBodyCompositionTest(promise: Promise) {
    #if targetEnvironment(simulator)
    promise.resolve(nil)
    #else
    self.peripheralManage?.veepooSDKTestBodyCompositionStart(false, progress: { _, _ in }, testResult: { _, _ in })
    self.finishMeasurement(type: "bodyComposition", reason: "manual_stop")
    promise.resolve(nil)
    #endif
  }

  // MARK: - Mapping helpers

  private func ecgTestStateLabel(_ state: VPTestECGState) -> String {
    switch state {
    case .start: return "start"
    case .testing: return "testing"
    case .notLead: return "error"
    case .deviceBusy: return "deviceBusy"
    case .over: return "over"
    case .failure: return "error"
    case .complete: return "over"
    case .noFunction: return "error"
    @unknown default: return "testing"
    }
  }

  private func ecgStateIsTerminal(_ state: VPTestECGState) -> Bool {
    switch state {
    case .notLead, .deviceBusy, .over, .failure, .complete, .noFunction:
      return true
    default:
      return false
    }
  }

  private func fatigueStateLabel(_ state: VPTestFatigueState) -> String {
    switch state {
    case .testing: return "testing"
    case .deviceBusy: return "deviceBusy"
    case .testFail: return "error"
    case .testInterrupt: return "over"
    case .complete: return "over"
    case .noFunction: return "error"
    @unknown default: return "testing"
    }
  }

  private func fatigueStateIsTerminal(_ state: VPTestFatigueState) -> Bool {
    switch state {
    case .deviceBusy, .testFail, .testInterrupt, .complete, .noFunction:
      return true
    default:
      return false
    }
  }

  private func breathingStateLabel(_ state: VPTestBreathingRateState) -> String {
    switch state {
    case .start: return "start"
    case .testing: return "testing"
    case .notWear: return "notWear"
    case .deviceBusy: return "deviceBusy"
    case .over: return "over"
    case .complete: return "over"
    case .failure: return "error"
    case .noFunction: return "error"
    @unknown default: return "testing"
    }
  }

  private func breathingStateIsTerminal(_ state: VPTestBreathingRateState) -> Bool {
    switch state {
    case .notWear, .deviceBusy, .over, .complete, .failure, .noFunction:
      return true
    default:
      return false
    }
  }

  private func bodyCompositionStateLabel(_ state: VPDeviceBodyCompositionState) -> String {
    switch state {
    case .noFunction: return "unsupported"
    case .deviceBusy: return "deviceBusy"
    case .over: return "over"
    case .lowPower: return "lowPower"
    case .failure: return "error"
    case .complete: return "complete"
    @unknown default: return "testing"
    }
  }

  private func bodyCompositionStateIsTerminal(_ state: VPDeviceBodyCompositionState) -> Bool {
    switch state {
    case .noFunction, .deviceBusy, .over, .lowPower, .failure, .complete:
      return true
    @unknown default:
      return false
    }
  }

  private func bodyCompositionProgressHint(_ state: VPDeviceBodyCompositionState) -> Int? {
    switch state {
    case .complete: return 100
    default: return nil
    }
  }

  private func bodyCompositionMetricDouble(_ s: String?) -> Double? {
    guard let s = s?.trimmingCharacters(in: .whitespacesAndNewlines), !s.isEmpty else { return nil }
    return Double(s.replacingOccurrences(of: ",", with: "."))
  }

  private func bodyCompositionValueModelToMap(_ m: VPBodyCompositionValueModel) -> [String: Any] {
    var o: [String: Any] = [:]
    o["date"] = m.date
    o["testTime"] = m.testTime
    o["isDeviceTest"] = m.isDeviceTest
    o["statureCm"] = m.stature
    o["weightKg"] = m.weight
    o["gender"] = m.gender
    if let v = bodyCompositionMetricDouble(m.bmi) { o["bmi"] = v }
    if let v = bodyCompositionMetricDouble(m.bodyFatPercentage) { o["bodyFatPercentage"] = v }
    if let v = bodyCompositionMetricDouble(m.fatMass) { o["fatMassKg"] = v }
    if let v = bodyCompositionMetricDouble(m.leanBodyMass) { o["leanBodyMassKg"] = v }
    if let v = bodyCompositionMetricDouble(m.muscleRate) { o["muscleRate"] = v }
    if let v = bodyCompositionMetricDouble(m.muscleMass) { o["muscleMassKg"] = v }
    if let v = bodyCompositionMetricDouble(m.subcutaneousFat) { o["subcutaneousFatPercentage"] = v }
    if let v = bodyCompositionMetricDouble(m.bodyMoisture) { o["bodyWaterPercentage"] = v }
    if let v = bodyCompositionMetricDouble(m.waterContent) { o["waterMassKg"] = v }
    if let v = bodyCompositionMetricDouble(m.skeletalMuscleRate) { o["skeletalMuscleRate"] = v }
    if let v = bodyCompositionMetricDouble(m.boneMass) { o["boneMassKg"] = v }
    if let v = bodyCompositionMetricDouble(m.proportionOfProtein) { o["proteinPercentage"] = v }
    if let v = bodyCompositionMetricDouble(m.proteinAmount) { o["proteinMassKg"] = v }
    if let v = bodyCompositionMetricDouble(m.basalMetabolicRate) { o["basalMetabolicRateKcal"] = v }
    return o
  }
}
