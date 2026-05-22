import ExpoModulesCore
import VeepooBleSDK

extension VeepooSDKModule {
  // MARK: 开始血压测试
  func handleStartBloodPressureTest(promise: Promise) {
    #if !targetEnvironment(simulator)
    guard self.ensureMeasurementCanStart(type: "bloodPressure", promise: promise) else {
      return
    }
    guard let peripheralManage = self.peripheralManage else { return }
    
    // 检查设备是否支持血压功能
    if let manager = self.bleManager {
      let bpType = manager.peripheralModel?.bloodPressureType ?? 0
      print("[BloodPressure] Starting test - Device bloodPressureType: \(bpType)")
    }
    
    peripheralManage.veepooSDKTestBloodStart(true, testMode: 0) { [weak self] state, progress, high, low in
      guard let self = self else { return }
      
      print("[BloodPressure] SDK callback - state: \(state.rawValue), progress: \(progress), high: \(high), low: \(low)")
      
      // 当进度到达 100% 或出现错误状态时自动停止（与 Android 一致）
      if progress >= 100 || state == .deviceBusy || state == .testFail || state == .testInterrupt || state == .noFunction {
        // 停止血压测量
        peripheralManage.veepooSDKTestBloodStart(false, testMode: 0) { _, _, _, _ in }
        self.finishMeasurement(type: "bloodPressure", reason: "terminal_state_\(state.rawValue)")
        
        let statusStr: String
        switch state {
        case .deviceBusy: statusStr = "deviceBusy"
        case .testFail: statusStr = "testFail"
        case .testInterrupt: statusStr = "testInterrupt"
        case .noFunction: statusStr = "noFunction"
        case .complete: statusStr = "over"
        default: statusStr = "over"  // progress >= 100 时状态为 "over"
        }
        
        self.sendEvent(BLOOD_PRESSURE_TEST_RESULT, [
          "deviceId": self.connectedDeviceId ?? "",
          "result": [
            "state": statusStr,
            "rawState": state.rawValue,
            "systolic": high,
            "diastolic": low,
            "progress": 100,
            "isEnd": true
          ]
        ])
        return
      }
      
      // 测量过程中的事件
      let statusStr: String
      switch state {
      case .testing: statusStr = "testing"
      case .complete: statusStr = "over"
      default: statusStr = "testing"
      }
      
      self.sendEvent(BLOOD_PRESSURE_TEST_RESULT, [
        "deviceId": self.connectedDeviceId ?? "",
          "result": [
            "state": statusStr,
            "rawState": state.rawValue,
            "systolic": high,
            "diastolic": low,
            "progress": progress,
          "isEnd": false
        ]
      ])
    }
    
    promise.resolve(nil)
    #else
    promise.resolve(nil)
    #endif
  }

  // MARK: 停止血压测试
  func handleStopBloodPressureTest(promise: Promise) {
    #if !targetEnvironment(simulator)
    self.peripheralManage?.veepooSDKTestBloodStart(false, testMode: 0) { _, _, _, _ in }
    self.finishMeasurement(type: "bloodPressure", reason: "manual_stop")
    #endif
    promise.resolve(nil)
  }
}
