import ExpoModulesCore
import VeepooBleSDK

extension VeepooSDKModule {
  func handleSetLanguage(language: String, promise: Promise) {
    #if targetEnvironment(simulator)
    rejectUnavailableOnSimulator(promise, "setLanguage")
    #else
    guard self.isInitialized else {
      promise.reject("SDK_NOT_INITIALIZED", "SDK not initialized")
      return
    }
    guard let manager = self.bleManager, let peripheralManage = manager.peripheralManage else {
      promise.reject("DEVICE_NOT_CONNECTED", "No device connected")
      return
    }
    let languageMap: [String: UInt8] = [
      "chinese": 1, "english": 2, "japanese": 3, "korean": 4, "german": 5,
      "russian": 6, "spanish": 7, "italian": 8, "french": 9, "vietnamese": 10,
      "portuguese": 11, "chineseTraditional": 12, "thai": 13, "polish": 14,
      "swedish": 15, "turkish": 16, "dutch": 17, "czech": 18, "arabic": 19,
      "hungarian": 20, "greek": 21, "romanian": 22, "slovak": 23, "indonesian": 24,
      "brazilianPortuguese": 25, "croatian": 26, "lithuanian": 27, "ukrainian": 28,
      "hindi": 29, "hebrew": 30, "danish": 31, "persian": 32, "malay": 34
    ]
    guard let languageType = languageMap[language] else {
      promise.reject("INVALID_LANGUAGE", "Unknown language: \(language)")
      return
    }
    let promiseBox = self.makePromiseBox(promise)
    peripheralManage.veepooSDKSettingLanguage(languageType) { success in
      promiseBox.resolve(success)
    }
    #endif
  }
}
