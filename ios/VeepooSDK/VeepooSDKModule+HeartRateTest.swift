import ExpoModulesCore
import VeepooBleSDK

extension VeepooSDKModule {
  // MARK: 开始心率测试
  func handleStartHeartRateTest(promise: Promise) {
    #if !targetEnvironment(simulator)
    guard self.ensureMeasurementCanStart(type: "heartRate", promise: promise) else {
      return
    }
    guard let peripheralManage = self.peripheralManage else { return }
    
    // 检查设备是否支持心率功能
    // Byte 18 is the vendor's inverted heart-rate flag; `heartRateDetectSupported()`
    // holds the one spelling of that rule. #210.
    let heartRateSupport = heartRateDetectSupported()
      .map { $0 ? "support" : "unsupported" } ?? "unreported"
    print("[HeartRate] Starting test - Device heartRate support: \(heartRateSupport)")
    
    let progressWrapper = ProgressWrapper()
    let heartRateValueWrapper = ValueWrapper<Int>(value: 0)  // 保存最后的心率值
    var progressTimer: Timer?
    
    // 25秒完成，每0.5秒触发一次，共50次，每次增长2
    // 使用主线程创建 Timer，确保 RunLoop 正确
    DispatchQueue.main.async {
      progressTimer = Timer.scheduledTimer(withTimeInterval: 0.5, repeats: true) { timer in
      progressWrapper.value += 2
      let currentProgress = progressWrapper.value
      let currentHeartRate = heartRateValueWrapper.value
      
      print("[HeartRate] Timer - progress: \(currentProgress), heartRate: \(currentHeartRate)")
      
      if currentProgress >= 100 {
        timer.invalidate()
        // 如果 Timer 到达 100 但 SDK 还没有返回 over，自动停止测试
        print("[HeartRate] Timer reached 100, auto-stopping test, final heartRate: \(currentHeartRate)")
        peripheralManage.veepooSDKTestHeartStart(false) { _, _ in }
        self.finishMeasurement(type: "heartRate", reason: "timer_reached_100")
        self.sendEvent(HEART_RATE_TEST_RESULT, [
          "deviceId": self.connectedDeviceId ?? "",
          "result": [
            "state": "over",
            "rawState": "timer_over",
            "value": currentHeartRate,
            "progress": 100
          ]
        ])
        return
      }
      
        self.sendEvent(HEART_RATE_TEST_RESULT, [
          "deviceId": self.connectedDeviceId ?? "",
          "result": [
            "state": "testing",
            "rawState": "timer_testing",
            "value": currentHeartRate,
            "progress": currentProgress
          ]
      ])
    }
    }
    
    peripheralManage.veepooSDKTestHeartStart(true) { [weak self] state, heartValue in
      guard let self = self else { return }
      print("[HeartRate] SDK callback - state: \(state.rawValue), heartValue: \(heartValue)")
      
      switch state {
      case .start:
        print("[HeartRate] Test started")
        
      case .testing:
        // 测试中获得实时心率值，保存并发送事件
        print("[HeartRate] Testing - BPM: \(heartValue)")
        heartRateValueWrapper.value = Int(heartValue)  // 保存心率值
        self.sendEvent(HEART_RATE_TEST_RESULT, [
          "deviceId": self.connectedDeviceId ?? "",
          "result": [
            "state": "testing",
            "rawState": state.rawValue,
            "value": heartValue,
            "progress": progressWrapper.value
          ]
        ])
        
      case .notWear:
        print("[HeartRate] Device not worn")
        progressTimer?.invalidate()
        heartRateValueWrapper.value = Int(heartValue)
        peripheralManage.veepooSDKTestHeartStart(false) { _, _ in }
        self.finishMeasurement(type: "heartRate", reason: "not_wear")
        self.sendEvent(HEART_RATE_TEST_RESULT, [
          "deviceId": self.connectedDeviceId ?? "",
          "result": [
            "state": "notWear",
            "rawState": state.rawValue,
            "value": heartValue,
            "progress": progressWrapper.value
          ]
        ])
        
      case .deviceBusy:
        print("[HeartRate] Device is busy")
        progressTimer?.invalidate()
        heartRateValueWrapper.value = Int(heartValue)
        peripheralManage.veepooSDKTestHeartStart(false) { _, _ in }
        self.finishMeasurement(type: "heartRate", reason: "device_busy")
        self.sendEvent(HEART_RATE_TEST_RESULT, [
          "deviceId": self.connectedDeviceId ?? "",
          "result": [
            "state": "deviceBusy",
            "rawState": state.rawValue,
            "value": heartValue,
            "progress": progressWrapper.value
          ]
        ])
        
      case .over:
        print("[HeartRate] Test completed - BPM: \(heartValue)")
        heartRateValueWrapper.value = Int(heartValue)
        progressTimer?.invalidate()
        peripheralManage.veepooSDKTestHeartStart(false) { _, _ in }
        self.finishMeasurement(type: "heartRate", reason: "sdk_over")
        self.sendEvent(HEART_RATE_TEST_RESULT, [
          "deviceId": self.connectedDeviceId ?? "",
          "result": [
            "state": "over",
            "rawState": state.rawValue,
            "value": heartValue,
            "progress": 100
          ]
        ])
        
      default:
        print("[HeartRate] Unknown state: \(state.rawValue)")
        break
      }
    }
    
    promise.resolve(nil)
    #else
    promise.resolve(nil)
    #endif
  }

  // MARK: 停止心率测试
  func handleStopHeartRateTest(promise: Promise) {
    #if !targetEnvironment(simulator)
    print("[HeartRate] Stopping test manually")
    self.peripheralManage?.veepooSDKTestHeartStart(false) { [weak self] _, heartValue in
      print("[HeartRate] Stop callback - final heartValue: \(heartValue)")
      self?.finishMeasurement(type: "heartRate", reason: "manual_stop")
      // 发送停止事件，使用实际的心率值（如果有效）
      let finalValue = heartValue > 0 ? Int(heartValue) : 0
      self?.sendEvent("heartRateTestResult", [
        "deviceId": self?.connectedDeviceId ?? "",
        "result": [
          "state": "over",
          "value": finalValue,
          "progress": 100
        ]
      ])
    }
    #endif
    promise.resolve(nil)
  }
}
