import ExpoModulesCore
import VeepooBleSDK

extension VeepooSDKModule {

  private static let sportModeOrdinals: [String] = [
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

  private func ordinalToSportMode(_ ordinal: Int) -> String? {
    guard ordinal >= 1 && ordinal < VeepooSDKModule.sportModeOrdinals.count else { return nil }
    return VeepooSDKModule.sportModeOrdinals[ordinal]
  }

  private func sportModeToRuningMode(_ mode: String) -> VPDeviceRuningMode? {
    guard let idx = VeepooSDKModule.sportModeOrdinals.firstIndex(of: mode), idx >= 1 else { return nil }
    return VPDeviceRuningMode(rawValue: idx)
  }

  // MARK: - readSportMode

  func handleReadSportMode(promise: Promise) {
    #if targetEnvironment(simulator)
    promise.resolve(["mode": nil as Any?, "isActive": false])
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
      promise.reject("CAPABILITY_UNSUPPORTED", "Band does not support sport mode")
      return
    }
    // settingType 2 = read; runMode ignored on read; callback returns runningType (0=off, 1=on)
    peripheralManage.veepooSDKSettingDeviceRunning(2, run: .Common) { [weak self] runningType, _ in
      guard let self = self else { return }
      let isActive = runningType == 1
      // iOS vendor only returns on/off status on read, not the specific mode
      promise.resolve(["mode": nil as Any?, "isActive": isActive])
    }
    #endif
  }

  // MARK: - setSportMode

  func handleSetSportMode(_ mode: String, promise: Promise) {
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
      promise.reject("CAPABILITY_UNSUPPORTED", "Band does not support sport mode")
      return
    }
    guard let runMode = sportModeToRuningMode(mode) else {
      promise.reject("INVALID_ARGUMENT", "Unknown sport mode: \(mode)")
      return
    }
    peripheralManage.veepooSDKSettingDeviceRunning(1, run: runMode) { [weak self] _, success in
      guard self != nil else { return }
      if success {
        promise.resolve(nil)
      } else {
        promise.reject("SET_FAILED", "setSportMode failed")
      }
    }
    #endif
  }

  // MARK: - stopSportMode

  func handleStopSportMode(promise: Promise) {
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
      promise.reject("CAPABILITY_UNSUPPORTED", "Band does not support sport mode")
      return
    }
    peripheralManage.veepooSDKSettingDeviceRunning(0, run: .Common) { [weak self] _, success in
      guard self != nil else { return }
      if success {
        promise.resolve(nil)
      } else {
        promise.reject("STOP_FAILED", "stopSportMode failed")
      }
    }
    #endif
  }
}
