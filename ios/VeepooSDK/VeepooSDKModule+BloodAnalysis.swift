import ExpoModulesCore
import VeepooBleSDK

extension VeepooSDKModule {

  private func bloodAnalysisStateLabel(_ state: VPDeviceBloodAnalysisState) -> String {
    switch state {
    case .noFunction:   return "error"
    case .deviceBusy:   return "deviceBusy"
    case .over:         return "over"
    case .lowPower:     return "error"
    case .failure:      return "error"
    case .notWear:      return "notWear"
    case .complete:     return "over"
    @unknown default:   return "error"
    }
  }

  private func bloodAnalysisStateIsTerminal(_ state: VPDeviceBloodAnalysisState) -> Bool {
    switch state {
    case .noFunction, .deviceBusy, .over, .lowPower, .failure, .notWear, .complete:
      return true
    @unknown default:
      return true
    }
  }

  private func bloodAnalysisModelToValues(_ model: VPBloodAnalysisResultModel?) -> [String: Any]? {
    guard let m = model else { return nil }
    return [
      "uricAcid": m.uricAcidValue,
      "totalCholesterol": m.totalCholesterolValue,
      "triglyceride": m.triglycerideValue,
      "highDensityLipoprotein": m.highDensityLipoproteinValue,
      "lowDensityLipoprotein": m.lowDensityLipoproteinValue,
    ]
  }

  // MARK: - startBloodAnalysisTest

  func handleStartBloodAnalysisTest(promise: Promise) {
    #if targetEnvironment(simulator)
    promise.resolve(nil)
    #else
    guard self.ensureMeasurementCanStart(type: "bloodAnalysis", promise: promise) else { return }
    guard let peripheralManage = self.peripheralManage else {
      self.finishMeasurement(type: "bloodAnalysis", reason: "nil_manager")
      promise.reject("SDK_NOT_INITIALIZED", "Peripheral manager is nil")
      return
    }
    guard let model = peripheralManage.peripheralModel, model.bloodAnalysisType > 0 else {
      self.finishMeasurement(type: "bloodAnalysis", reason: "unsupported")
      promise.reject("CAPABILITY_UNSUPPORTED", "Band does not support blood analysis")
      return
    }

    peripheralManage.veepooSDKTestBloodAnalysisStart(true, isPersonalModel: false, progress: { [weak self] nsProgress in
      guard let self = self else { return }
      let pct = Int((nsProgress?.fractionCompleted ?? 0) * 100)
      self.sendEvent(BLOOD_ANALYSIS_TEST_RESULT, [
        "deviceId": self.connectedDeviceId ?? "",
        "result": ["state": "testing", "progress": pct, "values": nil as Any?]
      ])
    }, testResult: { [weak self] state, resultModel in
      guard let self = self else { return }
      let label = self.bloodAnalysisStateLabel(state)
      let values = self.bloodAnalysisModelToValues(resultModel) as Any
      let isTerminal = self.bloodAnalysisStateIsTerminal(state)
      let progress = isTerminal ? 100 : 0
      self.sendEvent(BLOOD_ANALYSIS_TEST_RESULT, [
        "deviceId": self.connectedDeviceId ?? "",
        "result": ["state": label, "progress": progress, "values": values]
      ])
      if isTerminal {
        peripheralManage.veepooSDKTestBloodAnalysisStart(false, isPersonalModel: false, progress: nil, testResult: nil)
        self.finishMeasurement(type: "bloodAnalysis", reason: "terminal_\(label)")
      }
    })

    promise.resolve(nil)
    #endif
  }

  // MARK: - stopBloodAnalysisTest

  func handleStopBloodAnalysisTest(promise: Promise) {
    #if targetEnvironment(simulator)
    promise.resolve(nil)
    #else
    if let peripheralManage = self.peripheralManage {
      peripheralManage.veepooSDKTestBloodAnalysisStart(false, isPersonalModel: false, progress: nil, testResult: nil)
    }
    self.finishMeasurement(type: "bloodAnalysis", reason: "manual_stop")
    promise.resolve(nil)
    #endif
  }
}
