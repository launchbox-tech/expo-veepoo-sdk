import ExpoModulesCore
import VeepooBleSDK

extension VeepooSDKModule {

  // MARK: - setDeviceGPSAndTimezone

  func handleSetDeviceGPSAndTimezone(_ data: [String: Any], promise: Promise) {
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

    // Check agpsFunction capability
    guard let model = peripheralManage.peripheralModel,
          model.agpsFunction > 0 else {
      promise.reject("CAPABILITY_UNSUPPORTED", "Band does not support AGPS")
      return
    }

    let latitude = data["latitude"] as? Double ?? 0.0
    let longitude = data["longitude"] as? Double ?? 0.0
    let altitude = data["altitude"] as? Double ?? 0.0
    let timezoneOffsetMinutes = data["timezoneOffsetMinutes"] as? Int ?? 0

    let gpsModel = VPDeviceGPSModel()
    // Vendor expects lat/lon scaled by 100000 as Int32
    gpsModel.longitude = Int32(longitude * 100000)
    gpsModel.latitude = Int32(latitude * 100000)
    gpsModel.altitude = Int16(altitude)
    gpsModel.timezone = Int16(timezoneOffsetMinutes)

    peripheralManage.veepooSDK_setDeviceGPSAndTimezone(with: gpsModel) { resultState in
      switch resultState {
      case 0:
        promise.reject("CAPABILITY_UNSUPPORTED", "Band does not support GPS settings")
      case 1:
        promise.resolve(nil)
      case 2:
        promise.reject("OPERATION_FAILED", "Set GPS and timezone failed")
      default:
        promise.resolve(nil)
      }
    }
    #endif
  }
}
