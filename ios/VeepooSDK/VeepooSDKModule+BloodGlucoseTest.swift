import ExpoModulesCore
import VeepooBleSDK

extension VeepooSDKModule {
  // MARK: 开始血糖测试
  func handleStartBloodGlucoseTest(promise: Promise) {
    #if !targetEnvironment(simulator)
    guard self.ensureMeasurementCanStart(type: "bloodGlucose", promise: promise) else {
      return
    }
    guard let peripheralManage = self.peripheralManage else { return }
    
    // 检查设备是否支持血糖功能
    if let manager = self.bleManager {
      let bgType = manager.peripheralModel?.bloodGlucoseType ?? 0
      print("[BloodGlucose] Starting test - Device bloodGlucoseType: \(bgType)")
    }
    
    peripheralManage.veepooSDKTestBloodGlucoseStart(true, isPersonalModel: false) { [weak self] state, progress, value, level in
      guard let self = self else { return }
      
      print("[BloodGlucose] SDK callback - state: \(state.rawValue), progress: \(progress), value: \(value), level: \(level)")
      
      // 当进度到达 100% 或出现错误状态时自动停止（与血压测试一致）
      if progress >= 100 || state == .deviceBusy || state == .lowPower || state == .notWear || state == .unsupported {
        // 停止血糖测量
        peripheralManage.veepooSDKTestBloodGlucoseStart(false, isPersonalModel: false) { _, _, _, _ in }
        self.finishMeasurement(type: "bloodGlucose", reason: "terminal_state_\(state.rawValue)")
        
        let statusStr: String
        var finalValue = Double(value) / 100.0
        
        switch state {
        case .deviceBusy: statusStr = "deviceBusy"
        case .lowPower: statusStr = "lowPower"
        case .notWear: statusStr = "notWear"
        case .unsupported: statusStr = "unsupported"
        case .close: statusStr = "over"
        default: statusStr = "over"  // progress >= 100 时状态为 "over"
        }
        
        // 如果是完成状态，确保血糖值有效
        if statusStr == "over" && finalValue <= 0 {
          // 如果最终值为0，可能需要从前面的回调中获取，这里先保持0
          print("[BloodGlucose] Warning: Final glucose value is 0")
        }
        
        self.sendEvent(BLOOD_GLUCOSE_DATA, [
          "deviceId": self.connectedDeviceId ?? "",
          "data": [
            "glucose": finalValue,
            "progress": 100,
            "level": level,
            "state": statusStr,
            "rawState": state.rawValue,
            "status": statusStr,
            "isEnd": true
          ]
        ])
        return
      }
      
      // 测量过程中的事件
      let statusStr: String
      switch state {
      case .open: statusStr = "testing"
      case .close: statusStr = "over"
      default: statusStr = "testing"
      }
      
      let finalValue = Double(value) / 100.0
      
      self.sendEvent(BLOOD_GLUCOSE_DATA, [
        "deviceId": self.connectedDeviceId ?? "",
        "data": [
          "glucose": finalValue,
          "progress": progress,
          "level": level,
          "state": statusStr,
          "rawState": state.rawValue,
          "status": statusStr,
          "isEnd": false
        ]
      ])
    }
    
    promise.resolve(nil)
    #endif
  }
}
