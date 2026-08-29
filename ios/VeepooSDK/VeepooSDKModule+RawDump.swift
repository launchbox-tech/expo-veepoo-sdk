import ExpoModulesCore
import ObjectiveC
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
      // Vendor model objects (e.g. VPDailyBloodAnalysisModel — the cholesterol
      // panel) reach here: reflect their ObjC @properties into a dict instead
      // of an opaque `description` string, so the panel is captured as real
      // JSON (HDL/LDL/cholesterol/…), not a stringified blob.
      let obj = value as AnyObject
      if let cls = object_getClass(obj), let nsObj = obj as? NSObject {
        var count: UInt32 = 0
        if let props = class_copyPropertyList(cls, &count), count > 0 {
          defer { free(props) }
          var out: [String: Any] = [:]
          for i in 0..<Int(count) {
            let name = String(cString: property_getName(props[i]))
            if let v = nsObj.value(forKey: name) {
              out[name] = rawJsonSafe(v)
            }
          }
          if !out.isEmpty { return out }
        }
      }
      return String(describing: value)
    }
  }

  /// The vendor's own one-day `original_table` row, before the SDK narrows it.
  ///
  /// `+[VPDataBaseOperation veepooSDKGetOriginalDataWithDate:andTableID:]` is
  /// not a passthrough. Disassembly of VeepooBleSDK 2.2.101.15 shows it does:
  ///
  ///   item = [[DBStoreManager shareStoreManager]
  ///             getYTKKeyValueItemByDate:date
  ///                       DeviceAddress:mac
  ///                           fromTable:@"original_table"];
  ///   return [VPDataBaseOperation vpChangeOneDayOriginalDict:item.objectValue];
  ///
  /// That last hop rebuilds every 5-minute slot from a 12-key whitelist
  /// (heartValue/ppgs/ecgs/disValue/calValue/met/motionState/stress/
  /// sportValue/stepValue/diastolic/systolic), so nine stored fields never
  /// reach a caller: `Wear`, `resRates`, `sleepStates`, `sleepAddStates`,
  /// `resets`, `gesture`, `bloodGlucoses`, `bloodGlucoseLevels`, and the
  /// vendor's own `Step`/`SportValue` spellings.
  ///
  /// `Wear` is the one that matters: it is the band's answer to "was this on a
  /// wrist for this bucket", and in captured data 55-61% of buckets were NOT
  /// worn. Without it a quiet log is indistinguishable from a nightstand. So
  /// we reproduce the first two hops and stop before the narrowing one.
  ///
  /// Nothing here is in the public headers, so every hop is guarded and any
  /// miss returns nil — the caller then degrades to the narrowed public getter
  /// rather than crashing on a vendor SDK bump.
  private func originRawRows(dateStr: String, deviceAddress: String) -> Any? {
    guard let storeClass = NSClassFromString("DBStoreManager") else { return nil }
    let shareSel = NSSelectorFromString("shareStoreManager")
    let storeClassObj = storeClass as AnyObject
    guard storeClassObj.responds(to: shareSel),
          let manager = storeClassObj.perform(shareSel)?.takeUnretainedValue() as? NSObject
    else { return nil }

    let getSel = NSSelectorFromString("getYTKKeyValueItemByDate:DeviceAddress:fromTable:")
    guard manager.responds(to: getSel), let imp = manager.method(for: getSel) else { return nil }
    // `Unmanaged` return, not a plain `AnyObject?`: a `get`-prefixed ObjC
    // method hands back an autoreleased +0 value, and spelling that out makes
    // the ownership explicit instead of leaving it to what Swift infers for an
    // unsafeBitCast IMP. `takeUnretainedValue()` retains it into `item` before
    // the pool drains.
    typealias GetItemFn = @convention(c)
      (AnyObject, Selector, NSString, NSString, NSString) -> Unmanaged<AnyObject>?
    let getItem = unsafeBitCast(imp, to: GetItemFn.self)
    // Lowercase `original_table` — the binary also carries an `Original_table`
    // literal, and the wrong case reads back nil in silence.
    guard let item = getItem(
      manager, getSel, dateStr as NSString, deviceAddress as NSString, "original_table" as NSString
    )?.takeUnretainedValue() as? NSObject else { return nil }

    let valueSel = NSSelectorFromString("objectValue")
    guard item.responds(to: valueSel) else { return nil }
    return item.value(forKey: "objectValue")
  }

  func handleReadOriginRawDump(dayOffset: Int, promise: Promise) {
    #if targetEnvironment(simulator)
    rejectUnavailableOnSimulator(promise, "readOriginRawDump")
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

    // `origin` is the verbatim stored row: 19 fields per slot under the
    // vendor's own key spellings (capital `Wear`, `Step`, `SportValue`). No
    // re-mapping, no friendlier names, no `isWorn` boolean — `Wear` 0 means
    // worn and 2 means NOT worn, the inverse of the natural guess, and burying
    // that here would put it where nobody can check it. The SDK's own narrowed
    // view stays under `origin_normalized` for callers reading `stepValue`.
    let normalizedOrigin = VPDataBaseOperation.veepooSDKGetOriginalData(
      withDate: dateStr, andTableID: deviceAddress)
    let rawOrigin = originRawRows(dateStr: dateStr, deviceAddress: deviceAddress)
    put("origin", rawOrigin ?? normalizedOrigin)
    put("origin_normalized", normalizedOrigin)
    // The fallback restores exactly the 10-key shape this whole change exists
    // to fix, and resolves the promise as if nothing happened — the "absence
    // looks like a quiet log" failure, one level up. `origin_source` is what
    // makes it visible, so a caller must read it rather than diff key sets.
    // Only meaningful when a row was actually found: `put` drops an empty
    // dict, and naming a source for an absent `origin` would be a lie.
    if dump["origin"] != nil {
      dump["origin_source"] = rawOrigin != nil ? "original_table" : "veepooSDKGetOriginalData"
    }
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
