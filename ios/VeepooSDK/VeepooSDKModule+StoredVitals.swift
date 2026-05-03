import ExpoModulesCore
import VeepooBleSDK

extension VeepooSDKModule {

  // MARK: - Temperature

  func handleReadStoredTemperatureData(date: String?, promise: Promise) {
    #if targetEnvironment(simulator)
    promise.resolve(nil)
    #else
    guard let manager = bleManager,
          let deviceAddress = manager.peripheralModel?.deviceAddress else {
      promise.reject("DEVICE_NOT_CONNECTED", "No device connected"); return
    }
    guard (manager.peripheralModel?.temperatureType ?? 0) > 0 else {
      promise.reject("CAPABILITY_UNSUPPORTED", "Band does not support temperature history"); return
    }
    let queryDate = date ?? getDateString(dayOffset: 0)
    let records = VPDataBaseOperation.veepooSDKGetDeviceTemperatureData(withDate: queryDate, andTableID: deviceAddress) as? [[String: Any]] ?? []
    let year = String(queryDate.prefix(4))
    let monthDay = String(queryDate.dropFirst(5))
    for dict in records {
      let month = (dict["month"] as? NSNumber)?.intValue ?? 0
      let day = (dict["day"] as? NSNumber)?.intValue ?? 0
      let hour = (dict["hour"] as? NSNumber)?.intValue ?? 0
      let minute = (dict["minute"] as? NSNumber)?.intValue ?? 0
      let ts = String(format: "%@-%02d-%02d %02d:%02d", year, month, day, hour, minute)
      let temp = (dict["value"] as? NSNumber)?.doubleValue ?? 0
      let bodyTemp = (dict["originalValue"] as? NSNumber)?.doubleValue
      var data: [String: Any] = ["timestamp": ts, "temperature": temp]
      if let bt = bodyTemp { data["bodyTemperature"] = bt }
      sendEvent(STORED_TEMPERATURE_DATA, ["deviceId": connectedDeviceId ?? "", "data": data])
    }
    promise.resolve(nil)
    #endif
  }

  // MARK: - Blood Glucose

  func handleReadStoredBloodGlucoseData(date: String?, promise: Promise) {
    #if targetEnvironment(simulator)
    promise.resolve(nil)
    #else
    guard let manager = bleManager,
          let deviceAddress = manager.peripheralModel?.deviceAddress else {
      promise.reject("DEVICE_NOT_CONNECTED", "No device connected"); return
    }
    guard (manager.peripheralModel?.bloodGlucoseType ?? 0) > 0 else {
      promise.reject("CAPABILITY_UNSUPPORTED", "Band does not support blood glucose history"); return
    }
    let queryDate = date ?? getDateString(dayOffset: 0)
    let records = VPDataBaseOperation.veepooSDKGetDeviceBloodGlucoseData(withDate: queryDate, andTableID: deviceAddress) as? [[String: Any]] ?? []
    for dict in records {
      let time = (dict["time"] as? String) ?? ""
      let ts = "\(queryDate) \(time)"
      let glucoseList = dict["bloodGlucoses"] as? [Any] ?? []
      let levelList = dict["bloodGlucoseLevels"] as? [Any] ?? []
      for (i, rawGlucose) in glucoseList.enumerated() {
        let glucose = Double((rawGlucose as? String) ?? "0") ?? 0
        let rawLevel = i < levelList.count ? levelList[i] : nil
        let levelInt = Int((rawLevel as? String) ?? "0") ?? 0
        let levelStr: String? = levelInt == 1 ? "low" : levelInt == 2 ? "normal" : levelInt == 3 ? "high" : nil
        var data: [String: Any] = ["timestamp": ts, "bloodGlucose": glucose]
        if let lvl = levelStr { data["level"] = lvl }
        sendEvent(STORED_BLOOD_GLUCOSE_DATA, ["deviceId": connectedDeviceId ?? "", "data": data])
      }
    }
    promise.resolve(nil)
    #endif
  }

  // MARK: - HRV

  func handleReadStoredHrvData(date: String?, promise: Promise) {
    #if targetEnvironment(simulator)
    promise.resolve(nil)
    #else
    guard let manager = bleManager,
          let deviceAddress = manager.peripheralModel?.deviceAddress else {
      promise.reject("DEVICE_NOT_CONNECTED", "No device connected"); return
    }
    guard (manager.peripheralModel?.hrvType ?? 0) != 0 else {
      promise.reject("CAPABILITY_UNSUPPORTED", "Band does not support HRV history"); return
    }
    let queryDate = date ?? getDateString(dayOffset: 0)
    let records = VPDataBaseOperation.veepooSDKGetDeviceHrvData(withDate: queryDate, andTableID: deviceAddress) as? [[String: Any]] ?? []
    for dict in records {
      let time = (dict["time"] as? String) ?? ""
      let ts = "\(queryDate) \(time)"
      let hrv = (dict["hrvValue"] as? NSNumber)?.intValue ?? 0
      let rawHearts = dict["hearts"] as? [Any] ?? []
      let rrIntervals = rawHearts.compactMap { raw -> Int? in
        if let n = raw as? NSNumber { return n.intValue }
        if let s = raw as? String { return Int(s) }
        return nil
      }
      sendEvent(STORED_HRV_DATA, [
        "deviceId": connectedDeviceId ?? "",
        "data": ["timestamp": ts, "hrv": hrv, "rrIntervals": rrIntervals]
      ])
    }
    promise.resolve(nil)
    #endif
  }

  // MARK: - ECG

  func handleReadStoredEcgData(date: String?, promise: Promise) {
    #if targetEnvironment(simulator)
    promise.resolve(nil)
    #else
    guard let manager = bleManager,
          let deviceAddress = manager.peripheralModel?.deviceAddress else {
      promise.reject("DEVICE_NOT_CONNECTED", "No device connected"); return
    }
    guard (manager.peripheralModel?.ecgType ?? 0) > 0 else {
      promise.reject("CAPABILITY_UNSUPPORTED", "Band does not support ECG history"); return
    }
    let queryDate = date ?? getDateString(dayOffset: 0)
    let records = VPDataBaseOperation.veepooSDKGetDeviceOffStoreECG(withDate: queryDate, andTableID: deviceAddress) ?? []
    for model in records {
      let ts = "\(model.date ?? queryDate) \(model.testTime ?? "00:00:00")"
      let filterRaw = model.filterSignals as? [NSNumber] ?? []
      let filterSignals = filterRaw.map { $0.intValue }
      let data: [String: Any] = [
        "timestamp": ts,
        "duration": Int(Double(model.duration ?? "0") ?? 0),
        "aveHeart": Int(Double(model.aveHeart ?? "0") ?? 0),
        "aveHrv": Int(Double(model.aveHrv ?? "0") ?? 0),
        "aveResRate": Int(Double(model.aveResRate ?? "0") ?? 0),
        "aveQT": Int(Double(model.aveQT ?? "0") ?? 0),
        "filterSignals": filterSignals,
      ]
      sendEvent(STORED_ECG_DATA, ["deviceId": connectedDeviceId ?? "", "data": data])
    }
    promise.resolve(nil)
    #endif
  }

  // MARK: - Body Composition

  func handleReadStoredBodyCompositionData(date: String?, promise: Promise) {
    #if targetEnvironment(simulator)
    promise.resolve(nil)
    #else
    guard let manager = bleManager,
          let deviceAddress = manager.peripheralModel?.deviceAddress else {
      promise.reject("DEVICE_NOT_CONNECTED", "No device connected"); return
    }
    guard (manager.peripheralModel?.bodyCompositionType ?? 0) > 0 else {
      promise.reject("CAPABILITY_UNSUPPORTED", "Band does not support body composition history"); return
    }
    let queryDate = date ?? getDateString(dayOffset: 0)
    let records = VPDataBaseOperation.veepooSDKGetDeviceOffStoreBodyComposition(withDate: queryDate, andTableID: deviceAddress) ?? []
    for model in records {
      let ts = "\(model.date ?? queryDate) \(model.testTime ?? "00:00:00")"
      let data: [String: Any] = [
        "timestamp": ts,
        "bmi": Double(model.bmi ?? "0") ?? 0,
        "bodyFatPercentage": Double(model.bodyFatPercentage ?? "0") ?? 0,
        "fatMass": Double(model.fatMass ?? "0") ?? 0,
        "leanBodyMass": Double(model.leanBodyMass ?? "0") ?? 0,
        "muscleRate": Double(model.muscleRate ?? "0") ?? 0,
        "muscleMass": Double(model.muscleMass ?? "0") ?? 0,
        "subcutaneousFat": Double(model.subcutaneousFat ?? "0") ?? 0,
        "bodyMoisture": Double(model.bodyMoisture ?? "0") ?? 0,
        "waterContent": Double(model.waterContent ?? "0") ?? 0,
        "skeletalMuscleRate": Double(model.skeletalMuscleRate ?? "0") ?? 0,
        "boneMass": Double(model.boneMass ?? "0") ?? 0,
        "proportionOfProtein": Double(model.proportionOfProtein ?? "0") ?? 0,
        "proteinAmount": Double(model.proteinAmount ?? "0") ?? 0,
        "basalMetabolicRate": Double(model.basalMetabolicRate ?? "0") ?? 0,
      ]
      sendEvent(STORED_BODY_COMPOSITION_DATA, ["deviceId": connectedDeviceId ?? "", "data": data])
    }
    promise.resolve(nil)
    #endif
  }
}
