import ExpoModulesCore
import VeepooBleSDK

extension VeepooSDKModule {
  // MARK: 读取睡眠数据
  func handleReadSleepData(date: String?, promise: Promise) {
    #if !targetEnvironment(simulator)
    guard let manager = self.bleManager,
          let deviceAddress = manager.peripheralModel?.deviceAddress else {
      promise.reject("DEVICE_NOT_CONNECTED", "No device connected")
      return
    }
    
    let queryDate = date ?? self.getDateString(dayOffset: 0)
    var items: [[String: Any]] = []
    let sleepType = manager.peripheralModel?.sleepType ?? 0
    
    if sleepType > 0 {
      if let sleepItems = VPDataBaseOperation.veepooSDKGetAccurateSleepData(withDate: queryDate, andTableID: deviceAddress) {
        for item in sleepItems {
          let deepMinutes = Int(Double(item.deepDuration) ?? 0)
          let lightMinutes = Int(Double(item.lightDuration) ?? 0)
          let totalMinutes = Int(Double(item.sleepDuration) ?? 0)
          let quality = Int(Double(item.sleepQuality) ?? 0)
          let wakeCount = Int(Double(item.insomniaTimes) ?? 0)
          
          let dict: [String: Any] = [
            "date": String(item.wakeTime.prefix(10)),
            "sleepTime": item.sleepTime.count > 16 ? item.sleepTime : (item.sleepTime + ":00"),
            "wakeTime": item.wakeTime.count > 16 ? item.wakeTime : (item.wakeTime + ":00"),
            "deepSleepMinutes": deepMinutes,
            "lightSleepMinutes": lightMinutes,
            "totalSleepMinutes": totalMinutes,
            "sleepQuality": quality,
            "sleepLine": item.sleepLine,
            "wakeUpCount": wakeCount
          ]
          items.append(dict)
        }
      }
    } else {
      if let sleepItems = VPDataBaseOperation.veepooSDKGetSleepData(withDate: queryDate, andTableID: deviceAddress) as? [[String: Any]] {
        items = self.formatOrdinarySleepToNewFormat(sleepItems)
      }
    }
    
    var totalDeep = 0
    var totalLight = 0
    var totalMinutes = 0
    var totalQuality = 0
    var totalWake = 0
    
    for item in items {
      totalDeep += (item["deepSleepMinutes"] as? Int) ?? 0
      totalLight += (item["lightSleepMinutes"] as? Int) ?? 0
      totalMinutes += (item["totalSleepMinutes"] as? Int) ?? 0
      totalQuality += (item["sleepQuality"] as? Int) ?? 0
      totalWake += (item["wakeUpCount"] as? Int) ?? 0
    }
    
    let avgQuality = items.count > 0 ? totalQuality / items.count : 0
    
    let result: [String: Any] = [
      "date": queryDate,
      "items": items,
      "summary": [
        "totalDeepSleepMinutes": totalDeep,
        "totalLightSleepMinutes": totalLight,
        "totalSleepMinutes": totalMinutes,
        "averageSleepQuality": avgQuality,
        "totalWakeUpCount": totalWake
      ]
    ]
    
    self.sendEvent(SLEEP_DATA, [
      "deviceId": self.connectedDeviceId ?? "",
      "date": queryDate,
      "data": result
    ])
    
    let resultList = [result]
    promise.resolve(resultList)
    #else
    let mock: [String: Any] = [
      "date": date ?? self.getDateString(dayOffset: 0),
      "items": [[
        "date": "2024-01-01", "sleepTime": "22:30:00", "wakeTime": "07:00:00",
        "deepSleepMinutes": 90, "lightSleepMinutes": 330, "totalSleepMinutes": 480,
        "sleepQuality": 85, "sleepLine": "", "wakeUpCount": 2
      ]],
      "summary": [
        "totalDeepSleepMinutes": 90, "totalLightSleepMinutes": 330,
        "totalSleepMinutes": 480, "averageSleepQuality": 85, "totalWakeUpCount": 2
      ]
    ]
    promise.resolve([mock])
    #endif
  }
}
