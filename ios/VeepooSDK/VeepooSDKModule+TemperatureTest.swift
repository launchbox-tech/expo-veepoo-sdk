import ExpoModulesCore
import VeepooBleSDK

extension VeepooSDKModule {
  // MARK: 开始体温测试
  func handleStartTemperatureTest(promise: Promise) {
    #if !targetEnvironment(simulator)
    guard self.ensureMeasurementCanStart(type: "temperature", promise: promise) else {
      return
    }
    guard let peripheralManage = self.peripheralManage else { return }
    
    // 检查设备是否支持体温功能
    if let manager = self.bleManager {
      let tempType = manager.peripheralModel?.temperatureType ?? 0
      print("[Temperature] Starting test - Device temperatureType: \(tempType)")
    }
    
    peripheralManage.veepooSDK_temperatureTestStart(true) { state, enable, progress, tempValue, originalTempValue in
      print("[Temperature] SDK callback - state: \(state.rawValue), progress: \(progress), temp: \(tempValue)")
      var statusStr = "unknown"
      var isEnd = false
      
      switch state {
      case .unsupported: statusStr = "unsupported"; isEnd = true
      case .open: statusStr = "testing"
      case .close: statusStr = "over"; isEnd = true
      default: statusStr = "testing"
      }
      if isEnd {
        peripheralManage.veepooSDK_temperatureTestStart(false) { _, _, _, _, _ in }
        self.finishMeasurement(type: "temperature", reason: "terminal_state_\(state.rawValue)")
      }
      
      var result: [String: Any] = [
        "state": statusStr,
        "rawState": state.rawValue,
        "value": (tempValue > 0 ? Double(tempValue) / 10.0 : nil) as Any,
        "progress": progress,
        "isEnd": isEnd
      ]
      
      if tempValue > 0 {
        result["originalTemp"] = Double(originalTempValue) / 10.0
      }
      result["enable"] = enable
      
      self.sendEvent(TEMPERATURE_TEST_RESULT, [
        "deviceId": self.connectedDeviceId ?? "",
        "result": result
      ])
    }
    
    promise.resolve(nil)
    #else
    promise.resolve(nil)
    #endif
  }

  // MARK: 停止体温测试
  func handleStopTemperatureTest(promise: Promise) {
    #if !targetEnvironment(simulator)
    self.peripheralManage?.veepooSDK_temperatureTestStart(false) { _, _, _, _, _ in }
    self.finishMeasurement(type: "temperature", reason: "manual_stop")
    #endif
    promise.resolve(nil)
  }
}
