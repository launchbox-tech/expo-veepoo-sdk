import ExpoModulesCore
import CoreBluetooth
import VeepooBleSDK

// MARK: - PromiseBox
//
// A vendor-block-safe holder for an Expo `Promise`.
//
// The Veepoo SDK stores completion blocks as properties on its manager
// objects and releases an old block only when the next call replaces it
// (or at dealloc) — often on a BLE thread, long after a JS reload has torn
// down the runtime that created the Promise. A Promise captured directly
// in such a block is then destroyed against a dead runtime → SIGSEGV in
// `JavaScriptPromise.deinit` (crashes 2026-06-05: `performConnect`,
// `handleReadBattery`).
//
// Vendor blocks must capture a `PromiseBox` instead. The box is a plain
// Swift class — destroying it at any time on any thread is safe once the
// Promise inside has been settled or cleared. `VeepooSDKModule.cleanup()`
// clears every live box while the runtime is still alive, turning late
// vendor callbacks into no-ops.
//
// Lives in this file (not its own) so the generated Pods project — whose
// file list is fixed at `pod install` time — picks it up without a
// reinstall.
final class PromiseBox {
  private let lock = NSLock()
  private var promise: Promise?

  init(_ promise: Promise) {
    self.promise = promise
  }

  private func take() -> Promise? {
    lock.lock()
    defer { lock.unlock() }
    let taken = promise
    promise = nil
    return taken
  }

  /// Settles at most once; later calls (and calls after `clear()`) are no-ops.
  func resolve(_ value: Any? = nil) {
    take()?.resolve(value)
  }

  func reject(_ code: String, _ message: String) {
    take()?.reject(code, message)
  }

  /// Drops the promise without settling (module teardown). Must run while
  /// the JS runtime is still alive — `cleanup()` is the only caller.
  func clear() {
    _ = take()
  }
}

// MARK: - 主模块
//
// This file is intentionally wiring-only: the `Module` subclass holds
// session/connection state, and `definition()` registers each Expo
// `AsyncFunction` as a one-line dispatch to a `handle<Feature>` method
// living in the matching `VeepooSDKModule+<Feature>.swift` extension.
// Event-name constants are in `VeepooEvents.swift`; the connection-state
// enum and permission delegate live in their own files alongside.
//
// Expo's iOS Module DSL builds the definition body with a result builder
// that takes a flat variadic list of `AnyDefinition`, so each
// `AsyncFunction(...)` call must remain in this body (see #194 follow-up:
// helpers can be moved out only once `buildArray` lands in
// `ModuleDefinitionBuilder`).
public class VeepooSDKModule: Module {
  var bleManager: VPBleCentralManage?
  var peripheralManage: VPPeripheralManage?
  var isScanning = false
  var connectedDeviceId: String?
  var isInitialized = false
  var centralManager: CBCentralManager?
  var permissionPromise: Promise?
  var permissionCentralManager: CBCentralManager?
  var permissionDelegate: PermissionDelegate?
  var pendingScanStart = false
  var discoveredDevices: [String: VPPeripheralModel] = [:]
  var pendingConnectDeviceId: String?
  var pendingConnectPassword: String?
  var pendingConnectIs24Hour: Bool = false
  var pendingConnectPromise: Promise?
  var activeConnectDeviceId: String?
  var cachedDeviceFunctions: [String: Any] = [:]
  var activeMeasurementType: String?
  var ecgIncludeWaveform: Bool = false
  var isFirmwareDfuActive: Bool = false

  var connectionState: ConnectionState = .idle {
    didSet {
      print("[VeepooSDK] 状态变化: \(oldValue.rawValue) -> \(connectionState.rawValue)")
      let previousStatus = publicConnectionStatus(for: oldValue)
      let currentStatus = publicConnectionStatus(for: connectionState)
      if previousStatus != currentStatus, let deviceId = connectedDeviceId ?? activeConnectDeviceId {
        emitConnectionStatus(deviceId: deviceId, status: currentStatus)
      }
    }
  }

  var authenticationTimer: Timer?
  var connectionTimer: Timer?
  var authenticationRetryCount = 0
  let maxAuthenticationRetries = 3

  // Registry of PromiseBoxes currently captured by vendor blocks. Weak:
  // each box is kept alive by the vendor block that captured it and falls
  // out of the table when the vendor releases the block. cleanup() clears
  // every live box so late vendor callbacks become no-ops (see PromiseBox).
  private let livePromiseBoxes = NSHashTable<PromiseBox>.weakObjects()
  private let livePromiseBoxesLock = NSLock()

  func makePromiseBox(_ promise: Promise) -> PromiseBox {
    let box = PromiseBox(promise)
    livePromiseBoxesLock.lock()
    livePromiseBoxes.add(box)
    livePromiseBoxesLock.unlock()
    return box
  }

  func clearAllPromiseBoxes() {
    livePromiseBoxesLock.lock()
    let boxes = livePromiseBoxes.allObjects
    livePromiseBoxesLock.unlock()
    for box in boxes {
      box.clear()
    }
  }

  func publicConnectionStatus(for state: ConnectionState) -> String {
    switch state {
    case .idle, .disconnected:
      return "disconnected"
    case .scanning, .connecting, .discoveringServices:
      return "connecting"
    case .connected, .authenticating:
      return "connected"
    case .ready:
      return "ready"
    case .disconnecting:
      return "disconnecting"
    case .error:
      return "error"
    }
  }

  func makePermissionsResult(status: String, granted: Bool, canAskAgain: Bool) -> [String: Any] {
    return [
      "granted": granted,
      "status": status,
      "canAskAgain": canAskAgain
    ]
  }

  public func handlePermissionStateUpdate(_ central: CBCentralManager) {
    let authorization = CBManager.authorization
    if authorization == .notDetermined && (central.state == .unknown || central.state == .resetting) {
      return
    }

    guard let promise = self.permissionPromise else { return }
    self.permissionPromise = nil

    let result: [String: Any]
    switch authorization {
    case .allowedAlways:
      if central.state == .poweredOff {
        result = makePermissionsResult(status: "powered_off", granted: false, canAskAgain: false)
      } else {
        result = makePermissionsResult(status: "granted", granted: true, canAskAgain: false)
      }
    case .restricted:
      result = makePermissionsResult(status: "restricted", granted: false, canAskAgain: false)
    case .denied:
      result = makePermissionsResult(status: "denied", granted: false, canAskAgain: false)
    case .notDetermined:
      result = makePermissionsResult(status: "unknown", granted: false, canAskAgain: true)
    @unknown default:
      result = makePermissionsResult(status: "unknown", granted: false, canAskAgain: true)
    }

    promise.resolve(result)
    self.emitBluetoothStatus()
  }

  public func definition() -> ModuleDefinition {
    Name("VeepooSDK")

    // MARK: Events
    Events(
      DEVICE_FOUND, DEVICE_CONNECTED, DEVICE_DISCONNECTED,
      DEVICE_CONNECT_STATUS, CONNECTION_STATUS_CHANGED, DEVICE_READY, BLUETOOTH_STATE_CHANGED,
      DEVICE_FUNCTION, DEVICE_VERSION, PASSWORD_DATA,
      HEART_RATE_TEST_RESULT, BLOOD_PRESSURE_TEST_RESULT,
      BLOOD_OXYGEN_TEST_RESULT, TEMPERATURE_TEST_RESULT,
      STRESS_DATA, BLOOD_GLUCOSE_DATA, BATTERY_DATA,
      READ_ORIGIN_PROGRESS, READ_ORIGIN_COMPLETE,
      ORIGIN_FIVE_MINUTE_DATA, ORIGIN_HALF_HOUR_DATA,
      ORIGIN_SPO2_DATA, SOCIAL_MSG_DATA,
      SLEEP_DATA, SPORT_STEP_DATA, ALARM_DATA,
      HRV_TEST_RESULT, ECG_TEST_RESULT, FATIGUE_TEST_RESULT, BREATHING_TEST_RESULT,
      BODY_COMPOSITION_TEST_RESULT,
      FIND_DEVICE_STATE,
      FIRMWARE_DFU_PROGRESS,
      CONTACTS_DATA,
      SOS_CALL_TIMES_DATA,
      CAMERA_SHUTTER,
      MUSIC_REMOTE_COMMAND,
      DEVICE_BT_STATE_CHANGED,
      DEVICE_SOS_TRIGGERED,
      CUSTOM_SETTINGS_DATA,
      HEALTH_REMIND_DATA,
      APNEA_REMIND_DATA,
      SPORT_MODE_DATA,
      BLOOD_ANALYSIS_TEST_RESULT,
      GSR_TEST_RESULT,
      EXERCISE_SESSION_DATA,
      EXERCISE_READ_COMPLETE,
      EXERCISE_READ_PROGRESS,
      ACCURATE_SLEEP_DATA,
      STORED_TEMPERATURE_DATA,
      STORED_BLOOD_GLUCOSE_DATA,
      STORED_HRV_DATA,
      STORED_ECG_DATA,
      STORED_BODY_COMPOSITION_DATA,
      PTT_TEST_RESULT,
      PTT_STATE_CHANGED,
      ERROR
    )

    // MARK: Session
    AsyncFunction("init") { (promise: Promise) in self.handleInit(promise: promise) }
    AsyncFunction("isBluetoothEnabled") { (promise: Promise) in self.handleIsBluetoothEnabled(promise: promise) }
    AsyncFunction("requestPermissions") { (promise: Promise) in self.handleRequestPermissions(promise: promise) }
    AsyncFunction("startScan") { (options: [String: Any]?, promise: Promise) in self.handleStartScan(options: options, promise: promise) }
    AsyncFunction("stopScan") { (promise: Promise) in self.handleStopScan(promise: promise) }
    AsyncFunction("connect") { (deviceId: String, options: [String: Any]?, promise: Promise) in self.handleConnect(deviceId: deviceId, options: options, promise: promise) }
    AsyncFunction("disconnect") { (deviceId: String, promise: Promise) in self.handleDisconnect(deviceId: deviceId, promise: promise) }
    AsyncFunction("getConnectionStatus") { (deviceId: String, promise: Promise) in self.handleGetConnectionStatus(deviceId: deviceId, promise: promise) }
    AsyncFunction("verifyPassword") { (password: String, is24Hour: Bool, promise: Promise) in self.handleVerifyPassword(password: password, is24Hour: is24Hour, promise: promise) }

    // MARK: Device info
    AsyncFunction("readBattery") { (promise: Promise) in self.handleReadBattery(promise: promise) }
    AsyncFunction("syncPersonalInfo") { (info: [String: Any], promise: Promise) in self.handleSyncPersonalInfo(info: info, promise: promise) }
    AsyncFunction("readDeviceFunctions") { (promise: Promise) in self.handleReadDeviceFunctions(promise: promise) }
    AsyncFunction("readDeviceVersion") { (promise: Promise) in self.handleReadDeviceVersion(promise: promise) }
    AsyncFunction("readSocialMsgData") { (promise: Promise) in self.handleReadSocialMsgData(promise: promise) }
    AsyncFunction("writeSocialMsgData") { (data: [String: Any], promise: Promise) in self.handleWriteSocialMsgData(data: data, promise: promise) }
    AsyncFunction("setLanguage") { (language: String, promise: Promise) in self.handleSetLanguage(language: language, promise: promise) }

    // MARK: Historical reads
    AsyncFunction("startReadOriginData") { (promise: Promise) in self.handleStartReadOriginData(promise: promise) }
    AsyncFunction("readSleepData") { (date: String?, promise: Promise) in self.handleReadSleepData(date: date, promise: promise) }
    AsyncFunction("readSportStepData") { (date: String?, promise: Promise) in self.handleReadSportStepData(date: date, promise: promise) }
    AsyncFunction("readOriginData") { (dayOffset: Int, promise: Promise) in self.handleReadOriginData(dayOffset: dayOffset, promise: promise) }
    AsyncFunction("readDeviceAllData") { (promise: Promise) in self.handleReadDeviceAllData(promise: promise) }
    AsyncFunction("readOriginRawDump") { (dayOffset: Int, promise: Promise) in self.handleReadOriginRawDump(dayOffset: dayOffset, promise: promise) }
    AsyncFunction("readDaySummaryData") { (dayOffset: Int, promise: Promise) in self.handleReadDaySummaryData(dayOffset: dayOffset, promise: promise) }

    // MARK: Auto measure
    AsyncFunction("readAutoMeasureSetting") { (promise: Promise) in self.handleReadAutoMeasureSetting(promise: promise) }
    AsyncFunction("modifyAutoMeasureSetting") { (setting: [String: Any], promise: Promise) in self.handleModifyAutoMeasureSetting(setting: setting, promise: promise) }

    // MARK: Alarms
    AsyncFunction("readAlarms") { (promise: Promise) in self.handleReadAlarms(promise: promise) }
    AsyncFunction("setAlarm") { (alarm: [String: Any], promise: Promise) in self.handleSetAlarm(alarm, promise: promise) }
    AsyncFunction("deleteAlarm") { (alarmId: Int, promise: Promise) in self.handleDeleteAlarm(alarmId, promise: promise) }
    AsyncFunction("readHeartRateAlarm") { (promise: Promise) in self.handleReadHeartRateAlarm(promise: promise) }
    AsyncFunction("setHeartRateAlarm") { (alarm: [String: Any], promise: Promise) in self.handleSetHeartRateAlarm(alarm, promise: promise) }

    // MARK: Time + find device
    AsyncFunction("setDeviceTime") { (time: [String: Any]?, promise: Promise) in self.handleSetDeviceTime(time, promise: promise) }
    AsyncFunction("startFindDevice") { (promise: Promise) in self.handleStartFindDevice(promise: promise) }
    AsyncFunction("stopFindDevice") { (promise: Promise) in self.handleStopFindDevice(promise: promise) }

    // MARK: Display + reminders
    AsyncFunction("readScreenLightSettings") { (promise: Promise) in self.handleReadScreenLightSettings(promise: promise) }
    AsyncFunction("setScreenLightSettings") { (settings: [String: Any], promise: Promise) in self.handleSetScreenLightSettings(settings, promise: promise) }
    AsyncFunction("readScreenLightDuration") { (promise: Promise) in self.handleReadScreenLightDuration(promise: promise) }
    AsyncFunction("setScreenLightDuration") { (seconds: Double, promise: Promise) in self.handleSetScreenLightDuration(seconds, promise: promise) }
    AsyncFunction("readSedentaryReminder") { (promise: Promise) in self.handleReadSedentaryReminder(promise: promise) }
    AsyncFunction("setSedentaryReminder") { (settings: [String: Any], promise: Promise) in self.handleSetSedentaryReminder(settings, promise: promise) }
    AsyncFunction("readWristFlipWakeSettings") { (promise: Promise) in self.handleReadWristFlipWakeSettings(promise: promise) }
    AsyncFunction("setWristFlipWakeSettings") { (settings: [String: Any], promise: Promise) in self.handleSetWristFlipWakeSettings(settings, promise: promise) }
    AsyncFunction("readCustomSettings") { (promise: Promise) in self.handleReadCustomSettings(promise: promise) }
    AsyncFunction("writeCustomSettings") { (settings: [String: Any], promise: Promise) in self.handleWriteCustomSettings(settings, promise: promise) }
    AsyncFunction("readHealthReminder") { (type: String, promise: Promise) in self.handleReadHealthReminder(type: type, promise: promise) }
    AsyncFunction("setHealthReminder") { (reminder: [String: Any], promise: Promise) in self.handleSetHealthReminder(reminder, promise: promise) }
    AsyncFunction("readApneaRemindSettings") { (promise: Promise) in self.handleReadApneaRemindSettings(promise: promise) }
    AsyncFunction("setApneaRemindSettings") { (settings: [String: Any], promise: Promise) in self.handleSetApneaRemindSettings(settings, promise: promise) }

    // MARK: Stored vitals
    AsyncFunction("startReadExerciseData") { (promise: Promise) in self.handleStartReadExerciseData(promise: promise) }
    AsyncFunction("readAccurateSleepData") { (date: String?, promise: Promise) in self.handleReadAccurateSleepData(date: date, promise: promise) }
    AsyncFunction("readStoredTemperatureData") { (date: String?, promise: Promise) in self.handleReadStoredTemperatureData(date: date, promise: promise) }
    AsyncFunction("readStoredBloodGlucoseData") { (date: String?, promise: Promise) in self.handleReadStoredBloodGlucoseData(date: date, promise: promise) }
    AsyncFunction("readStoredHrvData") { (date: String?, promise: Promise) in self.handleReadStoredHrvData(date: date, promise: promise) }
    AsyncFunction("readStoredEcgData") { (date: String?, promise: Promise) in self.handleReadStoredEcgData(date: date, promise: promise) }
    AsyncFunction("readStoredBodyCompositionData") { (date: String?, promise: Promise) in self.handleReadStoredBodyCompositionData(date: date, promise: promise) }

    // MARK: Receive-only realtime tests
    AsyncFunction("startPttTest") { (promise: Promise) in self.handleStartPttTest(promise: promise) }
    AsyncFunction("stopPttTest") { (promise: Promise) in self.handleStopPttTest(promise: promise) }
    AsyncFunction("startGsrTest") { (promise: Promise) in
      promise.reject("CAPABILITY_UNSUPPORTED", "GSR test is not supported on iOS — Android only")
    }
    AsyncFunction("stopGsrTest") { (promise: Promise) in promise.resolve(nil) }
    AsyncFunction("startBloodAnalysisTest") { (promise: Promise) in self.handleStartBloodAnalysisTest(promise: promise) }
    AsyncFunction("stopBloodAnalysisTest") { (promise: Promise) in self.handleStopBloodAnalysisTest(promise: promise) }

    // MARK: Sport mode
    AsyncFunction("readSportMode") { (promise: Promise) in self.handleReadSportMode(promise: promise) }
    AsyncFunction("setSportMode") { (mode: String, promise: Promise) in self.handleSetSportMode(mode, promise: promise) }
    AsyncFunction("stopSportMode") { (promise: Promise) in self.handleStopSportMode(promise: promise) }

    // MARK: Women health
    AsyncFunction("readWomenHealthSettings") { (promise: Promise) in self.handleReadWomenHealthSettings(promise: promise) }
    AsyncFunction("setWomenHealthSettings") { (settings: [String: Any], promise: Promise) in self.handleSetWomenHealthSettings(settings, promise: promise) }

    // MARK: Weather
    AsyncFunction("readWeatherSettings") { (promise: Promise) in self.handleReadWeatherSettings(promise: promise) }
    AsyncFunction("setWeatherSettings") { (settings: [String: Any], promise: Promise) in self.handleSetWeatherSettings(settings, promise: promise) }
    AsyncFunction("pushWeatherData") { (data: [String: Any], promise: Promise) in self.handlePushWeatherData(data, promise: promise) }

    // MARK: Contacts + SOS
    AsyncFunction("readContacts") { (crc: Int?, promise: Promise) in self.handleReadContacts(crc: crc, promise: promise) }
    AsyncFunction("addContact") { (data: [String: Any], promise: Promise) in self.handleAddContact(data, promise: promise) }
    AsyncFunction("deleteContact") { (contactId: Int, promise: Promise) in self.handleDeleteContact(contactId: contactId, promise: promise) }
    AsyncFunction("setContactSosState") { (contactId: Int, isOpen: Bool, promise: Promise) in self.handleSetContactSosState(contactId: contactId, isOpen: isOpen, promise: promise) }
    AsyncFunction("readSosCallTimes") { (promise: Promise) in self.handleReadSosCallTimes(promise: promise) }
    AsyncFunction("setSosCallTimes") { (times: Int, promise: Promise) in self.handleSetSosCallTimes(times: times, promise: promise) }

    // MARK: Media (camera + music remote)
    AsyncFunction("enterCameraMode") { (promise: Promise) in self.handleEnterCameraMode(promise: promise) }
    AsyncFunction("exitCameraMode") { (promise: Promise) in self.handleExitCameraMode(promise: promise) }
    AsyncFunction("setMusicControlEnabled") { (enabled: Bool, promise: Promise) in self.handleSetMusicControlEnabled(enabled, promise: promise) }
    AsyncFunction("pushMusicData") { (data: [String: Any], promise: Promise) in self.handlePushMusicData(data, promise: promise) }

    // MARK: GPS / Band Bluetooth / Firmware DFU / Watch face
    AsyncFunction("setDeviceGPSAndTimezone") { (data: [String: Any], promise: Promise) in self.handleSetDeviceGPSAndTimezone(data, promise: promise) }
    AsyncFunction("readDeviceBTStatus") { (promise: Promise) in self.handleReadDeviceBTStatus(promise: promise) }
    AsyncFunction("setDeviceBTSwitch") { (open: Bool, promise: Promise) in self.handleSetDeviceBTSwitch(open, promise: promise) }
    AsyncFunction("startLocalFirmwareDfu") { (filePath: String, promise: Promise) in self.handleStartLocalFirmwareDfu(filePath: filePath, promise: promise) }
    AsyncFunction("readWatchFaceStyle") { (options: [String: Any]?, promise: Promise) in self.handleReadWatchFaceStyle(options, promise: promise) }
    AsyncFunction("setWatchFaceStyle") { (settings: [String: Any], promise: Promise) in self.handleSetWatchFaceStyle(settings, promise: promise) }

    // MARK: Realtime tests (start: full handler; stop: vendor SDK call + finishMeasurement)
    AsyncFunction("startHeartRateTest") { (promise: Promise) in self.handleStartHeartRateTest(promise: promise) }
    AsyncFunction("stopHeartRateTest") { (promise: Promise) in self.handleStopHeartRateTest(promise: promise) }
    AsyncFunction("startBloodPressureTest") { (promise: Promise) in self.handleStartBloodPressureTest(promise: promise) }
    AsyncFunction("stopBloodPressureTest") { (promise: Promise) in self.handleStopBloodPressureTest(promise: promise) }
    AsyncFunction("startBloodOxygenTest") { (promise: Promise) in self.handleStartBloodOxygenTest(promise: promise) }
    AsyncFunction("stopBloodOxygenTest") { (promise: Promise) in self.handleStopBloodOxygenTest(promise: promise) }
    AsyncFunction("startTemperatureTest") { (promise: Promise) in self.handleStartTemperatureTest(promise: promise) }
    AsyncFunction("stopTemperatureTest") { (promise: Promise) in self.handleStopTemperatureTest(promise: promise) }
    AsyncFunction("startStressTest") { (promise: Promise) in self.handleStartStressTest(promise: promise) }
    AsyncFunction("stopStressTest") { (promise: Promise) in self.handleStopStressTest(promise: promise) }
    AsyncFunction("startBloodGlucoseTest") { (promise: Promise) in self.handleStartBloodGlucoseTest(promise: promise) }
    AsyncFunction("stopBloodGlucoseTest") { (promise: Promise) in self.handleStopBloodGlucoseTest(promise: promise) }

    // MARK: Vitals (HRV / ECG / fatigue / breathing / body composition)
    AsyncFunction("startHrvTest") { (promise: Promise) in self.handleStartHrvTest(promise: promise) }
    AsyncFunction("stopHrvTest") { (promise: Promise) in self.handleStopHrvTest(promise: promise) }
    AsyncFunction("startEcgTest") { (options: [String: Any]?, promise: Promise) in self.handleStartEcgTest(options: options, promise: promise) }
    AsyncFunction("stopEcgTest") { (promise: Promise) in self.handleStopEcgTest(promise: promise) }
    AsyncFunction("startFatigueTest") { (promise: Promise) in self.handleStartFatigueTest(promise: promise) }
    AsyncFunction("stopFatigueTest") { (promise: Promise) in self.handleStopFatigueTest(promise: promise) }
    AsyncFunction("startBreathingTest") { (promise: Promise) in self.handleStartBreathingTest(promise: promise) }
    AsyncFunction("stopBreathingTest") { (promise: Promise) in self.handleStopBreathingTest(promise: promise) }
    AsyncFunction("startBodyCompositionTest") { (promise: Promise) in self.handleStartBodyCompositionTest(promise: promise) }
    AsyncFunction("stopBodyCompositionTest") { (promise: Promise) in self.handleStopBodyCompositionTest(promise: promise) }

    // MARK: Lifecycle
    OnStartObserving {
      self.emitBluetoothStatus()
    }

    OnDestroy {
      self.cleanup()
    }
  }
}
