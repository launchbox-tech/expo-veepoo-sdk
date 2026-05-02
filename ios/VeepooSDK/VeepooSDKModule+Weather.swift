import ExpoModulesCore
import VeepooBleSDK

extension VeepooSDKModule {

  // MARK: - Helpers

  private func weatherHandle() -> VPWeatherHandle? {
    return VPWeatherHandle.share()
  }

  private func weatherConfigToDict(_ model: VPWeatherConfigModel) -> [String: Any] {
    let unit = model.weatherUnit == 1 ? "F" : "C"
    return [
      "isOpen": model.switchState == 1,
      "unit": unit,
      "crc": model.crc,
    ]
  }

  // MARK: - Read

  func handleReadWeatherSettings(promise: Promise) {
    #if targetEnvironment(simulator)
    promise.resolve(["isOpen": false, "unit": "C", "crc": 0])
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
    guard let handle = weatherHandle() else {
      promise.reject("SDK_NOT_INITIALIZED", "VPWeatherHandle unavailable")
      return
    }

    let _ = peripheralManage // suppress unused warning; VPWeatherHandle uses shared BLE manager
    handle.readWeatherInfo { state, configModel in
      switch state {
      case .success:
        if let model = configModel {
          promise.resolve(self.weatherConfigToDict(model))
        } else {
          promise.resolve(["isOpen": false, "unit": "C", "crc": 0])
        }
      case .failure:
        promise.reject("READ_FAILED", "Read weather settings failed")
      default:
        promise.reject("CAPABILITY_UNSUPPORTED", "Band does not support weather function")
      }
    }
    #endif
  }

  // MARK: - Set switch + unit

  func handleSetWeatherSettings(_ settings: [String: Any], promise: Promise) {
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
    guard let handle = weatherHandle() else {
      promise.reject("SDK_NOT_INITIALIZED", "VPWeatherHandle unavailable")
      return
    }

    let _ = peripheralManage
    let isOpen = settings["isOpen"] as? Bool ?? false
    let unitStr = (settings["unit"] as? String)?.uppercased() ?? "C"
    let crc = (settings["crc"] as? NSNumber)?.uint16Value ?? 0

    let model = VPWeatherConfigModel()
    model.switchState = isOpen ? 1 : 0
    model.weatherUnit = unitStr == "F" ? 1 : 0
    model.crc = crc

    handle.settingWeatherInfo(model) { state in
      switch state {
      case .success:
        promise.resolve(nil)
      case .failure:
        promise.reject("OPERATION_FAILED", "Set weather settings failed")
      default:
        promise.reject("CAPABILITY_UNSUPPORTED", "Band does not support weather function")
      }
    }
    #endif
  }

  // MARK: - Push data

  func handlePushWeatherData(_ data: [String: Any], promise: Promise) {
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
    guard let handle = weatherHandle() else {
      promise.reject("SDK_NOT_INITIALIZED", "VPWeatherHandle unavailable")
      return
    }

    let _ = peripheralManage
    guard let serverModel = buildWeatherServerModel(from: data) else {
      promise.reject("INVALID_ARGUMENT", "Failed to build weather server model from provided data")
      return
    }

    handle.syncWeatherDataToDevice(with: serverModel) { state in
      switch state {
      case .success:
        promise.resolve(nil)
      case .failure:
        promise.reject("OPERATION_FAILED", "Push weather data to Band failed")
      default:
        promise.reject("CAPABILITY_UNSUPPORTED", "Band does not support weather function")
      }
    }
    #endif
  }

  // MARK: - Model builder

  private func buildWeatherServerModel(from data: [String: Any]) -> VPWeatherServerModel? {
    let model = VPWeatherServerModel()

    model.city = (data["cityName"] as? String) ?? ""
    model.lon = (data["longitude"] as? NSNumber)?.doubleValue ?? 0
    model.lat = (data["latitude"] as? NSNumber)?.doubleValue ?? 0

    // update timestamp — use current time formatted as vendor expects
    let now = Date()
    let df = DateFormatter()
    df.dateFormat = "yyyy-MM-dd HH:mm:ss"
    model.update = df.string(from: now)

    // Hourly forecasts (3-hour entries)
    let hourlyRaw = data["hourly"] as? [[String: Any]] ?? []
    model.hourly = hourlyRaw.compactMap { h -> VPWeatherServerHourlyModel? in
      let entry = VPWeatherServerHourlyModel()
      entry.time = h["time"] as? String ?? ""
      // iOS expects temp in °F
      entry.temp = (h["tempF"] as? NSNumber)?.doubleValue ?? 0
      if let uvi = h["uvIndex"] as? NSNumber { entry.uvi = uvi }
      entry.code = (h["weatherState"] as? NSNumber)?.intValue ?? 0
      entry.wind_sc = h["windLevel"] as? String ?? ""
      if let vis = h["visibilityM"] as? NSNumber { entry.vis = NSNumber(value: vis.doubleValue / 1000.0) }
      return entry
    }

    // Daily forecasts
    let dailyRaw = data["daily"] as? [[String: Any]] ?? []
    model.forecast = dailyRaw.compactMap { d -> VPWeatherServerForecastModel? in
      let entry = VPWeatherServerForecastModel()
      entry.date = d["date"] as? String ?? ""
      // iOS expects temp in °F
      entry.maxTemp = (d["maxTempF"] as? NSNumber)?.doubleValue ?? 0
      entry.minTemp = (d["minTempF"] as? NSNumber)?.doubleValue ?? 0
      if let uvi = d["uvIndex"] as? NSNumber { entry.uvi = uvi }
      entry.dayCode = NSNumber(value: (d["weatherStateDay"] as? NSNumber)?.intValue ?? 0)
      entry.nightCode = NSNumber(value: (d["weatherStateNight"] as? NSNumber)?.intValue ?? 0)
      entry.wind_sc = d["windLevel"] as? String ?? ""
      if let vis = d["visibilityM"] as? NSNumber {
        entry.vis = NSNumber(value: vis.doubleValue / 1000.0)
      }
      return entry
    }

    return model
  }
}
