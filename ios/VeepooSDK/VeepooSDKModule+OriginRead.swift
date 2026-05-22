import ExpoModulesCore
import VeepooBleSDK

extension VeepooSDKModule {
  // MARK: 读取原始数据
  func handleStartReadOriginData(promise: Promise) {
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
    
    self.sendEvent(READ_ORIGIN_PROGRESS, [
      "deviceId": self.connectedDeviceId ?? "",
      "progress": [
        "readState": "start",
        "totalDays": 1,
        "currentDay": 1,
        "progress": 0.0
      ]
    ])
    
    let dateStr = self.getDateString(dayOffset: 0)
    
    var oxygenMap: [String: [String: Any]] = [:]
    if let oxygenArray = VPDataBaseOperation.veepooSDKGetDeviceOxygenData(withDate: dateStr, andTableID: deviceAddress) as? [[String: Any]] {
      for item in oxygenArray {
        if let time = item["Time"] as? String {
          oxygenMap[time] = item
        }
      }
    }
    
    var bloodGlucoseMap: [String: [String: Any]] = [:]
    if let bloodGlucoseArray = VPDataBaseOperation.veepooSDKGetDeviceBloodGlucoseData(withDate: dateStr, andTableID: deviceAddress) as? [[String: Any]] {
      if let sample = bloodGlucoseArray.first {
        print("[BloodGlucose] handleStartReadOriginData db rows: \(bloodGlucoseArray.count), sample: \(sample)")
      } else {
        print("[BloodGlucose] handleStartReadOriginData db rows: 0")
      }
      for item in bloodGlucoseArray {
        if let time = (item["time"] as? String) ?? (item["Time"] as? String) {
          bloodGlucoseMap[time] = item
        }
      }
    }
    
    if let originData = VPDataBaseOperation.veepooSDKGetOriginalData(withDate: dateStr, andTableID: deviceAddress) as? [String: [String: Any]] {
      // 按时间排序后遍历，确保数据按时间顺序发送
      for (time, data) in originData.sorted(by: { $0.key < $1.key }) {
        var item: [String: Any] = [
          "time": time,
          "heartValue": data["heartValue"] ?? 0,
          "stepValue": data["stepValue"] ?? 0,
          "calValue": data["calValue"] ?? 0,
          "disValue": data["disValue"] ?? 0,
          "sportValue": data["sportValue"] ?? 0,
          "systolic": data["systolic"] ?? data["highValue"] ?? 0,
          "diastolic": data["diastolic"] ?? data["lowValue"] ?? 0,
          "spo2Value": (data["oxygens"] as? [Int])?.max() ?? data["spo2Value"] ?? 0,
          "tempValue": data["tempValue"] ?? 0,
          "stressValue": data["stress"] ?? data["stressValue"] ?? 0,
          "met": data["met"] ?? 0
        ]
        
        if let oxyData = oxygenMap[time] {
          let oxygenValue = self.getInt(oxyData["OxygenValue"])
          if oxygenValue > 0 {
            item["spo2Value"] = oxygenValue
          }
          item["respirationRate"] = self.getInt(oxyData["RespirationRate"])
          item["isHypoxia"] = self.getInt(oxyData["IsHypoxia"])
          item["cardiacLoad"] = self.getDouble(oxyData["CardiacLoad"])
        }
        
        // 合并血糖数据
        if let bgData = bloodGlucoseMap[time] {
          self.mergeBloodGlucoseData(into: &item, from: bgData)
        }
        
        // 处理原始数据中的血糖字段（如果上面的合并没有成功）
        if let bloodGlucose = data["bloodGlucose"] as? Int, item["bloodGlucose"] == nil {
          item["bloodGlucose"] = bloodGlucose
          item["glucose"] = Double(bloodGlucose)
        }
        
        if let ppgs = data["ppgs"] as? [Int] {
          item["ppgs"] = ppgs
        }
        if let ecgs = data["ecgs"] as? [Int] {
          item["ecgs"] = ecgs
        }
        if let oxygens = data["oxygens"] as? [Int] {
          item["oxygens"] = oxygens
        }

        // 处理扩展数组类型的原始数据（与 Android 保持一致）
        if let resRates = data["resRates"] as? [Int] {
          item["resRates"] = resRates
        }
        if let sleepStates = data["sleepStates"] as? [Int] {
          item["sleepStates"] = sleepStates
        }
        if let apneaResults = data["apneaResults"] as? [Int] {
          item["apneaResults"] = apneaResults
        }
        if let hypoxiaTimes = data["hypoxiaTimes"] as? [Int] {
          item["hypoxiaTimes"] = hypoxiaTimes
        }
        if let cardiacLoads = data["cardiacLoads"] as? [Int] {
          item["cardiacLoads"] = cardiacLoads
        }

        self.sendEvent(ORIGIN_FIVE_MINUTE_DATA, [
          "deviceId": self.connectedDeviceId ?? "",
          "data": item
        ])
      }
      
      self.sendEvent(READ_ORIGIN_PROGRESS, [
        "deviceId": self.connectedDeviceId ?? "",
        "progress": [
          "readState": "reading",
          "totalDays": 1,
          "currentDay": 1,
          "progress": 0.5
        ]
      ])
    }
    
    if let halfHourResult = VPDataBaseOperation.veepooSDKGetOriginalChangeHalfHourData(withDate: dateStr, andTableID: deviceAddress) as? [String: [String: String]] {
      // 按时间排序后遍历，确保数据按时间顺序发送
      for (time, item) in halfHourResult.sorted(by: { $0.key < $1.key }) {
        var dataItem: [String: Any] = ["time": time]
        
        if let hrStr = item["heartValue"], let hr = Double(hrStr), hr > 0 {
          dataItem["heartValue"] = Int(hr)
        }
        if let stepStr = item["stepValue"], let step = Double(stepStr) {
          dataItem["stepValue"] = Int(step)
        }
        if let calStr = item["calValue"], let cal = Double(calStr) {
          dataItem["calValue"] = cal
        }
        if let disStr = item["disValue"], let dis = Double(disStr) {
          dataItem["disValue"] = dis
        }

        // sportValue 和 met（从数据源读取）
        if let sportStr = item["sportValue"], let sport = Double(sportStr) {
          dataItem["sportValue"] = Int(sport)
        }
        if let metStr = item["met"], let met = Double(metStr) {
          dataItem["met"] = met
        }

        if let highStr = item["highValue"], let high = Int(highStr), high > 0 {
          dataItem["systolic"] = high
        } else if let highStr = item["systolic"], let high = Int(highStr), high > 0 {
          dataItem["systolic"] = high
        }
        if let lowStr = item["lowValue"], let low = Int(lowStr), low > 0 {
          dataItem["diastolic"] = low
        } else if let lowStr = item["diastolic"], let low = Int(lowStr), low > 0 {
          dataItem["diastolic"] = low
        }
        if let spo2Str = item["spo2Value"], let spo2 = Int(spo2Str), spo2 > 0 {
          dataItem["spo2Value"] = spo2
        }
        if let bgStr = item["bloodGlucose"], let bg = Int(bgStr), bg > 0 {
          dataItem["bloodGlucose"] = bg
          dataItem["glucose"] = Double(bg)
        }
        if let stressStr = item["stress"], let stress = Int(stressStr), stress > 0 {
          dataItem["stressValue"] = stress
        } else if let stressStr = item["pressure"], let stress = Int(stressStr), stress > 0 {
          dataItem["stressValue"] = stress
        }
        if let tempStr = item["tempValue"], let temp = Double(tempStr), temp > 0 {
          dataItem["tempValue"] = temp
        }
        
        if let oxyData = oxygenMap[time] {
          let oxygenValue = self.getInt(oxyData["OxygenValue"])
          if oxygenValue > 0 {
            dataItem["spo2Value"] = oxygenValue
          }
        }
        
        // 合并血糖数据
        if let bgData = bloodGlucoseMap[time] {
          self.mergeBloodGlucoseData(into: &dataItem, from: bgData)
        }
        
        self.sendEvent(ORIGIN_HALF_HOUR_DATA, [
          "deviceId": self.connectedDeviceId ?? "",
          "data": dataItem
        ])
      }
    }
    
    self.sendEvent(READ_ORIGIN_PROGRESS, [
      "deviceId": self.connectedDeviceId ?? "",
      "progress": [
        "readState": "complete",
        "totalDays": 1,
        "currentDay": 1,
        "progress": 1.0
      ]
    ])
    
    self.sendEvent(READ_ORIGIN_COMPLETE, [
      "deviceId": self.connectedDeviceId ?? "",
      "success": true
    ])
    
    promise.resolve(nil)
    #else
    promise.resolve(nil)
    #endif
  }
  // MARK: 读取原始数据（按天）
  func handleReadOriginData(dayOffset: Int, promise: Promise) {
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
    var resultList: [[String: Any]] = []
    
    var oxygenMap: [String: [String: Any]] = [:]
    if let oxygenArray = VPDataBaseOperation.veepooSDKGetDeviceOxygenData(withDate: dateStr, andTableID: deviceAddress) as? [[String: Any]] {
      for item in oxygenArray {
        if let time = item["Time"] as? String {
          oxygenMap[time] = item
        }
      }
    }
    
    var bloodGlucoseMap: [String: [String: Any]] = [:]
    if let bloodGlucoseArray = VPDataBaseOperation.veepooSDKGetDeviceBloodGlucoseData(withDate: dateStr, andTableID: deviceAddress) as? [[String: Any]] {
      if let sample = bloodGlucoseArray.first {
        print("[BloodGlucose] handleReadOriginData db rows: \(bloodGlucoseArray.count), sample: \(sample)")
      } else {
        print("[BloodGlucose] handleReadOriginData db rows: 0")
      }
      for item in bloodGlucoseArray {
        if let time = (item["time"] as? String) ?? (item["Time"] as? String) {
          bloodGlucoseMap[time] = item
        }
      }
    }
    
    if let originData = VPDataBaseOperation.veepooSDKGetOriginalData(withDate: dateStr, andTableID: deviceAddress) as? [String: [String: Any]] {
      for (time, data) in originData {
        var item: [String: Any] = [
          "time": time,
          "heartValue": data["heartValue"] ?? 0,
          "stepValue": data["stepValue"] ?? 0,
          "calValue": data["calValue"] ?? 0,
          "disValue": data["disValue"] ?? 0,
          "sportValue": data["sportValue"] ?? 0,
          "systolic": data["systolic"] ?? data["highValue"] ?? 0,
          "diastolic": data["diastolic"] ?? data["lowValue"] ?? 0,
          "spo2Value": (data["oxygens"] as? [Int])?.max() ?? data["spo2Value"] ?? 0,
          "tempValue": data["tempValue"] ?? 0,
          "stressValue": data["stress"] ?? data["stressValue"] ?? 0,
          "met": data["met"] ?? 0
        ]
        
        if let oxyData = oxygenMap[time] {
          let oxygenValue = self.getInt(oxyData["OxygenValue"])
          if oxygenValue > 0 {
            item["spo2Value"] = oxygenValue
          }
          item["respirationRate"] = self.getInt(oxyData["RespirationRate"])
          item["isHypoxia"] = self.getInt(oxyData["IsHypoxia"])
          item["cardiacLoad"] = self.getDouble(oxyData["CardiacLoad"])
        }
        
        // 合并血糖数据
        if let bgData = bloodGlucoseMap[time] {
          self.mergeBloodGlucoseData(into: &item, from: bgData)
        }

        // 处理原始数据中的血糖字段（如果上面的合并没有成功）
        if item["bloodGlucose"] == nil {
          if let bloodGlucose = data["bloodGlucose"] as? NSNumber {
            let value = bloodGlucose.doubleValue
            if value > 0 {
              item["bloodGlucose"] = value
              item["glucose"] = value
            }
          } else if let bloodGlucose = data["bloodGlucose"] as? String,
                    let value = Double(bloodGlucose), value > 0 {
            item["bloodGlucose"] = value
            item["glucose"] = value
          } else if let bloodGlucose = data["bloodGlucose"] as? Int, bloodGlucose > 0 {
            item["bloodGlucose"] = bloodGlucose
            item["glucose"] = Double(bloodGlucose)
          }
        }
        
        if let ppgs = data["ppgs"] as? [Int] {
          item["ppgs"] = ppgs
        }
        if let ecgs = data["ecgs"] as? [Int] {
          item["ecgs"] = ecgs
        }
        if let oxygens = data["oxygens"] as? [Int] {
          item["oxygens"] = oxygens
        }

        // 处理扩展数组类型的原始数据（与 Android 保持一致）
        if let resRates = data["resRates"] as? [Int] {
          item["resRates"] = resRates
        }
        if let sleepStates = data["sleepStates"] as? [Int] {
          item["sleepStates"] = sleepStates
        }
        if let apneaResults = data["apneaResults"] as? [Int] {
          item["apneaResults"] = apneaResults
        }
        if let hypoxiaTimes = data["hypoxiaTimes"] as? [Int] {
          item["hypoxiaTimes"] = hypoxiaTimes
        }
        if let cardiacLoads = data["cardiacLoads"] as? [Int] {
          item["cardiacLoads"] = cardiacLoads
        }

        resultList.append(item)
      }
    }
    
    let sortedResult = resultList.sorted { ($0["time"] as? String ?? "") < ($1["time"] as? String ?? "") }
    promise.resolve(sortedResult)
    #else
    promise.resolve([])
    #endif
  }
}
