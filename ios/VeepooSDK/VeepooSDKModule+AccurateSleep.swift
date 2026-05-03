import ExpoModulesCore
import VeepooBleSDK

extension VeepooSDKModule {

  func handleReadAccurateSleepData(date: String?, promise: Promise) {
    #if targetEnvironment(simulator)
    promise.resolve(nil)
    #else
    guard let manager = bleManager,
          let deviceAddress = manager.peripheralModel?.deviceAddress else {
      promise.reject("DEVICE_NOT_CONNECTED", "No device connected")
      return
    }
    guard (manager.peripheralModel?.sleepType ?? 0) > 0 else {
      promise.reject("CAPABILITY_UNSUPPORTED", "Band does not support precise sleep (sleepType == 0)")
      return
    }

    let queryDate = date ?? self.getDateString(dayOffset: 0)

    guard let sessions = VPDataBaseOperation.veepooSDKGetAccurateSleepData(
      withDate: queryDate, andTableID: deviceAddress
    ) else {
      promise.resolve(nil)
      return
    }

    for item in sessions {
      let curve = parseSleepLineToMinuteCurve(item.sleepLine)
      let session: [String: Any] = [
        "sleepTime": item.sleepTime ?? "",
        "wakeTime": item.wakeTime ?? "",
        "deepDuration": Int(Double(item.deepDuration ?? "0") ?? 0),
        "lightDuration": Int(Double(item.lightDuration ?? "0") ?? 0),
        "remDuration": Int(Double(item.otherDuration ?? "0") ?? 0),
        "getUpDuration": Int(Double(item.getUpDuration ?? "0") ?? 0),
        "sleepDuration": Int(Double(item.sleepDuration ?? "0") ?? 0),
        "getUpTimes": Int(Double(item.getUpTimes ?? "0") ?? 0),
        "sleepQuality": Int(Double(item.sleepQuality ?? "0") ?? 0),
        "insomniaScore": Int(Double(item.insomniaScore ?? "0") ?? 0),
        "insomniaTimes": Int(Double(item.insomniaTimes ?? "0") ?? 0),
        "fallAsleepScore": Int(Double(item.fallAsleepScore ?? "0") ?? 0),
        "sleepEfficiencyScore": Int(Double(item.sleepEfficiencyScore ?? "0") ?? 0),
        "curve": curve,
      ]
      sendEvent(ACCURATE_SLEEP_DATA, [
        "deviceId": connectedDeviceId ?? "",
        "date": queryDate,
        "data": session,
      ])
    }
    promise.resolve(nil)
    #endif
  }

  private func parseSleepLineToMinuteCurve(_ sleepLine: String?) -> [[String: Any]] {
    guard let line = sleepLine, !line.isEmpty else { return [] }
    let states = ["deep", "light", "rem", "insomnia", "awake"]
    var result: [[String: Any]] = []
    let raw = line as NSString
    var minuteIndex = 0
    var i = 0
    while i + 3 < raw.length {
      let hexWord = raw.substring(with: NSRange(location: i, length: 4))
      guard let word = UInt16(hexWord, radix: 16) else { break }
      let stateIdx = Int((word >> 13) & 0x7)
      if stateIdx < states.count {
        result.append(["index": minuteIndex, "state": states[stateIdx]])
      }
      minuteIndex += 1
      i += 4
    }
    return result
  }
}
