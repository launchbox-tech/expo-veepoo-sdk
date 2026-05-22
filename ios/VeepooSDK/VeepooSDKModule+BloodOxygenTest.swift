import ExpoModulesCore
import VeepooBleSDK

extension VeepooSDKModule {
  // MARK: 开始血氧测试
  func handleStartBloodOxygenTest(promise: Promise) {
    #if !targetEnvironment(simulator)
    guard self.ensureMeasurementCanStart(type: "bloodOxygen", promise: promise) else {
      return
    }
    guard let peripheralManage = self.peripheralManage else { return }
    
    // 检查设备是否支持血氧功能
    if let manager = self.bleManager {
      let oxygenType = manager.peripheralModel?.oxygenType ?? 0
      print("[BloodOxygen] Starting test - Device oxygenType: \(oxygenType)")
      if oxygenType == 0 {
        print("[BloodOxygen] Warning: Device may not support blood oxygen function")
      }
    }

    let progressWrapper = ProgressWrapper()
    let spo2ValueWrapper = ValueWrapper<Int>(value: 0)
    let rateValueWrapper = ValueWrapper<Int>(value: 0)
    var progressTimer: Timer?

    // 启动模拟进度定时器（与 Android 一致：每秒增加 4%，25 秒完成）
    // 使用主线程创建 Timer，确保 RunLoop 正确
    DispatchQueue.main.async {
      progressTimer = Timer.scheduledTimer(withTimeInterval: 1.0, repeats: true) { timer in
        progressWrapper.value += 4
        if progressWrapper.value >= 100 {
          timer.invalidate()
          return
        }

        self.sendEvent(BLOOD_OXYGEN_TEST_RESULT, [
          "deviceId": self.connectedDeviceId ?? "",
          "result": [
            "state": "testing",
            "value": spo2ValueWrapper.value,
            "rate": rateValueWrapper.value,
            "progress": progressWrapper.value
          ]
        ])
      }
    }

    peripheralManage.veepooSDKTestOxygenStart(true) { state, value in
      // 与 Android 一致：设备回调只更新数值，不发送事件
      // 进度和事件由 Timer 独立更新
      print("[BloodOxygen] SDK callback - state: \(state.rawValue), value: \(value)")
      
      switch state {
      case .start:
        print("[BloodOxygen] Test started")
        
      case .calibration:
        // 校准阶段：value 表示校准进度（0-100）
        print("[BloodOxygen] Calibrating - progress: \(value)")
        // 可以选择发送校准进度到前端
        self.sendEvent(BLOOD_OXYGEN_TEST_RESULT, [
          "deviceId": self.connectedDeviceId ?? "",
          "result": [
            "state": "calibration",
            "rawState": state.rawValue,
            "value": 0,
            "rate": 0,
            "progress": Int(value),
            "isEnd": false
          ]
        ])
        
      case .calibrationComplete:
        print("[BloodOxygen] Calibration complete")
        
      case .testing:
        // 测试阶段：value 表示血氧值
        spo2ValueWrapper.value = Int(value)
        print("[BloodOxygen] Testing - SpO2: \(value)")
        
      case .notWear:
        print("[BloodOxygen] Device not worn")
        progressTimer?.invalidate()
        peripheralManage.veepooSDKTestOxygenStart(false) { _, _ in }
        self.finishMeasurement(type: "bloodOxygen", reason: "not_wear")
        self.sendEvent(BLOOD_OXYGEN_TEST_RESULT, [
          "deviceId": self.connectedDeviceId ?? "",
          "result": [
            "state": "notWear",
            "rawState": state.rawValue,
            "value": Int(value),
            "rate": rateValueWrapper.value,
            "progress": progressWrapper.value,
            "isEnd": true
          ]
        ])
      case .deviceBusy:
        print("[BloodOxygen] Device is busy")
        progressTimer?.invalidate()
        peripheralManage.veepooSDKTestOxygenStart(false) { _, _ in }
        self.finishMeasurement(type: "bloodOxygen", reason: "device_busy")
        self.sendEvent(BLOOD_OXYGEN_TEST_RESULT, [
          "deviceId": self.connectedDeviceId ?? "",
          "result": [
            "state": "deviceBusy",
            "rawState": state.rawValue,
            "value": Int(value),
            "rate": rateValueWrapper.value,
            "progress": progressWrapper.value,
            "isEnd": true
          ]
        ])
      case .over:
        print("[BloodOxygen] Test completed - SpO2: \(value)")
        progressTimer?.invalidate()
        peripheralManage.veepooSDKTestOxygenStart(false) { _, _ in }
        self.finishMeasurement(type: "bloodOxygen", reason: "sdk_over")
        self.sendEvent(BLOOD_OXYGEN_TEST_RESULT, [
          "deviceId": self.connectedDeviceId ?? "",
          "result": [
            "state": "over",
            "rawState": state.rawValue,
            "value": Int(value),
            "rate": rateValueWrapper.value,
            "progress": 100,
            "isEnd": true
          ]
        ])
      case .noFunction:
        print("[BloodOxygen] Device does not support blood oxygen function")
        progressTimer?.invalidate()
        peripheralManage.veepooSDKTestOxygenStart(false) { _, _ in }
        self.finishMeasurement(type: "bloodOxygen", reason: "no_function")
        self.sendEvent(BLOOD_OXYGEN_TEST_RESULT, [
          "deviceId": self.connectedDeviceId ?? "",
          "result": [
            "state": "noFunction",
            "rawState": state.rawValue,
            "value": Int(value),
            "rate": rateValueWrapper.value,
            "progress": progressWrapper.value,
            "isEnd": true
          ]
        ])
      case .invalid:
        print("[BloodOxygen] Invalid state received")
        progressTimer?.invalidate()
        peripheralManage.veepooSDKTestOxygenStart(false) { _, _ in }
        self.finishMeasurement(type: "bloodOxygen", reason: "invalid_state")
        self.sendEvent(BLOOD_OXYGEN_TEST_RESULT, [
          "deviceId": self.connectedDeviceId ?? "",
          "result": [
            "state": "invalid",
            "rawState": state.rawValue,
            "value": Int(value),
            "rate": rateValueWrapper.value,
            "progress": progressWrapper.value,
            "isEnd": true
          ]
        ])
      default:
        // 其他状态不处理，由 Timer 持续更新进度
        print("[BloodOxygen] Unknown state: \(state.rawValue)")
        break
      }
    }

    promise.resolve(nil)
    #else
    promise.resolve(nil)
    #endif
  }

  // MARK: 停止血氧测试
  func handleStopBloodOxygenTest(promise: Promise) {
    #if !targetEnvironment(simulator)
    self.peripheralManage?.veepooSDKTestOxygenStart(false) { _, _ in }
    self.finishMeasurement(type: "bloodOxygen", reason: "manual_stop")
    #endif
    promise.resolve(nil)
  }
}
