import ExpoModulesCore
import VeepooBleSDK

// Unfiltered per-day dump of the vendor SDK's local database (ADR-0016
// "get-everything" sink). Returns the RAW dicts of every per-day table the
// framework exposes a getter for — no field mapping, no unit normalization.
// Host apps persist the blobs verbatim and promote modalities to typed
// storage later, with real shapes in hand (header docs have proven
// unreliable: kcal-vs-cal, 12h clocks, phantom tiers).
extension VeepooSDKModule {

  /// Recursively coerce vendor values into bridge-safe JSON types.
  private func rawJsonSafe(_ value: Any) -> Any {
    switch value {
    case let dict as NSDictionary:
      var out: [String: Any] = [:]
      for (k, v) in dict {
        out[String(describing: k)] = rawJsonSafe(v)
      }
      return out
    case let array as NSArray:
      return array.map { rawJsonSafe($0) }
    case let data as Data:
      return data.base64EncodedString()
    case let date as Date:
      return date.timeIntervalSince1970
    case is NSNumber, is String:
      return value
    case is NSNull:
      return NSNull()
    default:
      return String(describing: value)
    }
  }

  func handleReadOriginRawDump(dayOffset: Int, promise: Promise) {
    #if targetEnvironment(simulator)
    promise.resolve([:] as [String: Any])
    #else
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
    // Every table-getter is a synchronous local-DB read — nothing here can
    // hang. Each entry: vendor table → raw rows for the requested date.
    var dump: [String: Any] = ["date": dateStr]

    func put(_ key: String, _ raw: Any?) {
      guard let raw = raw else { return }
      let safe = rawJsonSafe(raw)
      // Skip empty arrays/dicts to keep payloads lean.
      if let arr = safe as? [Any], arr.isEmpty { return }
      if let dict = safe as? [String: Any], dict.isEmpty { return }
      dump[key] = safe
    }

    put("origin", VPDataBaseOperation.veepooSDKGetOriginalData(withDate: dateStr, andTableID: deviceAddress))
    put("half_hour", VPDataBaseOperation.veepooSDKGetOriginalChangeHalfHourData(withDate: dateStr, andTableID: deviceAddress))
    put("oxygen", VPDataBaseOperation.veepooSDKGetDeviceOxygenData(withDate: dateStr, andTableID: deviceAddress))
    put("hrv", VPDataBaseOperation.veepooSDKGetDeviceHrvData(withDate: dateStr, andTableID: deviceAddress))
    put("temperature", VPDataBaseOperation.veepooSDKGetDeviceTemperatureData(withDate: dateStr, andTableID: deviceAddress))
    put("blood_glucose", VPDataBaseOperation.veepooSDKGetDeviceBloodGlucoseData(withDate: dateStr, andTableID: deviceAddress))
    put("blood_analysis", VPDataBaseOperation.veepooSDKGetDeviceBloodAnalysisData(withDate: dateStr, andTableID: deviceAddress))
    put("off_store_ecg", VPDataBaseOperation.veepooSDKGetDeviceOffStoreECG(withDate: dateStr, andTableID: deviceAddress))
    put("off_store_body_composition", VPDataBaseOperation.veepooSDKGetDeviceOffStoreBodyComposition(withDate: dateStr, andTableID: deviceAddress))
    put("sleep", VPDataBaseOperation.veepooSDKGetSleepData(withDate: dateStr, andTableID: deviceAddress))
    put("blood", VPDataBaseOperation.veepooSDKGetBloodData(withDate: dateStr, andTableID: deviceAddress))
    put("running", VPDataBaseOperation.veepooSDKGetDeviceRunningData(withDate: dateStr, andTableID: deviceAddress))

    promise.resolve(dump)
    #endif
  }
}
