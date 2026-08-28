import ExpoModulesCore
import VeepooBleSDK

/// 读取数据辅助方法
extension VeepooSDKModule {
  /// Byte 18 of the package-1 function frame carries the band's heart-rate
  /// capability, and it is one of the vendor's documented inversions. The iOS
  /// header spells it out — 「心率功能（因后加1带表没有、0代表有）」: 1 means ABSENT,
  /// 0 means present — after stating the general rule as the opposite
  /// (「每个位置0代表没有此功能，1代表有此功能（特殊除外）」, "except special cases").
  ///
  /// The vendor's own Android parser agrees and is wider than a 0/1 test:
  ///
  ///     if (b26 == 1) setHeartDetect(UNSUPPORT); else setHeartDetect(SUPPORT);
  ///     // C8887y.java, package-1 branch (bArr[19] == 1), b26 = bArr[18]
  ///
  /// So EVERY value except 1 means supported. Reading `== 0` for "support" is
  /// right for 0 and 1 and wrong for everything else — notably 7 and 8, which
  /// the same parser treats as heart rate WITH manual detection
  /// (`if (b26 == 8 || b26 == 7) supportManualDetectTypes.add(HEART_RATE)`).
  /// Android reads the vendor's already-parsed `heartDetect` and was always
  /// correct; only iOS re-derived the byte, and derived it wrong. #210.
  ///
  /// Returns nil when the band has not reported the frame, so an absent
  /// capability stays absent rather than defaulting to either answer.
  func heartRateDetectSupported() -> Bool? {
    guard let data = self.bleManager?.peripheralModel?.deviceFuctionData,
          data.count > 18 else {
      return nil
    }
    return data[18] != 1
  }

  func mergeBloodGlucoseData(into item: inout [String: Any], from bgData: [String: Any]) {
    if let bgValue = bgData["bloodGlucoses"] as? [String],
       let firstStr = bgValue.first,
       let first = Double(firstStr), first > 0 {
      item["bloodGlucose"] = first
      item["glucose"] = first
    } else if let bgValue = bgData["bloodGlucose"] as? NSNumber {
      let first = bgValue.doubleValue
      if first > 0 {
        item["bloodGlucose"] = first
        item["glucose"] = first
      }
    } else if let bgValue = bgData["bloodGlucose"] as? String,
              let first = Double(bgValue), first > 0 {
      item["bloodGlucose"] = first
      item["glucose"] = first
    }

    item["bloodGlucoseLevel"] = bgData["bloodGlucoseLevels"]
    item["bloodGlucoses"] = bgData["bloodGlucoses"]
  }

  func emitHalfHourData(dayOffset: Int) {
    #if !targetEnvironment(simulator)
    guard let manager = self.bleManager,
          let deviceAddress = manager.peripheralModel?.deviceAddress else { return }

    let dateStr = self.getDateString(dayOffset: dayOffset)

    // 加载氧气数据映射（用于补充 spo2Value）
    var oxygenMap: [String: [String: Any]] = [:]
    if let oxygenArray = VPDataBaseOperation.veepooSDKGetDeviceOxygenData(withDate: dateStr, andTableID: deviceAddress) as? [[String: Any]] {
      for item in oxygenArray {
        if let time = item["Time"] as? String {
          oxygenMap[time] = item
        }
      }
    }

    // 加载血糖数据映射（用于补充 bloodGlucose）
    var bloodGlucoseMap: [String: [String: Any]] = [:]
    if let bloodGlucoseArray = VPDataBaseOperation.veepooSDKGetDeviceBloodGlucoseData(withDate: dateStr, andTableID: deviceAddress) as? [[String: Any]] {
      if let sample = bloodGlucoseArray.first {
        print("[BloodGlucose] emitHalfHourData db rows: \(bloodGlucoseArray.count), sample: \(sample)")
      } else {
        print("[BloodGlucose] emitHalfHourData db rows: 0")
      }
      for item in bloodGlucoseArray {
        if let time = (item["time"] as? String) ?? (item["Time"] as? String) {
          bloodGlucoseMap[time] = item
        }
      }
    }

    if let halfHourResult = VPDataBaseOperation.veepooSDKGetOriginalChangeHalfHourData(withDate: dateStr, andTableID: deviceAddress) as? [String: [String: String]] {
      // 按时间排序后遍历，确保数据按时间顺序发送
      for (time, item) in halfHourResult.sorted(by: { $0.key < $1.key }) {
        var dataItem: [String: Any] = ["time": time]

        // 基础字段
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

        // 血压字段（兼容两种 key 名）
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

        // SpO2 字段（优先从 item，其次从 oxygenMap）
        if let spo2Str = item["spo2Value"], let spo2 = Int(spo2Str), spo2 > 0 {
          dataItem["spo2Value"] = spo2
        } else if let oxyData = oxygenMap[time] {
          let oxygenValue = self.getInt(oxyData["OxygenValue"])
          if oxygenValue > 0 {
            dataItem["spo2Value"] = oxygenValue
          }
        }

        // 血糖字段（优先从 item，其次从 bloodGlucoseMap）
        if let bgStr = item["bloodGlucose"], let bg = Int(bgStr), bg > 0 {
          dataItem["bloodGlucose"] = bg
          dataItem["glucose"] = Double(bg)
        } else if let bgData = bloodGlucoseMap[time] {
          self.mergeBloodGlucoseData(into: &dataItem, from: bgData)
        }

        // 压力字段（兼容两种 key 名）
        if let stressStr = item["stress"], let stress = Int(stressStr), stress > 0 {
          dataItem["stressValue"] = stress
        } else if let stressStr = item["pressure"], let stress = Int(stressStr), stress > 0 {
          dataItem["stressValue"] = stress
        }

        // 体温字段
        if let tempStr = item["tempValue"], let temp = Double(tempStr), temp > 0 {
          dataItem["tempValue"] = temp
        }

        self.sendEvent(ORIGIN_HALF_HOUR_DATA, [
          "deviceId": self.connectedDeviceId ?? "",
          "data": dataItem
        ])
      }
    }
    #endif
  }
  
  func emitFiveMinuteData(dayOffset: Int) {
    #if !targetEnvironment(simulator)
    guard let manager = self.bleManager,
          let deviceAddress = manager.peripheralModel?.deviceAddress else { return }
    
    let dateStr = self.getDateString(dayOffset: dayOffset)
    
    // 加载氧气数据映射
    var oxygenMap: [String: [String: Any]] = [:]
    if let oxygenArray = VPDataBaseOperation.veepooSDKGetDeviceOxygenData(withDate: dateStr, andTableID: deviceAddress) as? [[String: Any]] {
      for item in oxygenArray {
        if let time = item["Time"] as? String {
          oxygenMap[time] = item
        }
      }
    }
    
    // 加载血糖数据映射
    var bloodGlucoseMap: [String: [String: Any]] = [:]
    if let bloodGlucoseArray = VPDataBaseOperation.veepooSDKGetDeviceBloodGlucoseData(withDate: dateStr, andTableID: deviceAddress) as? [[String: Any]] {
      if let sample = bloodGlucoseArray.first {
        print("[BloodGlucose] emitFiveMinuteData db rows: \(bloodGlucoseArray.count), sample: \(sample)")
      } else {
        print("[BloodGlucose] emitFiveMinuteData db rows: 0")
      }
      for item in bloodGlucoseArray {
        if let time = (item["time"] as? String) ?? (item["Time"] as? String) {
          bloodGlucoseMap[time] = item
        }
      }
    }
    
    // 读取5分钟粒度的原始数据
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
        
        // 合并氧气数据
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
        
        // 处理数组类型的原始数据（厂商 DB 存字符串数组，需 getIntArray 转换）
        if let ppgs = getIntArray(data["ppgs"]) {
          item["ppgs"] = ppgs
        }
        if let ecgs = getIntArray(data["ecgs"]) {
          item["ecgs"] = ecgs
        }
        if let oxygens = getIntArray(data["oxygens"]) {
          item["oxygens"] = oxygens
        }

        // 处理扩展数组类型的原始数据（与 Android 保持一致）
        if let resRates = getIntArray(data["resRates"]) {
          item["resRates"] = resRates
        }
        if let sleepStates = getIntArray(data["sleepStates"]) {
          item["sleepStates"] = sleepStates
        }
        if let apneaResults = getIntArray(data["apneaResults"]) {
          item["apneaResults"] = apneaResults
        }
        if let hypoxiaTimes = getIntArray(data["hypoxiaTimes"]) {
          item["hypoxiaTimes"] = hypoxiaTimes
        }
        if let cardiacLoads = getIntArray(data["cardiacLoads"]) {
          item["cardiacLoads"] = cardiacLoads
        }

        self.sendEvent(ORIGIN_FIVE_MINUTE_DATA, [
          "deviceId": self.connectedDeviceId ?? "",
          "data": item
        ])
      }
    }
    #endif
  }
  
  func handleReadDeviceAllData(promise: Promise) {
    #if targetEnvironment(simulator)
    rejectUnavailableOnSimulator(promise, "readDeviceAllData")
    #else
    guard let manager = self.bleManager,
          let _ = manager.peripheralModel?.deviceAddress else {
      promise.reject("DEVICE_NOT_CONNECTED", "No device connected")
      return
    }
    
    self.sendEvent(READ_ORIGIN_PROGRESS, [
      "deviceId": self.connectedDeviceId ?? "",
      "progress": [
        "readState": "start" as NSString,
        "totalDays": 1,
        "currentDay": 1,
        "progress": 0
      ]
    ])

    // 厂商的读取状态机依赖 RunLoop（内部有超时 Timer）——从 Expo 模块队列
    // （无运行 RunLoop）调用时回调永远不会触发（同步卡在 0%）。
    // 与心率测试的 Timer 同样的约束：必须从主线程进入。
    // The vendor read state machine is runloop-driven (internal timeout
    // timer) — invoked from the Expo module queue (no running runloop) its
    // state-change block never fires. Same constraint as the heart-rate
    // test timer; always enter from main.
    let promiseBox = self.makePromiseBox(promise)
    DispatchQueue.main.async {
      manager.peripheralManage.veepooSdkStartReadDeviceAllData { [weak self] readState, totalDay, currentReadDayNumber, readCurrentDayProgress in
        guard let self = self else { return }

        switch readState {
        case .reading:
          let progressInDay = min(max(Double(readCurrentDayProgress), 0.0), 100.0)
          let completedDays = max(Double(currentReadDayNumber) - 1.0, 0.0)
          let overallProgress = totalDay > 0
            ? min(max(((completedDays * 100.0) + progressInDay) / Double(totalDay), 0.0), 100.0)
            : 0.0

          self.sendEvent(READ_ORIGIN_PROGRESS, [
            "deviceId": self.connectedDeviceId ?? "",
            "progress": [
              "readState": "reading" as NSString,
              "totalDays": totalDay,
              "currentDay": currentReadDayNumber,
              "progress": overallProgress
            ]
          ])

        case .complete:
          self.sendEvent(READ_ORIGIN_PROGRESS, [
            "deviceId": self.connectedDeviceId ?? "",
            "progress": [
              "readState": "complete" as NSString,
              "totalDays": totalDay,
              "currentDay": totalDay,
              "progress": 100
            ]
          ])

          let days = max(Int(totalDay), 1)
          for i in 0..<days {
            self.emitFiveMinuteData(dayOffset: i)
            self.emitHalfHourData(dayOffset: i)
          }

          self.sendEvent(READ_ORIGIN_COMPLETE, [
            "deviceId": self.connectedDeviceId ?? "",
            "success": true
          ])

          promiseBox.resolve(true)

        case .invalid:
          self.sendEvent(READ_ORIGIN_PROGRESS, [
            "deviceId": self.connectedDeviceId ?? "",
            "progress": [
              "readState": "invalid" as NSString,
              "totalDays": 1,
              "currentDay": 1,
              "progress": 0.0
            ]
          ])

          promiseBox.reject("READ_FAILED", "Read device data failed")

        default:
          break
        }
      }
    }
    #endif
  }

  func cacheDeviceFunctions() {
    #if !targetEnvironment(simulator)
    guard let manager = self.bleManager,
          let device = manager.peripheralModel else {
      return
    }
    
    // Keys are the snake_case names `DeviceFunctionPackage1/2/3` declare. JS reads
    // a nested package strictly by declared key, so a camelCase spelling here is
    // silently dropped rather than surfaced — that was #210.
    var package1: [String: Any] = [
      "type": "DeviceFunctionPackage1",
      "blood_pressure": device.bloodPressureType > 0 ? "support" : "unsupported",
      "spo_h": device.oxygenType > 0 ? "support" : "unsupported",
      "temperature_function": device.temperatureType > 0 ? "support" : "unsupported"
    ]
    // Left absent when the band has not reported the frame, so JS can tell
    // "did not report" from "said no" — the same distinction `toFunctionStatus`
    // preserves on Android by mapping UNKONW to "unknown".
    if let heartRateDetect = heartRateDetectSupported() {
      package1["heart_rate_detect"] = heartRateDetect ? "support" : "unsupported"
    }
    
    // `saveDays` is the band's on-device retention window — how many days of
    // history it will re-serve. The vendor binds its read APIs to it
    // (`dayNumber` "cannot be greater than saveDays"), and the app needs it to
    // bound both the backfill loop and the pre-sync buffer sweep. Emitted under
    // the snake_case key `DeviceFunctionPackage2` already declares, because the
    // JS normalizer reads nested-package2 keys by their declared name.
    // 0 means the band did not report it — left absent rather than sent as a
    // zero, so JS can tell "unknown" from a real value.
    var package2: [String: Any] = [
      "type": "DeviceFunctionPackage2",
      "ecg_function": device.ecgType > 0 ? "support" : "unsupported",
      "precision_sleep": device.sleepType > 0 ? "support" : "unsupported",
      "hrv_function": device.hrvType > 0 ? "support" : "unsupported"
    ]
    if device.saveDays > 0 {
      package2["watch_data_day_number"] = Int(device.saveDays)
    }
    
    let package3: [String: Any] = [
      "type": "DeviceFunctionPackage3",
      // `> 1`, not `> 0`: the vendor documents 0 AND 1 as "stress unsupported".
      "stress_function": device.stressType > 1 ? "support" : "unsupported",
      "agps_function": device.agpsFunction > 0 ? "support" : "unsupported",
      "blood_glucose": device.bloodGlucoseType > 0 ? "support" : "unsupported",
      "blood_component": device.bloodAnalysisType > 0 ? "support" : "unsupported",
      "body_component": device.bodyCompositionType > 0 ? "support" : "unsupported"
    ]
    
    cachedDeviceFunctions = [
      "package1": package1,
      "package2": package2,
      "package3": package3
    ]
    
    self.sendEvent(DEVICE_FUNCTION, [
      "deviceId": self.connectedDeviceId ?? "",
      "data": cachedDeviceFunctions,
      "functions": cachedDeviceFunctions
    ])
    #endif
  }

  func getDateString(dayOffset: Int) -> String {
    let calendar = Calendar.current
    let date = calendar.date(byAdding: .day, value: -dayOffset, to: Date()) ?? Date()
    let formatter = DateFormatter()
    formatter.dateFormat = "yyyy-MM-dd"
    return formatter.string(from: date)
  }

  func formatOrdinarySleep(_ items: [[String: Any]]) -> [[String: Any]] {
    var result: [[String: Any]] = []
    
    for item in items {
      let sleepTime = item["SLEEP_TIME"] as? String ?? ""
      let wakeTime = item["WAKE_TIME"] as? String ?? ""
      let line = item["SLE_LINE"] as? String ?? ""
      
      let deepHourStr = item["DEEP_HOUR"] as? String ?? "0"
      let lightHourStr = item["LIGHT_HOUR"] as? String ?? "0"
      let wakeUpTimeStr = item["WakeUpTime"] as? String ?? "0"
      let sleHourStr = item["SLE_HOUR"] as? String ?? "0"
      let sleMinuteStr = item["SLE_MINUTE"] as? String ?? "0"
      
      let allSleepMinutes = (Double(sleHourStr) ?? 0) * 60 + (Double(sleMinuteStr) ?? 0)
      let deepSleepMinutes = (Double(deepHourStr) ?? 0) * 60
      let lightSleepMinutes = (Double(lightHourStr) ?? 0) * 60
      
      var dict: [String: Any] = [:]
      dict["date"] = String(wakeTime.prefix(10))
      dict["sleepTime"] = sleepTime
      dict["wakeTime"] = wakeTime
      dict["deepSleepDuration"] = deepSleepMinutes / 60.0
      dict["lightSleepDuration"] = lightSleepMinutes / 60.0
      dict["totalSleepHours"] = Int(allSleepMinutes / 60)
      dict["totalSleepMinutes"] = Int(allSleepMinutes.truncatingRemainder(dividingBy: 60))
      dict["sleepLevel"] = (item["SLEEP_LEVEL"] as? NSNumber)?.intValue ?? 0
      dict["sleepLine"] = line
      dict["wakeUpCount"] = Int(Double(wakeUpTimeStr) ?? 0)
      
      result.append(dict)
    }
    
    return result
  }

  func formatOrdinarySleepToNewFormat(_ items: [[String: Any]]) -> [[String: Any]] {
    var result: [[String: Any]] = []
    
    for item in items {
      let sleepTime = item["SLEEP_TIME"] as? String ?? ""
      let wakeTime = item["WAKE_TIME"] as? String ?? ""
      let line = item["SLE_LINE"] as? String ?? ""
      
      let deepHourStr = item["DEEP_HOUR"] as? String ?? "0"
      let lightHourStr = item["LIGHT_HOUR"] as? String ?? "0"
      let wakeUpTimeStr = item["WakeUpTime"] as? String ?? "0"
      let sleHourStr = item["SLE_HOUR"] as? String ?? "0"
      let sleMinuteStr = item["SLE_MINUTE"] as? String ?? "0"
      
      let allSleepMinutes = Int((Double(sleHourStr) ?? 0) * 60 + (Double(sleMinuteStr) ?? 0))
      let deepSleepMinutes = Int((Double(deepHourStr) ?? 0) * 60)
      let lightSleepMinutes = Int((Double(lightHourStr) ?? 0) * 60)
      let sleepQuality = (item["SLEEP_LEVEL"] as? NSNumber)?.intValue ?? 0
      let wakeUpCount = Int(Double(wakeUpTimeStr) ?? 0)
      
      let dict: [String: Any] = [
        "date": String(wakeTime.prefix(10)),
        "sleepTime": sleepTime,
        "wakeTime": wakeTime,
        "deepSleepMinutes": deepSleepMinutes,
        "lightSleepMinutes": lightSleepMinutes,
        "totalSleepMinutes": allSleepMinutes,
        "sleepQuality": sleepQuality,
        "sleepLine": line,
        "wakeUpCount": wakeUpCount
      ]
      
      result.append(dict)
    }
    
    return result
  }

  func getInt(_ value: Any?) -> Int {
    if let num = value as? NSNumber {
      return num.intValue
    } else if let str = value as? String {
      return Int(str) ?? 0
    } else if let int = value as? Int {
      return int
    }
    return 0
  }

  func getDouble(_ value: Any?) -> Double {
    if let num = value as? NSNumber {
      return num.doubleValue
    } else if let str = value as? String {
      return Double(str) ?? 0.0
    } else if let d = value as? Double {
      return d
    }
    return 0.0
  }

  /// 厂商 DB 的数组值是字符串（如 ppgs ["88","0","91"]）——`as? [Int]` 静默失败，
  /// 心率数据因此从未到达 JS。逐元素经 getInt 转换。
  /// The vendor DB stores array values as strings (e.g. ppgs ["88","0","91"]) —
  /// a direct `as? [Int]` cast silently fails and heart-rate data never reached
  /// JS. Convert element-wise via getInt.
  func getIntArray(_ value: Any?) -> [Int]? {
    guard let arr = value as? [Any] else { return nil }
    return arr.map { getInt($0) }
  }
  
  // 解析社交消息数据
  func parseSocialMsgData(_ ancsData: Data) -> [String: String] {
    // 默认全部不支持
    var result: [String: String] = [
      "phone": "unsupported",
      "sms": "unsupported",
      "wechat": "unsupported",
      "qq": "unsupported",
      "facebook": "unsupported",
      "twitter": "unsupported",
      "instagram": "unsupported",
      "linkedin": "unsupported",
      "whatsapp": "unsupported",
      "line": "unsupported",
      "skype": "unsupported",
      "email": "unsupported",
      "other": "unsupported"
    ]
    
    guard ancsData.count >= 20 else { return result }
    
    // ANCS 数据格式: 从下标2开始依次代表各种功能
    // 0: 没有此功能, 1: 开启提醒, 2: 关闭提醒
    let bytes = [UInt8](ancsData)
    
    // 辅助函数: 将字节值转换为 FunctionStatus
    func statusFromByte(_ byte: UInt8) -> String {
      switch byte {
      case 1: return "open"
      case 2: return "close"
      default: return "unsupported"
      }
    }
    
    // 下标对应关系 (根据 Veepoo SDK 文档)
    // 2: 来电, 3: 短信, 4: wechat, 5: QQ, 6: Sina, 7: Facebook, 8: X(Twitter)
    // 9: Flickr, 10: LinkedIn, 11: WhatsApp, 12: Line, 13: Instagram
    // 14: Snapchat, 15: Skype, 16: 钉钉, 17: 企业微信
    // 19: 其他应用
    if bytes.count > 2 { result["phone"] = statusFromByte(bytes[2]) }
    if bytes.count > 3 { result["sms"] = statusFromByte(bytes[3]) }
    if bytes.count > 4 { result["wechat"] = statusFromByte(bytes[4]) }
    if bytes.count > 5 { result["qq"] = statusFromByte(bytes[5]) }
    if bytes.count > 7 { result["facebook"] = statusFromByte(bytes[7]) }
    if bytes.count > 8 { result["twitter"] = statusFromByte(bytes[8]) }
    if bytes.count > 13 { result["instagram"] = statusFromByte(bytes[13]) }
    if bytes.count > 10 { result["linkedin"] = statusFromByte(bytes[10]) }
    if bytes.count > 11 { result["whatsapp"] = statusFromByte(bytes[11]) }
    if bytes.count > 12 { result["line"] = statusFromByte(bytes[12]) }
    if bytes.count > 15 { result["skype"] = statusFromByte(bytes[15]) }
    if bytes.count > 3 { result["email"] = statusFromByte(bytes[3]) } // 使用短信设置
    if bytes.count > 19 { result["other"] = statusFromByte(bytes[19] & 0x0F) } // 低4位
    
    return result
  }
  
  // 标准化密码状态值，与 Android 保持一致
  func normalizePasswordStatus(_ status: String?) -> String {
    guard let status = status else { return "UNKNOWN" }
    let upperStatus = status.uppercased()
    
    switch upperStatus {
    case "SUCCESS", "1":
      return "SUCCESS"
    case "FAILED", "FAIL", "0":
      return "FAILED"
    case "CHECK_SUCCESS":
      return "CHECK_SUCCESS"
    case "CHECK_FAIL":
      return "CHECK_FAIL"
    case "NOT_SET":
      return "NOT_SET"
    default:
      return "UNKNOWN"
    }
  }
}
