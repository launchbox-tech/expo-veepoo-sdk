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

  /// The band's epoch is NOT an absolute instant — it is a wall clock the band
  /// converted using a hard-coded +08:00, so it must be read back at +08:00.
  ///
  /// `setDeviceTime` pushes bare calendar components (year/month/day/h/m/s) with
  /// no zone, so the band knows a wall clock and nothing else. When it stamps a
  /// sport session it invents an offset — the vendor's own Asia/Shanghai — and
  /// encodes `wall − 08:00`. Rendering that with `TimeZone.current` therefore
  /// lands every session `08:00 − localOffset` away from when it happened:
  /// 2h15m early in Asia/Kathmandu (+05:45), 8h early in London, and exactly
  /// right in China, which is why the vendor never saw it.
  ///
  /// Reading it back at +08:00 recovers the wall clock the band meant, which is
  /// the same shape `parseSportModel` and `parseRunningDict` already return as
  /// strings — so all three exercise parsers now agree, and the JS side keeps
  /// labelling one wall clock with the phone's offset (ADR-0013).
  ///
  /// Ground truth: session epoch 1788042239 was a workout performed 06:23:59
  /// local in Asia/Kathmandu on 2026-08-30. At +08:00 it reads 06:23:59; at
  /// +05:45 it reads 04:08:59. The vendor docs use `Asia/Shanghai` for this
  /// same conversion.
  private static let bandEpochTimeZone = TimeZone(secondsFromGMT: 8 * 3600)

  private func exerciseTimestampString(_ unixSeconds: UInt32) -> String {
    let date = Date(timeIntervalSince1970: TimeInterval(unixSeconds))
    let formatter = DateFormatter()
    // Without an explicit POSIX locale, iOS rewrites fixed formats to the
    // user's 12-hour clock setting ("3:30:10 AM") — which no consumer parses.
    formatter.locale = Locale(identifier: "en_US_POSIX")
    formatter.timeZone = Self.bandEpochTimeZone
    formatter.dateFormat = "yyyy-MM-dd HH:mm:ss"
    return formatter.string(from: date)
  }

  // ── Session shapes → bridge dicts (JS contract: km + kcal, ADR-0016) ──────

  #if !targetEnvironment(simulator)
  // Vendor-typed helpers — no simulator slice carries these classes, so they
  // are compiled out. Every call site is inside a matching guard.
  /// [SAMPLE-OVERRUN] rayu.ai#566. The vendor hands back a session's minute
  /// array at the buffer's LENGTH, not its fill. Past the session's own data it
  /// continues into the PREVIOUSLY-recorded session's slots at the same offset,
  /// then repeats that buffer's final slot to the end. Proven by index-aligning
  /// two stored sessions: 08-28 aerobics (301 samples) matched 08-25 strength
  /// (69) in lockstep from index 34, then pinned on slot 68 for 233 frames; the
  /// 08-07/08-05 pair shows the same shape. The band was measuring throughout —
  /// the all-day table holds 58 distinct PPG values over the pinned span.
  ///
  /// Both vendor models declare the real fill on `recordCount` (the GPS header
  /// states it outright: "总记录条数，与分钟数量应相等" — should equal the
  /// minute count), and we mapped the whole array and dropped that field. The
  /// bound was always on the wire; this costs no extra BLE read.
  ///
  /// NOT the same buffer as rayu.ai#472. That one is the CRC *slot* array, whose
  /// length genuinely is the device's capacity and whose empty slots are already
  /// stripped in `readSportViaCrcApi`. This is the per-minute array inside one
  /// returned session.
  ///
  /// `declared == 0` is NOT read as "no samples". A zero means the band told us
  /// nothing about the fill, and per ADR-0060 that is not evidence of absence —
  /// so the array passes through whole and `deliveredSampleCount` carries the
  /// disagreement to JS, which annotates the session rather than trusting a
  /// silently trimmed stream. Same for `declared > delivered`: we never
  /// fabricate the missing tail, and we never drop a sample the band sent.
  private func boundedMinuteCount(declared: Int, delivered: Int) -> Int {
    guard declared > 0 else { return delivered }
    return min(declared, delivered)
  }

  /// New-API typed session (`VPDeviceSportModel`, framework ≥2.2.88).
  /// Header-documented units: totalDis = m, totalCal = kcal, times = s.
  private func parseSportModel(_ m: VPDeviceSportModel) -> [String: Any] {
    // [SAMPLE-OVERRUN] See `boundedMinuteCount` — `recordCount` is the band's
    // own fill; the array's length is the buffer's.
    let delivered = m.oneMinuteData.count
    let declared = Int(m.recordCount)
    let kept = boundedMinuteCount(declared: declared, delivered: delivered)
    let minuteData: [[String: Any]] = m.oneMinuteData.prefix(kept).map { item in
      return [
        "heartRate": Int(item.heartValue),
        "distance": Double(item.disValue) / 1000.0, // m → km
        "calories": Double(item.calValue) / 1000.0, // cal → kcal
        "steps": Int(item.stepValue),
        "sportValue": Int(item.sportValue),
        "isPaused": item.isPause == 1,
        // The band's own minute index. An overrun tail repeats the PRIOR
        // session's final index, so this is a second, independent witness to
        // the defect that does not depend on trusting `recordCount`.
        "packetIndex": Int(item.packageCount),
      ]
    }
    return [
      // Both counts ride out: `recordCount` is what the band declared,
      // `deliveredSampleCount` is what its array actually held. Equal means a
      // clean read; any disagreement is the signal JS annotates on.
      "recordCount": declared,
      "deliveredSampleCount": delivered,
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
    // [SAMPLE-OVERRUN] Same bound as the non-GPS path; this model's header is
    // the one that spells the invariant out ("should equal the minute count").
    let delivered = m.minutes.count
    let declared = Int(m.recordCount)
    let kept = boundedMinuteCount(declared: declared, delivered: delivered)
    let minuteData: [[String: Any]] = m.minutes.prefix(kept).map { item in
      return [
        "heartRate": Int(item.heart),
        "distance": Double(item.dis) / 1000.0, // m → km
        "calories": Double(item.cal) / 1000.0, // cal → kcal
        "steps": Int(item.step),
        "sportValue": Int(item.sport),
        "isPaused": item.pause == 1,
        "packetIndex": Int(item.packageCount),
      ]
    }
    return [
      "recordCount": declared,
      "deliveredSampleCount": delivered,
      // [BAND-OWN-EXTREMA] The band measures min/max HR itself. We were
      // dropping both and recomputing them from `minuteData` on the app side —
      // i.e. from the very array that overruns, so an affected session stored
      // the PREVIOUS session's extrema. Carry the band's values; the app
      // prefers them and falls back to the sample scan only where absent (the
      // non-GPS model has no such field).
      "maxHeartRate": Int(m.maxHeart),
      "minHeartRate": Int(m.minHeart),
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
  #endif

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

  #if !targetEnvironment(simulator)
  // Vendor-typed helpers — no simulator slice carries these classes, so they
  // are compiled out. Every call site is inside a matching guard.
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
        // [SLOT-ARRAY] The array is FIXED-LENGTH and its length is the device's
        // MAXIMUM sport-record capacity, not the number of records it holds.
        // A `0` entry is an EMPTY SLOT; the vendor header says to "directly
        // skip" it (`veepooSDK_readDeviceRunningCrcResult`, VPPeripheralBaseManage.h).
        //
        // We did not. Every empty slot went into `wanted`, and a CRC of 0 can
        // never be satisfied by a model that carries a real crc — so coverage
        // could not complete, and the pass burned all 3 rounds paying the 1.5s
        // settle between each. That is the ~3s in rayu.ai#472: 1055ms observed
        // when the array happened to be full (no zeros) against a 4038-4508ms
        // cluster at the SAME three sessions.
        //
        // `capacity` is kept for the log line: with zeros stripped it is the
        // only remaining evidence of how many slots this device actually has,
        // which decides whether the Band evicts old workouts (rayu.ai#473).
        let capacity = crcs.count
        let occupied = crcs.map { $0.intValue }.filter { $0 != 0 }
        guard !occupied.isEmpty else {
          self.finishExerciseRead(
            emitted: 0, readPath: "sport-api",
            outcomes: ["sport-crc:ok-empty[cap:\(capacity)]"], tableID: tableID
          )
          return
        }
        let wanted = Set(occupied)
        let crcList = occupied.map(String.init).joined(separator: "/")
        self.readSportPass(
          peripheralManage: peripheralManage,
          wanted: wanted,
          satisfied: [],
          round: 1,
          emitted: 0,
          outcomes: ["sport-crc:ok[\(crcList)],cap:\(capacity)"],
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
    // [COVERAGE-STALL] Two terminal conditions the CRC bookkeeping alone misses,
    // both measured on device 2026-08-26 (rayu.ai#472):
    //
    //   sport-crc:ok[10009/24629/21310],cap:3,
    //   r1:3 sessions, satisfied 2/3, r2:0 sessions, r3:0 sessions,
    //   coverage:missing[21310]                                    4381ms
    //
    // Round 1 delivered THREE sessions for three slots — everything the Band
    // had — but marked only two CRCs satisfied, because the vendor returned a
    // duplicate in place of one slot (the 2026-06-06 note this loop was built
    // for). So `missing` stayed non-empty over data we already held, and rounds
    // 2 and 3 each re-requested it, got nothing, and charged 1.5s of settle for
    // the privilege. ~3s of a 4.4s read, for zero additional data.
    //
    // `emitted >= wanted.count` is the honest completion test: as many sessions
    // as the Band has slots means there is nothing left to fetch, whatever the
    // CRC ledger says. It cannot under-read — it only fires once the count is
    // already met.
    //
    // A round that yields NOTHING is the second: the same firmware quirk that
    // makes back-to-back reads return empty means the next round returns empty
    // too. Both observed rounds did. Stopping is not giving up on the data —
    // the slot keeps its CRC, so the next sync re-requests it with a fresh
    // link, and `crcs_gone` reports it if the Band drops it first.
    if emitted >= wanted.count && !missing.isEmpty {
      // [UNDELIVERED] `emitted` counts MODELS, not distinct slots, so reaching
      // `wanted.count` does not mean every slot arrived. Measured 2026-08-29
      // (rayu.ai#546): got[gps:60075/60075/10009], dup[60075] — three models for
      // three slots, but 24629 was never delivered. The old label read
      // `count-complete[3/3]`, which claims a completeness this read did not earn.
      //
      // `missing` is non-empty by this branch's own guard, so name it. Ending
      // here is still right — the count test is what removed #472's two 1.5s
      // settles, and the slot keeps its CRC for the next sync. Only the CLAIM
      // was wrong, so only the claim changes; timing is untouched.
      //
      // Do NOT "fix" this by deduping `emitted` by CRC. Worked through on the
      // trace above: distinct = 2 < wanted.count = 3, so this test stops firing,
      // `emittedNow != emitted` skips the stall exit, and the pass takes the
      // settle branch — one full 1.5s round that returns nothing and STILL does
      // not recover 24629. Slower, equally lossy. See rayu.ai#546.
      let undelivered = missing.sorted().map(String.init).joined(separator: "/")
      finishExerciseRead(
        emitted: emitted, readPath: "sport-api",
        outcomes: outcomes + [
          "coverage:count-complete[\(satisfied.count) distinct/\(wanted.count)],undelivered[\(undelivered)]"
        ],
        tableID: tableID
      )
      return
    }
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
      if wanted.subtracting(satisfiedNow).isEmpty || round >= 3 || emittedNow >= wanted.count {
        // `emittedNow >= wanted.count` short-circuits HERE, not just at the top
        // of the next pass: reaching it through `next()` would still sleep the
        // 1.5s settle first, which is the whole cost being removed.
        next() // terminal guard above finishes immediately
      } else if emittedNow == emitted {
        // [COVERAGE-STALL] This round returned nothing new. Another will not
        // either, and waiting 1.5s to prove it is the cost this fix removes.
        self.finishExerciseRead(
          emitted: emittedNow, readPath: "sport-api",
          outcomes: outcomes + ["r\(round):\(outcome)", "coverage:stalled"],
          tableID: tableID
        )
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

    // [REQUEST-ORDER] `missing` is a Set, so `.map` emitted the CRCs in
    // UNSPECIFIED order — we do not know what order went out on any of the five
    // failures traced for rayu.ai#472. Sort it, and log it.
    //
    // Sorting is also the cheapest probe available for the 60075 pattern. Across
    // nine device reads the duplicate was ALWAYS 60075, which is first in the
    // band's own slot index (`crcs_offered: [60075, 10009, 24629]`). Two
    // mechanisms fit: the vendor falls back to the first entry of OUR request
    // array, or to the first entry of ITS index. Ascending order sends
    // 10009/24629/60075 — 60075 last — so the next duplicate discriminates:
    //
    //   dup becomes 10009  -> it follows our array; a batching artifact
    //   dup stays  60075   -> it follows the band's index; serialising the reads
    //                         cannot fix it, and that is the answer #472 asked
    //
    // Run this before reshaping the read into one call per CRC. That experiment
    // is only interpretable once the request order is known and deterministic.
    let requested = missing.sorted()
    let request = requested.map { NSNumber(value: $0) }
    let requestedList = requested.map(String.init).joined(separator: "/")
    peripheralManage.readDeviceSport(withCRC: request) { [weak self] sportModels, gpsModels in
      DispatchQueue.main.async {
        guard let self = self, !settled else { return }
        settled = true
        watchdog.cancel()

        var sessionsThisRound = 0
        var sportCrcs: [Int] = []
        var gpsCrcs: [Int] = []
        for model in sportModels ?? [] {
          emittedNow += 1
          sessionsThisRound += 1
          sportCrcs.append(Int(model.crc))
          satisfiedNow.insert(Int(model.crc))
          self.sendEvent(EXERCISE_SESSION_DATA, [
            "deviceId": self.connectedDeviceId ?? "",
            "session": self.parseSportModel(model)
          ])
        }
        for model in gpsModels ?? [] {
          emittedNow += 1
          sessionsThisRound += 1
          gpsCrcs.append(Int(model.crc))
          satisfiedNow.insert(Int(model.crc))
          self.sendEvent(EXERCISE_SESSION_DATA, [
            "deviceId": self.connectedDeviceId ?? "",
            "session": self.parseSportGpsModel(model)
          ])
        }

        // [ROUND-EVIDENCE] `satisfiedNow` is a Set and the outcome reported only
        // its COUNT, so the crc values the vendor actually sent were discarded at
        // the one place they exist. That is why rayu.ai#472 could measure the cost
        // of the duplicate but never name it.
        //
        // The arithmetic already narrows what we are looking for. `insert` runs
        // unconditionally, including for a crc that is not in `wanted` — so three
        // models carrying three DISTINCT crcs would have printed "satisfied 3/3"
        // even with an alien among them. The observed "3 sessions, satisfied 2/3"
        // therefore requires a REPEATED value. What is still open is which crc
        // repeated, whether an alien rides along ([A, A, X] also gives 2/3), and:
        //
        // The two vendor arrays are drained into the same counters. A GPS-bearing
        // session present in BOTH `sportModels` and `gpsModels` yields
        // "3 sessions, satisfied 2/3" from two REAL sessions — a double-count we
        // cause, not a vendor quirk we tolerate — and it inflates `emittedNow`,
        // which is what `emitted >= wanted.count` terminates on. `native_sessions
        // == sessions` cannot catch it: both sides derive from this emission.
        // Hence `got` is tagged by source rather than flattened.
        var sources: [String] = []
        if !sportCrcs.isEmpty {
          sources.append("sport:" + sportCrcs.map(String.init).joined(separator: "/"))
        }
        if !gpsCrcs.isEmpty {
          sources.append("gps:" + gpsCrcs.map(String.init).joined(separator: "/"))
        }
        var detail = ", req[\(requestedList)]"
        detail += sources.isEmpty ? "" : ", got[\(sources.joined(separator: ","))]"
        let received = sportCrcs + gpsCrcs
        let repeated = Set(received.filter { crc in received.filter { $0 == crc }.count > 1 })
        if !repeated.isEmpty {
          detail += ", dup[\(repeated.sorted().map(String.init).joined(separator: "/"))]"
        }
        let alien = Set(received.filter { !wanted.contains($0) })
        if !alien.isEmpty {
          detail += ", alien[\(alien.sorted().map(String.init).joined(separator: "/"))]"
        }
        finishRound("\(sessionsThisRound) sessions, satisfied \(satisfiedNow.count)/\(wanted.count)\(detail)")
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
  #endif
}
