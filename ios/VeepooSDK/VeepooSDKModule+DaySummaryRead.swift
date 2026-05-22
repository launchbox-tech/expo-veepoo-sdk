import ExpoModulesCore
import VeepooBleSDK

extension VeepooSDKModule {
  // MARK: 读取每日汇总数据
  func handleReadDaySummaryData(dayOffset: Int, promise: Promise) {
    #if !targetEnvironment(simulator)
    guard self.isInitialized else {
      promise.reject("SDK_NOT_INITIALIZED", "SDK not initialized")
      return
    }
    
    guard let manager = self.bleManager,
          let deviceAddress = manager.peripheralModel?.deviceAddress else {
      promise.reject("DEVICE_NOT_CONNECTED", "No device connected or address unavailable")
      return
    }
    
    let dateStr = self.getDateString(dayOffset: dayOffset)
    
    var sportList: [[String: Any]] = []
    var rateList: [[String: Any]] = []
    var bpList: [[String: Any]] = []
    var allStep = 0
    
    if let halfHourResult = VPDataBaseOperation.veepooSDKGetOriginalChangeHalfHourData(withDate: dateStr, andTableID: deviceAddress) as? [String: [String: String]] {
      for (time, item) in halfHourResult {
        var sportItem: [String: Any] = ["time": time, "step": 0, "cal": 0.0, "dis": 0.0]
        var rateItem: [String: Any] = ["time": time, "rate": 0]
        
        if let stepStr = item["stepValue"], let step = Int(stepStr) {
          sportItem["step"] = step
          allStep += step
        }
        if let calStr = item["calValue"], let cal = Double(calStr) {
          sportItem["cal"] = cal
        }
        if let disStr = item["disValue"], let dis = Double(disStr) {
          sportItem["dis"] = dis
        }
        if let hrStr = item["heartValue"], let hr = Int(hrStr), hr > 0 {
          rateItem["rate"] = hr
          rateList.append(rateItem)
        }
        
        // 读取血压数据（与 Android 保持一致）
        let highValue = item["highValue"] ?? item["systolic"] ?? "0"
        let lowValue = item["lowValue"] ?? item["diastolic"] ?? "0"
        if let high = Int(highValue), let low = Int(lowValue), high > 0 || low > 0 {
          bpList.append([
            "time": time,
            "high": high,
            "low": low
          ])
        }
        
        sportList.append(sportItem)
      }
    }
    
    let sortedSportList = sportList.sorted { ($0["time"] as? String ?? "") < ($1["time"] as? String ?? "") }
    let sortedRateList = rateList.sorted { ($0["time"] as? String ?? "") < ($1["time"] as? String ?? "") }
    let sortedBpList = bpList.sorted { ($0["time"] as? String ?? "") < ($1["time"] as? String ?? "") }
    
    let result: [String: Any] = [
      "date": dateStr,
      "allStep": allStep,
      "sportList": sortedSportList,
      "rateList": sortedRateList,
      "bpList": sortedBpList
    ]
    
    promise.resolve(result)
    #endif
  }
}
