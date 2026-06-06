import ExpoModulesCore
import VeepooBleSDK

extension VeepooSDKModule {

  private static let exerciseSportOrdinals: [String] = [
    "common",
    "outdoorRun", "outdoorWalk", "indoorRun", "indoorWalk", "hiking",
    "stairStepper", "outdoorCycle", "stationaryBike", "elliptical", "rowingMachine",
    "mountaineering", "swimming", "sitUps", "skiing", "jumpRope",
    "yoga", "tableTennis", "basketball", "volleyball", "football",
    "badminton", "tennis", "climbStairs", "fitness", "weightlifting",
    "diving", "boxing", "gymBall", "squatTraining", "triathlon",
    "dance", "hiit", "rockClimbing", "sports", "balls",
    "fitnessGame", "freeTime", "aerobics", "gymnastics", "floorExercise",
    "horizontalBar", "parallelBars", "trampoline", "trackAndField", "marathon",
    "pushUps", "dumbbell", "rugby", "handball", "baseballSoftball",
    "baseball", "hockey", "golf", "bowling", "billiards",
    "rowing", "sailboat", "skating", "curling", "icePuck",
    "sled", "strongWalk", "treadmill", "trailRunning", "raceWalking",
    "mountainBiking", "bmx", "orienteering", "fishing", "hunting",
    "skateboard", "rollerSkating", "parkour", "atv", "motocross",
    "climbingMachine", "spinningBike", "indoorFitness", "mixedAerobic", "crossTraining",
    "bodybuildingExercise", "groupGymnastics", "kickboxing", "strengthTraining", "steppingTraining",
    "coreTraining", "flexibilityTraining", "freeTraining", "pilates", "battleRope",
    "squareDance", "ballroomDancing", "bellyDance", "ballet", "hipHop",
    "zumba", "latinDance", "jazz", "hipHopDance", "poleDancing",
    "breakDance", "nationalDance", "modernDance", "disco", "tapDance",
    "wrestling", "martialArts", "taiChi", "muayThai", "judo",
    "taekwondo", "karate", "freeSparring", "swordsmanship", "jujitsu",
    "fencing", "beachSoccer", "beachVolleyball", "softball", "squash",
    "croquet", "cricket", "polo", "wallball", "takrawBall",
    "dodgeball", "waterPolo",
  ]

  private func exerciseOrdinalToMode(_ ordinal: Int) -> String? {
    guard ordinal >= 1 && ordinal < VeepooSDKModule.exerciseSportOrdinals.count else { return nil }
    return VeepooSDKModule.exerciseSportOrdinals[ordinal]
  }

  // The legacy SDK DB stores several fields as strings — coerce both shapes
  // so JS always receives numbers.
  private func exerciseNum(_ v: Any?) -> Double {
    if let n = v as? NSNumber { return n.doubleValue }
    if let s = v as? String { return Double(s) ?? 0 }
    return 0
  }

  // Durations may arrive as plain seconds or "[HH:]mm:ss" strings.
  private func exerciseSeconds(_ v: Any?) -> Double {
    if let s = v as? String, s.contains(":") {
      var total = 0.0
      for part in s.split(separator: ":") {
        total = total * 60 + (Double(part) ?? 0)
      }
      return total
    }
    return exerciseNum(v)
  }

  // Legacy DB timestamps may use "yyyy/MM/dd HH:mm:ss" — normalize to dashes
  // so the JS surface has ONE datetime shape (ADR-0013).
  private func exerciseDateString(_ v: Any?) -> String {
    ((v as? String) ?? "").replacingOccurrences(of: "/", with: "-")
  }

  private func exerciseTimestampString(_ unixSeconds: UInt32) -> String {
    let date = Date(timeIntervalSince1970: TimeInterval(unixSeconds))
    let formatter = DateFormatter()
    // Without an explicit POSIX locale, iOS rewrites fixed formats to the
    // user's 12-hour clock setting ("3:30:10 AM") — which no consumer parses.
    formatter.locale = Locale(identifier: "en_US_POSIX")
    formatter.dateFormat = "yyyy-MM-dd HH:mm:ss"
    return formatter.string(from: date)
  }

  // ── Session shapes → bridge dicts (JS contract: km + kcal, ADR-0016) ──────

  /// New-API typed session (`VPDeviceSportModel`, framework ≥2.2.88).
  /// Header-documented units: totalDis = m, totalCal = kcal, times = s.
  private func parseSportModel(_ m: VPDeviceSportModel) -> [String: Any] {
    let minuteData: [[String: Any]] = (m.oneMinuteData).map { item in
      return [
        "heartRate": Int(item.heartValue),
        "distance": Double(item.disValue) / 1000.0, // m → km
        "calories": Double(item.calValue) / 1000.0, // cal → kcal
        "steps": Int(item.stepValue),
        "sportValue": Int(item.sportValue),
        "isPaused": item.isPause == 1,
      ]
    }
    return [
      "type": exerciseOrdinalToMode(Int(m.type)) as Any,
      "crc": Int(m.crc),
      "beginTime": exerciseDateString(m.beginTime),
      "endTime": exerciseDateString(m.endTime),
      "totalSteps": Int(m.totalStep),
      "totalDistance": Double(m.totalDis) / 1000.0, // m → km
      // Header claims kcal; REAL device data (2026-06-06: 270106 for a 74-min
      // strength session ≈ 270 kcal) proves raw cal. Trust the device.
      "totalCalories": Double(m.totalCal) / 1000.0, // cal → kcal
      "totalTime": Int(m.totalTime),
      "averageHeartRate": Int(m.averHeart),
      "averagePace": Int(m.averPace),
      "pauseCount": Int(m.pauseCount),
      "pauseTotalTime": Int(m.pauseTotalTime),
      "minuteData": minuteData,
    ]
  }

  /// New-API GPS session (`VPDeviceSportWithGPSModel`) — summary mapped to
  /// the same session shape; GPS tracks are not carried (no schema for them
  /// yet). Timestamps are unix seconds.
  private func parseSportGpsModel(_ m: VPDeviceSportWithGPSModel) -> [String: Any] {
    let minuteData: [[String: Any]] = (m.minutes).map { item in
      return [
        "heartRate": Int(item.heart),
        "distance": Double(item.dis) / 1000.0, // m → km
        "calories": Double(item.cal) / 1000.0, // cal → kcal
        "steps": Int(item.step),
        "sportValue": Int(item.sport),
        "isPaused": item.pause == 1,
      ]
    }
    return [
      "type": exerciseOrdinalToMode(Int(m.sportType)) as Any,
      "crc": Int(m.crc),
      "beginTime": exerciseTimestampString(m.startTimestamp),
      "endTime": exerciseTimestampString(m.stopTimestamp),
      "totalSteps": Int(m.step),
      "totalDistance": Double(m.dis) / 1000.0, // m → km
      // Raw cal on the wire (device-verified 2026-06-06: 448615 ≈ 449 kcal).
      "totalCalories": Double(m.cal) / 1000.0, // cal → kcal
      "totalTime": Int(m.duration),
      "averageHeartRate": Int(m.aveHeart),
      "averagePace": Int(m.avePace),
      "pauseCount": Int(m.pauseCount),
      "pauseTotalTime": Int(m.pauseDuration),
      "minuteData": minuteData,
    ]
  }

  /// Legacy SDK-DB session dict (fallback path) — keys per the
  /// `VPDeviceRunning*Key` constants in `VPDataBaseOperation.h`. Legacy DB
  /// units: distance m, calories CAL (normalized → km/kcal here).
  private func parseRunningDict(_ dict: NSDictionary) -> [String: Any] {
    let minuteArray = (dict["oneMinuteData"] as? [[String: Any]]) ?? []
    let minuteData: [[String: Any]] = minuteArray.map { item in
      return [
        "heartRate": exerciseNum(item["heartValue"]),
        "distance": exerciseNum(item["disValue"]) / 1000.0, // m → km
        "calories": exerciseNum(item["calValue"]) / 1000.0, // cal → kcal
        "steps": exerciseNum(item["stepValue"]),
        "sportValue": exerciseNum(item["sportValue"]),
        "isPaused": exerciseNum(item["isPause"]) == 1,
      ]
    }
    let typeOrdinal = Int(exerciseNum(dict["type"]))
    return [
      "type": exerciseOrdinalToMode(typeOrdinal) as Any,
      "beginTime": exerciseDateString(dict["beginTime"]),
      "endTime": exerciseDateString(dict["endTime"]),
      "totalSteps": exerciseNum(dict["totalStep"]),
      "totalDistance": exerciseNum(dict["totalDis"]) / 1000.0, // m → km
      "totalCalories": exerciseNum(dict["totalCal"]) / 1000.0, // cal → kcal
      "totalTime": exerciseSeconds(dict["totalTime"]),
      "averageHeartRate": exerciseNum(dict["averHeart"]),
      "averagePace": exerciseNum(dict["averPace"]),
      "pauseCount": exerciseNum(dict["pauseCount"]),
      "pauseTotalTime": exerciseSeconds(dict["pauseTotalTime"]),
      "minuteData": minuteData,
    ]
  }

  // MARK: - startReadExerciseData

  func handleStartReadExerciseData(promise: Promise) {
    #if targetEnvironment(simulator)
    // Emit completion so the JS collector resolves [] instead of stalling.
    sendEvent(EXERCISE_READ_COMPLETE, [
      "deviceId": connectedDeviceId ?? "",
      "success": true
    ])
    promise.resolve(nil)
    #else
    guard self.isInitialized else {
      promise.reject("SDK_NOT_INITIALIZED", "SDK not initialized")
      return
    }
    guard let peripheralManage = self.peripheralManage else {
      promise.reject("DEVICE_NOT_CONNECTED", "No device connected")
      return
    }
    guard self.connectionState == .ready else {
      promise.reject("DEVICE_NOT_READY", "Device is not ready")
      return
    }
    // Same accessor the (working) origin DB reads use.
    let deviceAddress = (self.bleManager?.peripheralModel?.deviceAddress
      ?? peripheralManage.peripheralModel?.deviceAddress) ?? ""

    // ADR-0016 (framework 2.2.88.15): the typed sport API
    // (readDeviceSportCRCArr → readDeviceSportWithCRC) is the supported
    // path for band-recorded sessions — the iOS mirror of Android's
    // readSportModelOrigin. The legacy Start-transfer + DB sweep stays as a
    // fallback for app-started legacy sessions on older firmwares. The
    // stubbed VPPeripheralAddManage tier (CRC/block reads) is gone for good.
    DispatchQueue.main.async {
      self.readSportViaCrcApi(peripheralManage: peripheralManage, tableID: deviceAddress)
    }

    promise.resolve(nil)
    #endif
  }

  // ── Phase 1: typed sport API (≥2.2.88) ─────────────────────────────────────

  private func readSportViaCrcApi(peripheralManage: VPPeripheralManage, tableID: String) {
    emitExerciseSlotProgress(total: 0, current: 0)
    var settled = false
    let watchdog = DispatchWorkItem { [weak self] in
      guard let self = self, !settled else { return }
      settled = true
      self.startTransferThenReadDb(
        peripheralManage: peripheralManage,
        outcomes: ["sport-crc:timeout"],
        tableID: tableID
      )
    }
    DispatchQueue.main.asyncAfter(deadline: .now() + 10, execute: watchdog)

    peripheralManage.readDeviceSportCRCArr { [weak self] success, crcs in
      DispatchQueue.main.async {
        guard let self = self, !settled else { return }
        settled = true
        watchdog.cancel()
        guard success, let crcs = crcs, !crcs.isEmpty else {
          // Distinguish "answered: nothing stored" from "API declined".
          if success {
            self.finishExerciseRead(
              emitted: 0, readPath: "sport-api",
              outcomes: ["sport-crc:ok-empty"], tableID: tableID
            )
          } else {
            self.startTransferThenReadDb(
              peripheralManage: peripheralManage,
              outcomes: ["sport-crc:declined"],
              tableID: tableID
            )
          }
          return
        }
        // Closed-loop CRC coverage (device evidence 2026-06-06): the batch
        // read delivered a DUPLICATE in place of one slot, and follow-up
        // reads in the same pass return empty. Models carry their own `crc`
        // — so read, mark which CRCs actually arrived, then re-request only
        // the missing ones after a settling delay, up to 3 rounds.
        let wanted = Set(crcs.map { $0.intValue })
        let crcList = crcs.map { String($0.intValue) }.joined(separator: "/")
        self.readSportPass(
          peripheralManage: peripheralManage,
          wanted: wanted,
          satisfied: [],
          round: 1,
          emitted: 0,
          outcomes: ["sport-crc:ok[\(crcList)]"],
          tableID: tableID
        )
      }
    }
  }

  /// One coverage round: request every still-missing CRC in a batch, emit
  /// whatever arrives, mark the CRCs that actually came back, and retry the
  /// remainder after a settling delay (≤3 rounds). A per-round watchdog
  /// records "timeout" and finishes with partial coverage — nothing wedges.
  private func readSportPass(
    peripheralManage: VPPeripheralManage,
    wanted: Set<Int>,
    satisfied: Set<Int>,
    round: Int,
    emitted: Int,
    outcomes: [String],
    tableID: String
  ) {
    let missing = wanted.subtracting(satisfied)
    guard !missing.isEmpty, round <= 3 else {
      let missingList = missing.map(String.init).joined(separator: "/")
      finishExerciseRead(
        emitted: emitted,
        readPath: "sport-api",
        outcomes: outcomes + [missing.isEmpty ? "coverage:full" : "coverage:missing[\(missingList)]"],
        tableID: tableID
      )
      return
    }
    emitExerciseSlotProgress(total: wanted.count, current: satisfied.count + 1)

    var settled = false
    var emittedNow = emitted
    var satisfiedNow = satisfied
    let finishRound: (String) -> Void = { [weak self] outcome in
      guard let self = self else { return }
      let next = {
        self.readSportPass(
          peripheralManage: peripheralManage,
          wanted: wanted,
          satisfied: satisfiedNow,
          round: round + 1,
          emitted: emittedNow,
          outcomes: outcomes + ["r\(round):\(outcome)"],
          tableID: tableID
        )
      }
      if wanted.subtracting(satisfiedNow).isEmpty || round >= 3 {
        next() // terminal guard above finishes immediately
      } else {
        // Settling delay before re-requesting — back-to-back reads return
        // empty on this firmware.
        DispatchQueue.main.asyncAfter(deadline: .now() + 1.5, execute: next)
      }
    }
    let watchdog = DispatchWorkItem {
      if settled { return }
      settled = true
      finishRound("timeout")
    }
    DispatchQueue.main.asyncAfter(deadline: .now() + 30, execute: watchdog)

    let request = missing.map { NSNumber(value: $0) }
    peripheralManage.readDeviceSport(withCRC: request) { [weak self] sportModels, gpsModels in
      DispatchQueue.main.async {
        guard let self = self, !settled else { return }
        settled = true
        watchdog.cancel()

        var sessionsThisRound = 0
        for model in sportModels ?? [] {
          emittedNow += 1
          sessionsThisRound += 1
          satisfiedNow.insert(Int(model.crc))
          self.sendEvent(EXERCISE_SESSION_DATA, [
            "deviceId": self.connectedDeviceId ?? "",
            "session": self.parseSportModel(model)
          ])
        }
        for model in gpsModels ?? [] {
          emittedNow += 1
          sessionsThisRound += 1
          satisfiedNow.insert(Int(model.crc))
          self.sendEvent(EXERCISE_SESSION_DATA, [
            "deviceId": self.connectedDeviceId ?? "",
            "session": self.parseSportGpsModel(model)
          ])
        }
        finishRound("\(sessionsThisRound) sessions, satisfied \(satisfiedNow.count)/\(wanted.count)")
      }
    }
  }

  // ── Phase 2 (fallback): legacy Start transfer + SDK-DB sweep ──────────────

  private func startTransferThenReadDb(
    peripheralManage: VPPeripheralManage,
    outcomes: [String],
    tableID: String
  ) {
    peripheralManage.veepooSDKStartReadDeviceRunningData { [weak self] readState, totalTimes, currentTimes, progress in
      guard let self = self else { return }

      let stateName: String
      switch readState {
      case .start: stateName = "start"
      case .reading: stateName = "reading"
      case .complete: stateName = "complete"
      default: stateName = "invalid"
      }
      self.sendEvent(EXERCISE_READ_PROGRESS, [
        "deviceId": self.connectedDeviceId ?? "",
        "progress": [
          "phase": "transfer",
          "readState": stateName,
          "total": totalTimes,
          "current": currentTimes,
          "progress": progress
        ]
      ])

      if readState == .complete {
        self.emitStoredExerciseSessions(
          outcomes: outcomes + ["start:complete"],
          tableID: tableID
        )
      } else if readState != .start && readState != .reading {
        self.finishExerciseRead(
          emitted: 0,
          readPath: "start-db",
          outcomes: outcomes + ["start:invalid"],
          tableID: tableID
        )
      }
    }
  }

  /// Legacy fallback tail: sweep the SDK's local DB (nil-date + last 8 days)
  /// and emit whatever it holds. Synchronous — cannot hang the collector.
  private func emitStoredExerciseSessions(outcomes: [String], tableID: String) {
    var sessions: [NSDictionary] = []
    func collect(_ raw: [Any]) {
      for element in raw {
        if let day = element as? [NSDictionary] {
          sessions.append(contentsOf: day)
        } else if let dict = element as? NSDictionary {
          sessions.append(dict)
        }
      }
    }

    collect((VPDataBaseOperation.veepooSDKGetDeviceRunningData(withDate: nil, andTableID: tableID) as? [Any]) ?? [])
    if sessions.isEmpty {
      for offset in 0...7 {
        collect((VPDataBaseOperation.veepooSDKGetDeviceRunningData(withDate: getDateString(dayOffset: offset), andTableID: tableID) as? [Any]) ?? [])
      }
    }
    // isHide == 1 → the user deleted this session on the device.
    let visible = sessions.filter { exerciseNum($0["isHide"]) != 1 }

    for (index, dict) in visible.enumerated() {
      emitExerciseSlotProgress(total: visible.count, current: index + 1)
      sendEvent(EXERCISE_SESSION_DATA, [
        "deviceId": connectedDeviceId ?? "",
        "session": parseRunningDict(dict)
      ])
    }
    finishExerciseRead(
      emitted: visible.count,
      readPath: "start-db",
      outcomes: outcomes + ["db:\(visible.count) rows"],
      tableID: tableID
    )
  }

  // ── Shared emit helpers ────────────────────────────────────────────────────

  private func emitExerciseSlotProgress(total: Int, current: Int) {
    sendEvent(EXERCISE_READ_PROGRESS, [
      "deviceId": connectedDeviceId ?? "",
      "progress": [
        "phase": "slots",
        "readState": "reading",
        "total": total,
        "current": current,
        "progress": 0
      ]
    ])
  }

  /// Dedicated completion event (ADR-0015) — never reuse
  /// READ_ORIGIN_COMPLETE. Extra fields are read-path diagnostics — they
  /// surface in the host's event log so any outcome is attributable without
  /// another instrumented build.
  private func finishExerciseRead(emitted: Int, readPath: String, outcomes: [String], tableID: String) {
    sendEvent(EXERCISE_READ_COMPLETE, [
      "deviceId": connectedDeviceId ?? "",
      "success": true,
      "sessionsEmitted": emitted,
      "readPath": readPath,
      "blockOutcomes": outcomes.joined(separator: ","),
      "tableId": tableID
    ])
  }
}
