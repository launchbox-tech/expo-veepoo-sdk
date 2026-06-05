import ExpoModulesCore
import VeepooBleSDK

extension VeepooSDKModule {
  func handleSyncPersonalInfo(info: [String: Any], promise: Promise) {
    #if targetEnvironment(simulator)
    promise.resolve(true)
    #else
    guard let peripheralManage = self.peripheralManage else {
      promise.reject("SDK_NOT_INITIALIZED", "Peripheral manager is nil")
      return
    }
    let pInfo = VPSyncPersonalInfo()
    pInfo.sex = Int32(info["sex"] as? Int ?? 1)
    pInfo.status = Int32(info["height"] as? Int ?? 170)
    pInfo.weight = Int32(info["weight"] as? Int ?? 65)
    pInfo.age = Int32(info["age"] as? Int ?? 25)
    pInfo.targetStep = Int32(info["stepAim"] as? Int ?? 8000)
    pInfo.targetSleepDuration = Int32(info["sleepAim"] as? Int ?? 480)
    // Vendor completion is runloop-driven — always enter from main, or the
    // callback may never fire (same constraint as readBattery / setDeviceTime).
    DispatchQueue.main.async {
      peripheralManage.veepooSDKSynchronousPersonalInformation(pInfo) { result in
        promise.resolve(result == 1)
      }
    }
    #endif
  }
}
