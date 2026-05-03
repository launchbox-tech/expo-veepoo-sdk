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

  private func parseRunningDict(_ dict: NSDictionary) -> [String: Any] {
    let minuteArray = (dict["oneMinuteData"] as? [[String: Any]]) ?? []
    let minuteData: [[String: Any]] = minuteArray.map { item in
      return [
        "heartRate": item["heartValue"] ?? 0,
        "distance": item["disValue"] ?? 0,
        "calories": item["calValue"] ?? 0,
        "steps": item["stepValue"] ?? 0,
        "sportValue": item["sportValue"] ?? 0,
        "isPaused": (item["isPause"] as? Bool) ?? false,
      ]
    }
    let typeOrdinal = (dict["type"] as? Int) ?? 0
    return [
      "type": exerciseOrdinalToMode(typeOrdinal) as Any,
      "beginTime": dict["beginTime"] ?? "",
      "endTime": dict["endTime"] ?? "",
      "totalSteps": dict["totalStep"] ?? 0,
      "totalDistance": dict["totalDis"] ?? 0,
      "totalCalories": dict["totalCal"] ?? 0,
      "totalTime": dict["totalTime"] ?? 0,
      "averageHeartRate": dict["averHeart"] ?? 0,
      "averagePace": dict["averPace"] ?? 0,
      "pauseCount": dict["pauseCount"] ?? 0,
      "pauseTotalTime": dict["pauseTotalTime"] ?? 0,
      "minuteData": minuteData,
    ]
  }

  // MARK: - startReadExerciseData

  func handleStartReadExerciseData(promise: Promise) {
    #if targetEnvironment(simulator)
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
    guard let model = peripheralManage.peripheralModel, model.runningSaveTimes > 0 else {
      promise.reject("CAPABILITY_UNSUPPORTED", "Band does not support exercise history")
      return
    }

    peripheralManage.veepooSDKStartReadDeviceRunningData { [weak self] readState, totalTimes, currentTimes, progress in
      guard let self = self else { return }
      if readState == .complete {
        peripheralManage.veepooSDK_readDeviceRunningCrcResult { [weak self] crcValues in
          guard let self = self else { return }
          let slots = (crcValues as? [NSNumber])?
            .enumerated()
            .compactMap { $0.element.intValue != 0 ? $0.offset : nil } ?? []
          self.readExerciseSlotsSequentially(peripheralManage: peripheralManage, slots: slots, index: 0)
        }
      }
    }

    promise.resolve(nil)
    #endif
  }

  private func readExerciseSlotsSequentially(
    peripheralManage: VPPeripheralManage,
    slots: [Int],
    index: Int
  ) {
    guard index < slots.count else {
      sendEvent(READ_ORIGIN_COMPLETE, [
        "deviceId": connectedDeviceId ?? "",
        "success": true
      ])
      return
    }
    let blockNumber = slots[index]
    peripheralManage.veepooSDK_readDeviceRunningDataWithBlockNumber(blockNumber) { [weak self] dict, totalPackage, currentReadPackage in
      guard let self = self, let dict = dict else { return }
      if currentReadPackage == totalPackage {
        let session = self.parseRunningDict(dict as NSDictionary)
        self.sendEvent(EXERCISE_SESSION_DATA, [
          "deviceId": self.connectedDeviceId ?? "",
          "session": session
        ])
        self.readExerciseSlotsSequentially(
          peripheralManage: peripheralManage,
          slots: slots,
          index: index + 1
        )
      }
    }
  }
}
