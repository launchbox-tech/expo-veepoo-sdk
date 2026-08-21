import ExpoModulesCore
import VeepooBleSDK

extension VeepooSDKModule {
  func handleReadDeviceFunctions(promise: Promise) {
    #if targetEnvironment(simulator)
    rejectUnavailableOnSimulator(promise, "readDeviceFunctions")
    #else
    if self.cachedDeviceFunctions.isEmpty { self.cacheDeviceFunctions() }
    promise.resolve(self.cachedDeviceFunctions)
    #endif
  }

  func handleReadDeviceVersion(promise: Promise) {
    #if targetEnvironment(simulator)
    rejectUnavailableOnSimulator(promise, "readDeviceVersion")
    #else
    guard let manager = self.bleManager, let model = manager.peripheralModel else {
      promise.reject("DEVICE_NOT_CONNECTED", "No device connected or model unavailable")
      return
    }
    // VPPeripheralModel.deviceVersion is "the display version of the device"
    // (per the framework header) — the firmware version shown to users. The
    // model exposes no separate hardware/software version.
    let result: [String: Any] = [
      "hardwareVersion": "",
      "firmwareVersion": model.deviceVersion ?? "",
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
