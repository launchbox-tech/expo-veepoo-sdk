import ExpoModulesCore
import VeepooBleSDK

extension VeepooSDKModule {
  func handleReadDeviceFunctions(promise: Promise) {
    #if targetEnvironment(simulator)
    promise.resolve(["package1": ["type": "DeviceFunctionPackage1", "bloodPressure": "unsupported", "heartRateDetect": "support"]])
    #else
    if self.cachedDeviceFunctions.isEmpty { self.cacheDeviceFunctions() }
    promise.resolve(self.cachedDeviceFunctions)
    #endif
  }

  func handleReadDeviceVersion(promise: Promise) {
    #if targetEnvironment(simulator)
    promise.resolve([
      "hardwareVersion": "1.0.0-SIMULATOR",
      "firmwareVersion": "2.0.0-SIMULATOR",
      "softwareVersion": "3.0.0-SIMULATOR",
      "deviceNumber": "SIM001",
      "newVersion": "",
      "description": "Simulator Mode"
    ])
    #else
    guard let manager = self.bleManager, let model = manager.peripheralModel else {
      promise.reject("DEVICE_NOT_CONNECTED", "No device connected or model unavailable")
      return
    }
    let result: [String: Any] = [
      "hardwareVersion": model.deviceVersion ?? "unknown",
      "firmwareVersion": "",
      "softwareVersion": "",
      "deviceNumber": String(model.deviceNumber),
      "newVersion": model.deviceNetVersion ?? "",
      "description": model.deviceNetVersionDes ?? ""
    ]
    self.sendEvent(DEVICE_VERSION, ["deviceId": self.connectedDeviceId ?? "", "version": result])
    promise.resolve(result)
    #endif
  }
}
