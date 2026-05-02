import ExpoModulesCore

#if targetEnvironment(simulator)
public class VeepooSDKModule: Module {
  public func definition() -> ModuleDefinition {
    Name("VeepooSDK")

    Events(
      "deviceFound", "deviceConnected", "deviceDisconnected", "deviceConnectStatus",
      "connectionStatusChanged", "deviceReady", "bluetoothStateChanged", "deviceFunction",
      "deviceVersion", "passwordData", "batteryData", "heartRateTestResult",
      "bloodPressureTestResult", "bloodOxygenTestResult", "temperatureTestResult",
      "stressData", "bloodGlucoseData", "sleepData", "sportStepData", "readOriginProgress",
      "readOriginComplete", "originFiveMinuteData", "originHalfHourData", "originSpo2Data",
      "socialMsgData", "findDeviceState", "firmwareDfuProgress", "error"
    )

    AsyncFunction("init") {}
    AsyncFunction("isBluetoothEnabled") { false }
    AsyncFunction("requestPermissions") {
      ["granted": false, "status": "denied", "canAskAgain": false]
    }
    AsyncFunction("startScan") { (_: [String: Any]?) in }
    AsyncFunction("stopScan") {}
    AsyncFunction("connect") { (_: String, _: [String: Any]?) in }
    AsyncFunction("disconnect") { (_: String) in }
    AsyncFunction("getConnectionStatus") { (_: String) in "disconnected" }
    AsyncFunction("verifyPassword") { (_: String, _: Bool) in ["status": "unsupported"] as [String: Any] }
    AsyncFunction("readBattery") { ["level": 0, "charging": false] as [String: Any] }
    AsyncFunction("syncPersonalInfo") { (_: [String: Any]) in false }
    AsyncFunction("readDeviceFunctions") { [:] as [String: Any] }
    AsyncFunction("readSocialMsgData") { [:] as [String: Any] }
    AsyncFunction("writeSocialMsgData") { (_: [String: Any]) in "unsupported" }
    AsyncFunction("readDeviceVersion") { ["version": "simulator"] as [String: Any] }
    AsyncFunction("startReadOriginData") {}
    AsyncFunction("readDeviceAllData") { false }
    AsyncFunction("readSleepData") { (_: String?) in [] as [Any] }
    AsyncFunction("readSportStepData") { (_: String?) in [] as [Any] }
    AsyncFunction("readOriginData") { (_: Int?) in [] as [Any] }
    AsyncFunction("readDaySummaryData") { (_: Int?) in [:] as [String: Any] }
    AsyncFunction("readAutoMeasureSetting") { [] as [Any] }
    AsyncFunction("modifyAutoMeasureSetting") { (_: [String: Any]) in [:] as [String: Any] }
    AsyncFunction("setLanguage") { (_: String) in false }

    AsyncFunction("startHeartRateTest") {}
    AsyncFunction("stopHeartRateTest") {}
    AsyncFunction("startBloodPressureTest") {}
    AsyncFunction("stopBloodPressureTest") {}
    AsyncFunction("startBloodOxygenTest") {}
    AsyncFunction("stopBloodOxygenTest") {}
    AsyncFunction("startTemperatureTest") {}
    AsyncFunction("stopTemperatureTest") {}
    AsyncFunction("startStressTest") {}
    AsyncFunction("stopStressTest") {}
    AsyncFunction("startBloodGlucoseTest") {}
    AsyncFunction("stopBloodGlucoseTest") {}
    AsyncFunction("startHrvTest") {}
    AsyncFunction("stopHrvTest") {}
    AsyncFunction("startEcgTest") { (_: [String: Any]?) in }
    AsyncFunction("stopEcgTest") {}
    AsyncFunction("startFatigueTest") {}
    AsyncFunction("stopFatigueTest") {}
    AsyncFunction("startBreathingTest") {}
    AsyncFunction("stopBreathingTest") {}
    AsyncFunction("startBodyCompositionTest") {}
    AsyncFunction("stopBodyCompositionTest") {}

    AsyncFunction("setDeviceTime") { (_: [String: Any]?) in false }
    AsyncFunction("readAlarms") { [] as [Any] }
    AsyncFunction("setAlarm") { (_: [String: Any]) in "unsupported" }
    AsyncFunction("deleteAlarm") { (_: Int) in "unsupported" }
    AsyncFunction("readHeartRateAlarm") { [:] as [String: Any] }
    AsyncFunction("setHeartRateAlarm") { (_: [String: Any]) in "unsupported" }
    AsyncFunction("startFindDevice") {}
    AsyncFunction("stopFindDevice") {}
    AsyncFunction("readScreenLightSettings") { [:] as [String: Any] }
    AsyncFunction("setScreenLightSettings") { (_: [String: Any]) in }
    AsyncFunction("readScreenLightDuration") { [:] as [String: Any] }
    AsyncFunction("setScreenLightDuration") { (_: Int) in }
    AsyncFunction("readSedentaryReminder") { [:] as [String: Any] }
    AsyncFunction("setSedentaryReminder") { (_: [String: Any]) in }
    AsyncFunction("readWristFlipWakeSettings") { [:] as [String: Any] }
    AsyncFunction("setWristFlipWakeSettings") { (_: [String: Any]) in }
    AsyncFunction("readWomenHealthSettings") { [:] as [String: Any] }
    AsyncFunction("setWomenHealthSettings") { (_: [String: Any]) in }
    AsyncFunction("startLocalFirmwareDfu") { (_: String) in }
    AsyncFunction("readWatchFaceStyle") { (_: [String: Any]?) in [:] as [String: Any] }
    AsyncFunction("setWatchFaceStyle") { (_: [String: Any]) in }
  }
}
#endif
