import ExpoModulesCore
import VeepooBleSDK

extension VeepooSDKModule {

  func handleStartPttTest(promise: Promise) {
    #if targetEnvironment(simulator)
    promise.resolve(nil)
    #else
    guard ensureMeasurementCanStart(type: "ptt", promise: promise) else { return }
    guard let peripheralManage = self.peripheralManage else {
      finishMeasurement(type: "ptt", reason: "nil_manager")
      promise.reject("DEVICE_NOT_CONNECTED", "No device connected")
      return
    }
    guard isInitialized else {
      finishMeasurement(type: "ptt", reason: "not_initialized")
      promise.reject("SDK_NOT_INITIALIZED", "SDK not initialized")
      return
    }
    guard connectionState == .ready else {
      finishMeasurement(type: "ptt", reason: "not_ready")
      promise.reject("DEVICE_NOT_READY", "Device is not ready")
      return
    }
    guard (peripheralManage.peripheralModel?.ecgType ?? 0) > 0 else {
      finishMeasurement(type: "ptt", reason: "unsupported")
      promise.reject("CAPABILITY_UNSUPPORTED", "Band does not support PTT test")
      return
    }

    peripheralManage.veepooSDKPTTTest(true) { [weak self] valueModel in
      guard let self = self, let model = valueModel else { return }
      let signalQuality = model.testState.rawValue == 0 ? 100 : 0
      self.sendEvent(PTT_TEST_RESULT, [
        "deviceId": self.connectedDeviceId ?? "",
        "result": [
          "heartRate": model.heart,
          "hrv": model.hrv,
          "qtInterval": model.qt,
          "signalQuality": signalQuality,
          "progress": 0,
        ]
      ])
    } signalBlock: { [weak self] _ in
      // signal array used for waveform rendering — not exposed per issue spec
    }

    promise.resolve(nil)
    #endif
  }

  func handleStopPttTest(promise: Promise) {
    #if targetEnvironment(simulator)
    promise.resolve(nil)
    #else
    finishMeasurement(type: "ptt", reason: "manual_stop")
    peripheralManage?.veepooSDKPTTTest(false, valueBlock: nil, signalBlock: nil)
    promise.resolve(nil)
    #endif
  }
}
