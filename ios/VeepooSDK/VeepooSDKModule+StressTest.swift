import ExpoModulesCore
import VeepooBleSDK

extension VeepooSDKModule {
  // MARK: 开始压力测试
  func handleStartStressTest(promise: Promise) {
    #if !targetEnvironment(simulator)
    guard self.ensureMeasurementCanStart(type: "stress", promise: promise) else {
      return
    }
    guard let peripheralManage = self.peripheralManage else { return }
    
    // 检查设备是否支持压力功能
    if let manager = self.bleManager {
      let stressType = manager.peripheralModel?.stressType ?? 0
      print("[Stress] Starting test - Device stressType: \(stressType)")
    }
    
    peripheralManage.veepooSDK_stressTestStart(true) { state, progress, stress in
      print("[Stress] SDK callback - state: \(state.rawValue), progress: \(progress), stress: \(stress)")
      var statusStr = "unknown"
      var isEnd = false
      
      switch state {
      case .noFunction: statusStr = "unsupported"; isEnd = true
      case .deviceBusy: statusStr = "deviceBusy"; isEnd = true
      case .over: statusStr = "over"; isEnd = true
      case .lowPower: statusStr = "lowPower"; isEnd = true
      case .notWear: statusStr = "notWear"; isEnd = true
      case .complete: statusStr = "complete"; isEnd = true
      @unknown default: statusStr = "testing"
      }
      if isEnd {
        peripheralManage.veepooSDK_stressTestStart(false) { _, _, _ in }
        self.finishMeasurement(type: "stress", reason: "terminal_state_\(state.rawValue)")
      }
      
      self.sendEvent(STRESS_DATA, [
        "deviceId": self.connectedDeviceId ?? "",
        "data": [
          "stress": stress,
          "progress": progress,
          "rawState": state.rawValue,
          "status": statusStr,
          "isEnd": isEnd
        ]
      ])
    }
    
    promise.resolve(nil)
    #else
    promise.resolve(nil)
    #endif
  }

  // MARK: 停止压力测试
  func handleStopStressTest(promise: Promise) {
    #if !targetEnvironment(simulator)
    self.peripheralManage?.veepooSDK_stressTestStart(false) { _, _, _ in }
    self.finishMeasurement(type: "stress", reason: "manual_stop")
    #endif
    promise.resolve(nil)
  }
}
