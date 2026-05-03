import ExpoModulesCore
import CoreBluetooth
import VeepooBleSDK

// MARK: - 事件常量
enum VeepooEvent {
  static let deviceFound = "deviceFound"
  static let deviceConnected = "deviceConnected"
  static let deviceDisconnected = "deviceDisconnected"
  static let deviceConnectStatus = "deviceConnectStatus"
  static let connectionStatusChanged = "connectionStatusChanged"
  static let deviceReady = "deviceReady"
  static let bluetoothStateChanged = "bluetoothStateChanged"
  static let deviceFunction = "deviceFunction"
  static let deviceVersion = "deviceVersion"
  static let passwordData = "passwordData"
  static let batteryData = "batteryData"
  static let heartRateTestResult = "heartRateTestResult"
  static let bloodPressureTestResult = "bloodPressureTestResult"
  static let bloodOxygenTestResult = "bloodOxygenTestResult"
  static let temperatureTestResult = "temperatureTestResult"
  static let stressData = "stressData"
  static let bloodGlucoseData = "bloodGlucoseData"
  static let sleepData = "sleepData"
  static let sportStepData = "sportStepData"
  static let readOriginProgress = "readOriginProgress"
  static let readOriginComplete = "readOriginComplete"
  static let originFiveMinuteData = "originFiveMinuteData"
  static let originHalfHourData = "originHalfHourData"
  static let originSpo2Data = "originSpo2Data"
  static let socialMsgData = "socialMsgData"
  static let findDeviceState = "findDeviceState"
  static let firmwareDfuProgress = "firmwareDfuProgress"
  static let cameraShutter = "cameraShutter"
  static let musicRemoteCommand = "musicRemoteCommand"
  static let deviceBTStateChanged = "deviceBTStateChanged"
  static let deviceSosTriggered = "deviceSosTriggered"
  static let customSettingsData = "customSettingsData"
  static let healthRemindData = "healthRemindData"
  static let apneaRemindData = "apneaRemindData"
  static let sportModeData = "sportModeData"
  static let bloodAnalysisTestResult = "bloodAnalysisTestResult"
  static let gsrTestResult = "gsrTestResult"
  static let error = "error"
}

let DEVICE_FOUND = VeepooEvent.deviceFound
let DEVICE_CONNECTED = VeepooEvent.deviceConnected
let DEVICE_DISCONNECTED = VeepooEvent.deviceDisconnected
let DEVICE_CONNECT_STATUS = VeepooEvent.deviceConnectStatus
let CONNECTION_STATUS_CHANGED = VeepooEvent.connectionStatusChanged
let DEVICE_READY = VeepooEvent.deviceReady
let BLUETOOTH_STATE_CHANGED = VeepooEvent.bluetoothStateChanged
let DEVICE_FUNCTION = VeepooEvent.deviceFunction
let DEVICE_VERSION = VeepooEvent.deviceVersion
let PASSWORD_DATA = VeepooEvent.passwordData
let BATTERY_DATA = VeepooEvent.batteryData
let HEART_RATE_TEST_RESULT = VeepooEvent.heartRateTestResult
let BLOOD_PRESSURE_TEST_RESULT = VeepooEvent.bloodPressureTestResult
let BLOOD_OXYGEN_TEST_RESULT = VeepooEvent.bloodOxygenTestResult
let TEMPERATURE_TEST_RESULT = VeepooEvent.temperatureTestResult
let STRESS_DATA = VeepooEvent.stressData
let BLOOD_GLUCOSE_DATA = VeepooEvent.bloodGlucoseData
let SLEEP_DATA = VeepooEvent.sleepData
let SPORT_STEP_DATA = VeepooEvent.sportStepData
let READ_ORIGIN_PROGRESS = VeepooEvent.readOriginProgress
let READ_ORIGIN_COMPLETE = VeepooEvent.readOriginComplete
let ORIGIN_FIVE_MINUTE_DATA = VeepooEvent.originFiveMinuteData
let ORIGIN_HALF_HOUR_DATA = VeepooEvent.originHalfHourData
let ORIGIN_SPO2_DATA = VeepooEvent.originSpo2Data
let SOCIAL_MSG_DATA = VeepooEvent.socialMsgData
let FIND_DEVICE_STATE = VeepooEvent.findDeviceState
let FIRMWARE_DFU_PROGRESS = VeepooEvent.firmwareDfuProgress
let CAMERA_SHUTTER = VeepooEvent.cameraShutter
let MUSIC_REMOTE_COMMAND = VeepooEvent.musicRemoteCommand
let DEVICE_BT_STATE_CHANGED = VeepooEvent.deviceBTStateChanged
let DEVICE_SOS_TRIGGERED = VeepooEvent.deviceSosTriggered
let CUSTOM_SETTINGS_DATA = VeepooEvent.customSettingsData
let HEALTH_REMIND_DATA = VeepooEvent.healthRemindData
let APNEA_REMIND_DATA = VeepooEvent.apneaRemindData
let SPORT_MODE_DATA = VeepooEvent.sportModeData
let BLOOD_ANALYSIS_TEST_RESULT = VeepooEvent.bloodAnalysisTestResult
let GSR_TEST_RESULT = VeepooEvent.gsrTestResult
let ALARM_DATA = "alarmData"
let HRV_TEST_RESULT = "hrvTestResult"
let ECG_TEST_RESULT = "ecgTestResult"
let FATIGUE_TEST_RESULT = "fatigueTestResult"
let BREATHING_TEST_RESULT = "breathingTestResult"
let BODY_COMPOSITION_TEST_RESULT = "bodyCompositionTestResult"
let CONTACTS_DATA = "contactsData"
let SOS_CALL_TIMES_DATA = "sosCallTimesData"
let ERROR = VeepooEvent.error

// MARK: - 权限回调委托
final class PermissionDelegate: NSObject, CBCentralManagerDelegate {
  private weak var module: VeepooSDKModule?
  init(module: VeepooSDKModule) { self.module = module }
  func centralManagerDidUpdateState(_ central: CBCentralManager) {
    module?.handlePermissionStateUpdate(central)
  }
}

// MARK: - 连接状态枚举
enum ConnectionState {
  case idle, scanning, connecting, connected, discoveringServices
  case authenticating, ready, disconnecting, disconnected
  case error(String)
  
  var rawValue: String {
    switch self {
    case .idle: return "idle"
    case .scanning: return "scanning"
    case .connecting: return "connecting"
    case .connected: return "connected"
    case .discoveringServices: return "discoveringServices"
    case .authenticating: return "authenticating"
    case .ready: return "ready"
    case .disconnecting: return "disconnecting"
    case .disconnected: return "disconnected"
    case .error: return "error"
    }
  }
}

// MARK: - 主模块
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

  public   func handlePermissionStateUpdate(_ central: CBCentralManager) {
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
      HRV_TEST_RESULT, ECG_TEST_RESULT, FATIGUE_TEST_RESULT,       BREATHING_TEST_RESULT,
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
      ERROR
    )

    // MARK: Initialization
    AsyncFunction("init") { (promise: Promise) in
      DispatchQueue.main.async {
        #if targetEnvironment(simulator)
        self.isInitialized = true
        promise.resolve(nil)
        #else
        guard let manager = VPBleCentralManage.sharedBleManager() else {
          promise.reject("SDK_NOT_AVAILABLE", "Failed to initialize Veepoo SDK")
          return
        }
        self.bleManager = manager
        self.peripheralManage = VPPeripheralManage.shareVPPeripheralManager()
        manager.peripheralManage = self.peripheralManage
        manager.isLogEnable = true
        manager.manufacturerIDFilter = false
        self.setupVeepooCallbacks()
        self.isInitialized = true
        self.ensureCentralManager()
        promise.resolve(nil)
        #endif
      }
    }

    // MARK: Permissions
    AsyncFunction("isBluetoothEnabled") { (promise: Promise) in
      #if targetEnvironment(simulator)
      promise.resolve(true)
      #else
      self.ensureCentralManager()
      guard let central = self.centralManager else {
        promise.reject("SDK_NOT_INITIALIZED", "Central manager not initialized")
        return
      }
      promise.resolve(central.state == .poweredOn)
      #endif
    }

    AsyncFunction("requestPermissions") { (promise: Promise) in
      #if targetEnvironment(simulator)
      promise.resolve(self.makePermissionsResult(status: "granted", granted: true, canAskAgain: false))
      #else
      let authorization = CBManager.authorization
      switch authorization {
      case .allowedAlways:
        self.ensureCentralManager()
        let granted = self.centralManager?.state != .poweredOff
        promise.resolve(self.makePermissionsResult(
          status: granted ? "granted" : "powered_off",
          granted: granted,
          canAskAgain: false
        ))
      case .restricted:
        promise.resolve(self.makePermissionsResult(status: "restricted", granted: false, canAskAgain: false))
      case .notDetermined:
        if self.permissionDelegate == nil {
          self.permissionDelegate = PermissionDelegate(module: self)
        }
        self.permissionPromise = promise
        self.permissionCentralManager = CBCentralManager(delegate: self.permissionDelegate, queue: nil, options: [:])
        self.centralManager = self.permissionCentralManager
      case .denied:
        promise.resolve(self.makePermissionsResult(status: "denied", granted: false, canAskAgain: false))
      @unknown default:
        promise.resolve(self.makePermissionsResult(status: "unknown", granted: false, canAskAgain: true))
      }
      #endif
    }

    // MARK: Connection
    AsyncFunction("startScan") { (options: [String: Any]?, promise: Promise) in
      #if targetEnvironment(simulator)
      promise.resolve(nil)
      #else
      guard self.isInitialized else {
        promise.reject("SDK_NOT_INITIALIZED", "SDK not initialized")
        return
      }
      self.pendingScanStart = true
      guard let manager = self.bleManager else {
        promise.reject("SDK_NOT_INITIALIZED", "BLE manager is nil")
        return
      }
      if self.isScanning {
        promise.resolve(nil)
        return
      }
      self.isScanning = true
      self.emitBluetoothStatus()
      manager.veepooSDKStartScanDeviceAndReceiveScanningDevice { [weak self] peripheralModel in
        guard let self = self, let model = peripheralModel else { return }
        self.handleDiscoveredDevice(model)
      }
      let timeout = options?["timeout"] as? Int ?? 10000
      DispatchQueue.main.asyncAfter(deadline: .now() + Double(timeout) / 1000) { [weak self] in
        guard let self = self, self.isScanning else { return }
        self.bleManager?.veepooSDKStopScanDevice()
        self.isScanning = false
        self.pendingScanStart = false
        self.emitBluetoothStatus()
      }
      promise.resolve(nil)
      #endif
    }

    AsyncFunction("stopScan") { (promise: Promise) in
      #if targetEnvironment(simulator)
      promise.resolve(nil)
      #else
      self.pendingScanStart = false
      self.isScanning = false
      self.bleManager?.veepooSDKStopScanDevice()
      self.emitBluetoothStatus()
      promise.resolve(nil)
      #endif
    }

    AsyncFunction("connect") { (deviceId: String, options: [String: Any]?, promise: Promise) in
      #if targetEnvironment(simulator)
      self.connectedDeviceId = deviceId
      self.sendEvent(DEVICE_CONNECTED, ["deviceId": deviceId, "isOadModel": false])
      self.sendEvent(DEVICE_READY, ["deviceId": deviceId, "isOadModel": false])
      promise.resolve(nil)
      #else
      print("[VeepooSDK] connect - 请求连接, deviceId: \(deviceId), options: \(String(describing: options)), currentState: \(self.connectionState.rawValue), connectedDeviceId: \(self.connectedDeviceId ?? "nil"), activeConnectDeviceId: \(self.activeConnectDeviceId ?? "nil"), discoveredCount: \(self.discoveredDevices.count)")
      guard self.isInitialized else {
        promise.reject("SDK_NOT_INITIALIZED", "SDK not initialized")
        return
      }
      guard let _ = self.bleManager else {
        promise.reject("SDK_NOT_INITIALIZED", "BLE manager is nil")
        return
      }
      let password = options?["password"] as? String ?? "0000"
      let is24Hour = options?["is24Hour"] as? Bool ?? false
      let uuidString = options?["uuid"] as? String
      self.emitConnectionStatus(deviceId: deviceId, status: "connecting")

      // 优先使用当前扫描/缓存到的设备模型。
      // 对于扫描页点击连接，直接使用扫描结果里的 peripheralModel 更稳定；
      // 只有在本地没有缓存模型时，才回退到 UUID 恢复外围设备。
      var peripheralModel: VPPeripheralModel? = nil
      var modelSource = "none"
      peripheralModel = self.discoveredDevices[deviceId]
      if peripheralModel != nil {
        modelSource = "cache:deviceId"
      }
      if peripheralModel == nil, let uuidStr = uuidString {
        peripheralModel = self.discoveredDevices[uuidStr]
        if peripheralModel != nil {
          modelSource = "cache:uuid"
        }
      }
      if peripheralModel == nil, let uuidStr = uuidString, let uuid = UUID(uuidString: uuidStr), let central = self.centralManager {
        let peripherals = central.retrievePeripherals(withIdentifiers: [uuid])
        print("[VeepooSDK] connect - retrievePeripherals, uuid: \(uuidStr), count: \(peripherals.count)")
        if let peripheral = peripherals.first {
          peripheralModel = VPPeripheralModel(peripher: peripheral)
          if let recoveredModel = peripheralModel {
            self.discoveredDevices[uuidStr] = recoveredModel
            self.discoveredDevices[deviceId] = recoveredModel
            modelSource = "retrieved:uuid"
          }
        }
      }

      print("[VeepooSDK] connect - 模型解析结果, deviceId: \(deviceId), modelSource: \(modelSource), uuid: \(uuidString ?? "nil"), foundModel: \(peripheralModel != nil)")

      let shouldUseScanFallbackDirectly = modelSource == "retrieved:uuid" || modelSource == "none"

      if shouldUseScanFallbackDirectly {
        print("[VeepooSDK] connect - 当前仅有 UUID 恢复模型或无模型，直接进入隐藏扫描兜底, deviceId: \(deviceId), modelSource: \(modelSource)")
        self.startScanConnectFallback(
          deviceId: deviceId,
          password: password,
          is24Hour: is24Hour,
          promise: promise
        )
      } else if let model = peripheralModel {
        self.performConnect(
          model: model,
          deviceId: deviceId,
          password: password,
          is24Hour: is24Hour,
          promise: promise,
          fallbackToScan: { [weak self] in
            guard let self = self else { return }
            print("[VeepooSDK] connect - performConnect 失败，进入扫描兜底, deviceId: \(deviceId)")
            self.startScanConnectFallback(
              deviceId: deviceId,
              password: password,
              is24Hour: is24Hour,
              promise: promise
            )
          }
        )
      } else {
        print("[VeepooSDK] connect - 无可用模型，直接进入扫描兜底, deviceId: \(deviceId), uuid: \(uuidString ?? "nil")")
        self.startScanConnectFallback(
          deviceId: deviceId,
          password: password,
          is24Hour: is24Hour,
          promise: promise
        )
      }
      #endif
    }

    AsyncFunction("disconnect") { (deviceId: String, promise: Promise) in
      #if targetEnvironment(simulator)
      self.connectedDeviceId = nil
      self.sendEvent(DEVICE_DISCONNECTED, ["deviceId": deviceId])
      self.sendEvent(DEVICE_CONNECT_STATUS, ["deviceId": deviceId, "status": "disconnected"])
      promise.resolve(nil)
      #else
      self.connectionState = .disconnecting
      self.bleManager?.veepooSDKDisconnectDevice()
      self.connectedDeviceId = nil
      self.activeConnectDeviceId = nil
      self.activeMeasurementType = nil
      self.sendEvent(DEVICE_DISCONNECTED, ["deviceId": deviceId])
      self.emitConnectionStatus(deviceId: deviceId, status: "disconnected")
      self.connectionState = .disconnected
      promise.resolve(nil)
      #endif
    }

    AsyncFunction("getConnectionStatus") { (deviceId: String, promise: Promise) in
      let matchesCurrentDevice =
        self.connectedDeviceId == deviceId ||
        self.activeConnectDeviceId == deviceId

      let status = matchesCurrentDevice
        ? self.publicConnectionStatus(for: self.connectionState)
        : "disconnected"
      promise.resolve(status)
    }

    AsyncFunction("verifyPassword") { (password: String, is24Hour: Bool, promise: Promise) in
      #if targetEnvironment(simulator)
      self.sendEvent(PASSWORD_DATA, [
        "deviceId": self.connectedDeviceId ?? "",
        "data": ["status": "SUCCESS", "password": password, "deviceNumber": "", "deviceVersion": ""]
      ])
      self.connectionState = .ready
      self.activeConnectDeviceId = nil
      self.sendEvent(DEVICE_READY, ["deviceId": self.connectedDeviceId ?? "", "isOadModel": false])
      promise.resolve(["status": "SUCCESS", "password": password, "deviceNumber": "", "deviceVersion": ""])
      #else
      guard let manager = self.bleManager else {
        promise.reject("SDK_NOT_INITIALIZED", "BLE manager is nil")
        return
      }
      manager.is24HourFormat = is24Hour
      guard let passwordType = SynchronousPasswordType(rawValue: 0) else {
        promise.reject("PASSWORD_TYPE_ERROR", "Invalid password type")
        return
      }
      manager.veepooSDKSynchronousPassword(with: passwordType, password: password) { [weak self] result in
        guard let self = self else { return }
        let success = (result.rawValue == 1) || (result.rawValue == 6)
        let status = self.normalizePasswordStatus(success ? "SUCCESS" : "FAILED")
        let resultData: [String: Any] = [
          "status": status,
          "rawStatus": result.rawValue,
          "password": password,
          "pwd": password,
          "deviceNumber": String(manager.peripheralModel?.deviceNumber ?? 0),
          "deviceVersion": manager.peripheralModel?.deviceVersion ?? "",
          "deviceTestVersion": manager.peripheralModel?.deviceTestVersion ?? ""
        ]
        self.sendEvent(PASSWORD_DATA, ["deviceId": self.connectedDeviceId ?? "", "data": resultData])
        if success {
          self.cacheDeviceFunctions()
          self.connectionState = .ready
          self.activeConnectDeviceId = nil
          self.sendEvent(DEVICE_READY, ["deviceId": self.connectedDeviceId ?? "", "isOadModel": false])
        }
        promise.resolve(resultData)
      }
      #endif
    }

    // MARK: Read Data
    AsyncFunction("readBattery") { (promise: Promise) in
      #if targetEnvironment(simulator)
      promise.resolve(["level": 88, "percent": 88, "powerModel": 0, "state": 1, "bat": 0, "isPercent": true, "isLowBattery": false])
      #else
      guard let peripheralManage = self.peripheralManage else {
        promise.reject("SDK_NOT_INITIALIZED", "Peripheral manager is nil")
        return
      }
      var hasResolved = false
      peripheralManage.veepooSDKReadDeviceBatteryAndChargeInfo { isPercent, chargeState, percenTypeIsLowBat, battery in
        if hasResolved { return }
        hasResolved = true
        let payload: [String: Any] = [
          "level": battery,
          "percent": isPercent ? battery : 0,
          "powerModel": 0,
          "state": chargeState.rawValue,
          "bat": 0,
          "isPercent": isPercent,
          "isLowBattery": percenTypeIsLowBat
        ]
        self.sendEvent(BATTERY_DATA, ["deviceId": self.connectedDeviceId ?? "", "data": payload])
        promise.resolve(payload)
      }
      #endif
    }

    AsyncFunction("syncPersonalInfo") { (info: [String: Any], promise: Promise) in
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
      peripheralManage.veepooSDKSynchronousPersonalInformation(pInfo) { result in
        promise.resolve(result == 1)
      }
      #endif
    }

    AsyncFunction("readDeviceFunctions") { (promise: Promise) in
      #if targetEnvironment(simulator)
      promise.resolve(["package1": ["type": "DeviceFunctionPackage1", "bloodPressure": "unsupported", "heartRateDetect": "support"]])
      #else
      if self.cachedDeviceFunctions.isEmpty { self.cacheDeviceFunctions() }
      promise.resolve(self.cachedDeviceFunctions)
      #endif
    }

    AsyncFunction("readSocialMsgData") { (promise: Promise) in
      #if targetEnvironment(simulator)
      promise.resolve([
        "phone": "support", "sms": "support", "wechat": "support", "qq": "support",
        "facebook": "support", "twitter": "support", "instagram": "support",
        "linkedin": "unsupported", "whatsapp": "unsupported", "line": "unsupported",
        "skype": "unsupported", "email": "support", "other": "support"
      ])
      #else
      guard let manager = self.bleManager, let model = manager.peripheralModel else {
        promise.reject("DEVICE_NOT_CONNECTED", "No device connected")
        return
      }
      let ancsData = model.deviceAncsData ?? Data()
      let result = self.parseSocialMsgData(ancsData)
      self.sendEvent(SOCIAL_MSG_DATA, ["deviceId": self.connectedDeviceId ?? "", "data": result])
      promise.resolve(result)
      #endif
    }

    AsyncFunction("writeSocialMsgData") { (data: [String: Any], promise: Promise) in
      #if targetEnvironment(simulator)
      promise.resolve("success")
      #else
      guard let peripheralManage = self.peripheralManage else {
        promise.reject("DEVICE_NOT_CONNECTED", "No device connected")
        return
      }

      // JS channel key → VPSettingMessageSwitchType raw value
      let channelToTypeRaw: [String: Int] = [
        "phone": 2,   // VPSettingCall
        "sms": 3,     // VPSettingSMS
        "wechat": 4,  // VPSettingWechat
        "qq": 5,      // VPSettingQQ
        "facebook": 7,  // VPSettingFaceBook
        "twitter": 8,   // VPSettingTwitter
        "linkedin": 10, // VPSettingLinkedln
        "whatsapp": 11, // VPSettingwhatsapp
        "line": 12,     // VPSettingLine
        "instagram": 13, // VPSettingInstagram
        "skype": 15,    // VPSettingSkype
        "email": 16,    // VPSettingGMail
        "other": 19,    // VPSettingOtherPlatform
      ]

      var models: [VPDeviceMessageTypeModel] = []
      for (channel, value) in data {
        guard let rawType = channelToTypeRaw[channel],
              let messageType = VPSettingMessageSwitchType(rawValue: rawType),
              let status = value as? String else { continue }
        let model = VPDeviceMessageTypeModel()
        model.messageType = messageType
        model.open = status == "open"
        models.append(model)
      }

      guard !models.isEmpty else {
        promise.resolve("fail")
        return
      }

      peripheralManage.veepooSDKBatchSettingWithMessageTypeModels(models) { completeState in
        // 1=open, 2=close, 4=complete → success; 0=unknown, 3=failure → fail
        let success = completeState.rawValue == 1 || completeState.rawValue == 2 || completeState.rawValue == 4
        promise.resolve(success ? "success" : "fail")
      }
      #endif
    }

    AsyncFunction("readDeviceVersion") { (promise: Promise) in
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

    AsyncFunction("startReadOriginData") { (promise: Promise) in
      #if targetEnvironment(simulator)
      promise.resolve(nil)
      #else
      self.handleStartReadOriginData(promise: promise)
      #endif
    }

    AsyncFunction("readSleepData") { (date: String?, promise: Promise) in
      #if targetEnvironment(simulator)
      let result: [String: Any] = [
        "date": date ?? self.getDateString(dayOffset: 0),
        "items": [[
          "date": "2024-01-01", "sleepTime": "22:30:00", "wakeTime": "07:00:00",
          "deepSleepMinutes": 90, "lightSleepMinutes": 330, "totalSleepMinutes": 480,
          "sleepQuality": 85, "sleepLine": "", "wakeUpCount": 2
        ]],
        "summary": [
          "totalDeepSleepMinutes": 90, "totalLightSleepMinutes": 330,
          "totalSleepMinutes": 480, "averageSleepQuality": 85, "totalWakeUpCount": 2
        ]
      ]
      promise.resolve([result])
      #else
      self.handleReadSleepData(date: date, promise: promise)
      #endif
    }

    AsyncFunction("readSportStepData") { (date: String?, promise: Promise) in
      #if targetEnvironment(simulator)
      promise.resolve(["date": "2024-01-01", "stepCount": 5000, "distance": 3500, "calories": 200.0])
      #else
      self.handleReadSportStepData(date: date, promise: promise)
      #endif
    }

    AsyncFunction("readOriginData") { (dayOffset: Int, promise: Promise) in
      #if targetEnvironment(simulator)
      promise.resolve([])
      #else
      self.handleReadOriginData(dayOffset: dayOffset, promise: promise)
      #endif
    }

    AsyncFunction("readDeviceAllData") { (promise: Promise) in
      #if targetEnvironment(simulator)
      self.sendEvent(READ_ORIGIN_PROGRESS, [
        "deviceId": self.connectedDeviceId ?? "",
        "progress": ["readState": "start", "totalDays": 1, "currentDay": 1, "progress": 0]
      ])
      DispatchQueue.main.asyncAfter(deadline: .now() + 2.0) {
        self.sendEvent(READ_ORIGIN_PROGRESS, [
          "deviceId": self.connectedDeviceId ?? "",
          "progress": ["readState": "complete", "totalDays": 1, "currentDay": 1, "progress": 100]
        ])
        self.sendEvent(READ_ORIGIN_COMPLETE, ["deviceId": self.connectedDeviceId ?? "", "success": true])
        promise.resolve(true)
      }
      #else
      self.handleReadDeviceAllData(promise: promise)
      #endif
    }

    AsyncFunction("readDaySummaryData") { (dayOffset: Int, promise: Promise) in
      #if targetEnvironment(simulator)
      let calendar = Calendar.current
      let date = calendar.date(byAdding: .day, value: -dayOffset, to: Date()) ?? Date()
      let formatter = DateFormatter()
      formatter.dateFormat = "yyyy-MM-dd"
      let dateStr = formatter.string(from: date)
      promise.resolve([
        "date": dateStr, "allStep": 8500,
        "sportList": [["time": "08:00", "step": 500, "cal": 25.0, "dis": 350.0]],
        "rateList": [["time": "08:00", "rate": 72]],
        "bpList": [["time": "08:00", "high": 120, "low": 80]]
      ])
      #else
      self.handleReadDaySummaryData(dayOffset: dayOffset, promise: promise)
      #endif
    }

    // MARK: Write Data
    AsyncFunction("readAutoMeasureSetting") { (promise: Promise) in
      #if targetEnvironment(simulator)
      promise.resolve([])
      #else
      self.handleReadAutoMeasureSetting(promise: promise)
      #endif
    }

    AsyncFunction("modifyAutoMeasureSetting") { (setting: [String: Any], promise: Promise) in
      #if targetEnvironment(simulator)
      promise.resolve([])
      #else
      self.handleModifyAutoMeasureSetting(setting: setting, promise: promise)
      #endif
    }

    AsyncFunction("setLanguage") { (language: String, promise: Promise) in
      #if targetEnvironment(simulator)
      promise.resolve(true)
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
      peripheralManage.veepooSDKSettingLanguage(languageType) { success in
        promise.resolve(success)
      }
      #endif
    }

    // MARK: Alarms
    AsyncFunction("readAlarms") { (promise: Promise) in
      self.handleReadAlarms(promise: promise)
    }

    AsyncFunction("setAlarm") { (alarm: [String: Any], promise: Promise) in
      self.handleSetAlarm(alarm, promise: promise)
    }

    AsyncFunction("deleteAlarm") { (alarmId: Int, promise: Promise) in
      self.handleDeleteAlarm(alarmId, promise: promise)
    }

    AsyncFunction("readHeartRateAlarm") { (promise: Promise) in
      self.handleReadHeartRateAlarm(promise: promise)
    }

    AsyncFunction("setHeartRateAlarm") { (alarm: [String: Any], promise: Promise) in
      self.handleSetHeartRateAlarm(alarm, promise: promise)
    }

    // MARK: Time
    AsyncFunction("setDeviceTime") { (time: [String: Any]?, promise: Promise) in
      self.handleSetDeviceTime(time, promise: promise)
    }

    AsyncFunction("startFindDevice") { (promise: Promise) in
      self.handleStartFindDevice(promise: promise)
    }

    AsyncFunction("stopFindDevice") { (promise: Promise) in
      self.handleStopFindDevice(promise: promise)
    }

    AsyncFunction("readScreenLightSettings") { (promise: Promise) in
      self.handleReadScreenLightSettings(promise: promise)
    }

    AsyncFunction("setScreenLightSettings") { (settings: [String: Any], promise: Promise) in
      self.handleSetScreenLightSettings(settings, promise: promise)
    }

    AsyncFunction("readScreenLightDuration") { (promise: Promise) in
      self.handleReadScreenLightDuration(promise: promise)
    }

    AsyncFunction("setScreenLightDuration") { (seconds: Double, promise: Promise) in
      self.handleSetScreenLightDuration(seconds, promise: promise)
    }

    AsyncFunction("readSedentaryReminder") { (promise: Promise) in
      self.handleReadSedentaryReminder(promise: promise)
    }

    AsyncFunction("setSedentaryReminder") { (settings: [String: Any], promise: Promise) in
      self.handleSetSedentaryReminder(settings, promise: promise)
    }

    AsyncFunction("readWristFlipWakeSettings") { (promise: Promise) in
      self.handleReadWristFlipWakeSettings(promise: promise)
    }

    AsyncFunction("setWristFlipWakeSettings") { (settings: [String: Any], promise: Promise) in
      self.handleSetWristFlipWakeSettings(settings, promise: promise)
    }

    AsyncFunction("readCustomSettings") { (promise: Promise) in
      self.handleReadCustomSettings(promise: promise)
    }

    AsyncFunction("writeCustomSettings") { (settings: [String: Any], promise: Promise) in
      self.handleWriteCustomSettings(settings, promise: promise)
    }

    AsyncFunction("readHealthReminder") { (type: String, promise: Promise) in
      self.handleReadHealthReminder(type: type, promise: promise)
    }

    AsyncFunction("setHealthReminder") { (reminder: [String: Any], promise: Promise) in
      self.handleSetHealthReminder(reminder, promise: promise)
    }

    AsyncFunction("readApneaRemindSettings") { (promise: Promise) in
      self.handleReadApneaRemindSettings(promise: promise)
    }

    AsyncFunction("setApneaRemindSettings") { (settings: [String: Any], promise: Promise) in
      self.handleSetApneaRemindSettings(settings, promise: promise)
    }

    AsyncFunction("startGsrTest") { (promise: Promise) in
      promise.reject("CAPABILITY_UNSUPPORTED", "GSR test is not supported on iOS — Android only")
    }

    AsyncFunction("stopGsrTest") { (promise: Promise) in
      promise.resolve(nil)
    }

    AsyncFunction("startBloodAnalysisTest") { (promise: Promise) in
      self.handleStartBloodAnalysisTest(promise: promise)
    }

    AsyncFunction("stopBloodAnalysisTest") { (promise: Promise) in
      self.handleStopBloodAnalysisTest(promise: promise)
    }

    AsyncFunction("readSportMode") { (promise: Promise) in
      self.handleReadSportMode(promise: promise)
    }

    AsyncFunction("setSportMode") { (mode: String, promise: Promise) in
      self.handleSetSportMode(mode, promise: promise)
    }

    AsyncFunction("stopSportMode") { (promise: Promise) in
      self.handleStopSportMode(promise: promise)
    }

    AsyncFunction("readWomenHealthSettings") { (promise: Promise) in
      self.handleReadWomenHealthSettings(promise: promise)
    }

    AsyncFunction("setWomenHealthSettings") { (settings: [String: Any], promise: Promise) in
      self.handleSetWomenHealthSettings(settings, promise: promise)
    }

    AsyncFunction("readWeatherSettings") { (promise: Promise) in
      self.handleReadWeatherSettings(promise: promise)
    }

    AsyncFunction("setWeatherSettings") { (settings: [String: Any], promise: Promise) in
      self.handleSetWeatherSettings(settings, promise: promise)
    }

    AsyncFunction("pushWeatherData") { (data: [String: Any], promise: Promise) in
      self.handlePushWeatherData(data, promise: promise)
    }

    AsyncFunction("readContacts") { (crc: Int?, promise: Promise) in
      self.handleReadContacts(crc: crc, promise: promise)
    }

    AsyncFunction("addContact") { (data: [String: Any], promise: Promise) in
      self.handleAddContact(data, promise: promise)
    }

    AsyncFunction("deleteContact") { (contactId: Int, promise: Promise) in
      self.handleDeleteContact(contactId: contactId, promise: promise)
    }

    AsyncFunction("setContactSosState") { (contactId: Int, isOpen: Bool, promise: Promise) in
      self.handleSetContactSosState(contactId: contactId, isOpen: isOpen, promise: promise)
    }

    AsyncFunction("readSosCallTimes") { (promise: Promise) in
      self.handleReadSosCallTimes(promise: promise)
    }

    AsyncFunction("setSosCallTimes") { (times: Int, promise: Promise) in
      self.handleSetSosCallTimes(times: times, promise: promise)
    }

    // MARK: Media (camera + music remote)
    AsyncFunction("enterCameraMode") { (promise: Promise) in
      self.handleEnterCameraMode(promise: promise)
    }

    AsyncFunction("exitCameraMode") { (promise: Promise) in
      self.handleExitCameraMode(promise: promise)
    }

    AsyncFunction("setMusicControlEnabled") { (enabled: Bool, promise: Promise) in
      self.handleSetMusicControlEnabled(enabled, promise: promise)
    }

    AsyncFunction("pushMusicData") { (data: [String: Any], promise: Promise) in
      self.handlePushMusicData(data, promise: promise)
    }

    // MARK: GPS / Location
    AsyncFunction("setDeviceGPSAndTimezone") { (data: [String: Any], promise: Promise) in
      self.handleSetDeviceGPSAndTimezone(data, promise: promise)
    }

    // MARK: Band Bluetooth
    AsyncFunction("readDeviceBTStatus") { (promise: Promise) in
      self.handleReadDeviceBTStatus(promise: promise)
    }

    AsyncFunction("setDeviceBTSwitch") { (open: Bool, promise: Promise) in
      self.handleSetDeviceBTSwitch(open, promise: promise)
    }

    AsyncFunction("startLocalFirmwareDfu") { (filePath: String, promise: Promise) in
      self.handleStartLocalFirmwareDfu(filePath: filePath, promise: promise)
    }

    AsyncFunction("readWatchFaceStyle") { (options: [String: Any]?, promise: Promise) in
      self.handleReadWatchFaceStyle(options, promise: promise)
    }

    AsyncFunction("setWatchFaceStyle") { (settings: [String: Any], promise: Promise) in
      self.handleSetWatchFaceStyle(settings, promise: promise)
    }

    // MARK: Tests
    AsyncFunction("startHeartRateTest") { (promise: Promise) in
      #if targetEnvironment(simulator)
      promise.resolve(nil)
      #else
      self.handleStartHeartRateTest(promise: promise)
      #endif
    }

    AsyncFunction("stopHeartRateTest") { (promise: Promise) in
      #if targetEnvironment(simulator)
      promise.resolve(nil)
      #else
      print("[HeartRate] Stopping test manually")
      self.peripheralManage?.veepooSDKTestHeartStart(false) { [weak self] _, heartValue in
        print("[HeartRate] Stop callback - final heartValue: \(heartValue)")
        self?.finishMeasurement(type: "heartRate", reason: "manual_stop")
        // 发送停止事件，使用实际的心率值（如果有效）
        let finalValue = heartValue > 0 ? Int(heartValue) : 0
        self?.sendEvent("heartRateTestResult", [
          "deviceId": self?.connectedDeviceId ?? "",
          "result": [
            "state": "over",
            "value": finalValue,
            "progress": 100
          ]
        ])
      }
      promise.resolve(nil)
      #endif
    }

    AsyncFunction("startBloodPressureTest") { (promise: Promise) in
      #if targetEnvironment(simulator)
      promise.resolve(nil)
      #else
      self.handleStartBloodPressureTest(promise: promise)
      #endif
    }

    AsyncFunction("stopBloodPressureTest") { (promise: Promise) in
      #if targetEnvironment(simulator)
      promise.resolve(nil)
      #else
      self.peripheralManage?.veepooSDKTestBloodStart(false, testMode: 0) { _, _, _, _ in }
      self.finishMeasurement(type: "bloodPressure", reason: "manual_stop")
      promise.resolve(nil)
      #endif
    }

    AsyncFunction("startBloodOxygenTest") { (promise: Promise) in
      #if targetEnvironment(simulator)
      promise.resolve(nil)
      #else
      self.handleStartBloodOxygenTest(promise: promise)
      #endif
    }

    AsyncFunction("stopBloodOxygenTest") { (promise: Promise) in
      #if targetEnvironment(simulator)
      promise.resolve(nil)
      #else
      self.peripheralManage?.veepooSDKTestOxygenStart(false) { _, _ in }
      self.finishMeasurement(type: "bloodOxygen", reason: "manual_stop")
      promise.resolve(nil)
      #endif
    }

    AsyncFunction("startTemperatureTest") { (promise: Promise) in
      #if targetEnvironment(simulator)
      promise.resolve(nil)
      #else
      self.handleStartTemperatureTest(promise: promise)
      #endif
    }

    AsyncFunction("stopTemperatureTest") { (promise: Promise) in
      #if targetEnvironment(simulator)
      promise.resolve(nil)
      #else
      self.peripheralManage?.veepooSDK_temperatureTestStart(false) { _, _, _, _, _ in }
      self.finishMeasurement(type: "temperature", reason: "manual_stop")
      promise.resolve(nil)
      #endif
    }

    AsyncFunction("startStressTest") { (promise: Promise) in
      #if targetEnvironment(simulator)
      promise.resolve(nil)
      #else
      self.handleStartStressTest(promise: promise)
      #endif
    }

    AsyncFunction("stopStressTest") { (promise: Promise) in
      #if targetEnvironment(simulator)
      promise.resolve(nil)
      #else
      self.peripheralManage?.veepooSDK_stressTestStart(false) { _, _, _ in }
      self.finishMeasurement(type: "stress", reason: "manual_stop")
      promise.resolve(nil)
      #endif
    }

    AsyncFunction("startBloodGlucoseTest") { (promise: Promise) in
      #if targetEnvironment(simulator)
      promise.resolve(nil)
      #else
      self.handleStartBloodGlucoseTest(promise: promise)
      #endif
    }

    AsyncFunction("stopBloodGlucoseTest") { (promise: Promise) in
      #if targetEnvironment(simulator)
      promise.resolve(nil)
      #else
      self.peripheralManage?.veepooSDKTestBloodGlucoseStart(false, isPersonalModel: false) { _, _, _, _ in }
      self.finishMeasurement(type: "bloodGlucose", reason: "manual_stop")
      promise.resolve(nil)
      #endif
    }

    // MARK: Vitals (HRV / ECG / fatigue / breathing)
    AsyncFunction("startHrvTest") { (promise: Promise) in
      #if targetEnvironment(simulator)
      promise.resolve(nil)
      #else
      self.handleStartHrvTest(promise: promise)
      #endif
    }
    AsyncFunction("stopHrvTest") { (promise: Promise) in
      #if targetEnvironment(simulator)
      promise.resolve(nil)
      #else
      self.handleStopHrvTest(promise: promise)
      #endif
    }
    AsyncFunction("startEcgTest") { (options: [String: Any]?, promise: Promise) in
      #if targetEnvironment(simulator)
      promise.resolve(nil)
      #else
      self.handleStartEcgTest(options: options, promise: promise)
      #endif
    }
    AsyncFunction("stopEcgTest") { (promise: Promise) in
      #if targetEnvironment(simulator)
      promise.resolve(nil)
      #else
      self.handleStopEcgTest(promise: promise)
      #endif
    }
    AsyncFunction("startFatigueTest") { (promise: Promise) in
      #if targetEnvironment(simulator)
      promise.resolve(nil)
      #else
      self.handleStartFatigueTest(promise: promise)
      #endif
    }
    AsyncFunction("stopFatigueTest") { (promise: Promise) in
      #if targetEnvironment(simulator)
      promise.resolve(nil)
      #else
      self.handleStopFatigueTest(promise: promise)
      #endif
    }
    AsyncFunction("startBreathingTest") { (promise: Promise) in
      #if targetEnvironment(simulator)
      promise.resolve(nil)
      #else
      self.handleStartBreathingTest(promise: promise)
      #endif
    }
    AsyncFunction("stopBreathingTest") { (promise: Promise) in
      #if targetEnvironment(simulator)
      promise.resolve(nil)
      #else
      self.handleStopBreathingTest(promise: promise)
      #endif
    }

    AsyncFunction("startBodyCompositionTest") { (promise: Promise) in
      #if targetEnvironment(simulator)
      promise.resolve(nil)
      #else
      self.handleStartBodyCompositionTest(promise: promise)
      #endif
    }

    AsyncFunction("stopBodyCompositionTest") { (promise: Promise) in
      #if targetEnvironment(simulator)
      promise.resolve(nil)
      #else
      self.handleStopBodyCompositionTest(promise: promise)
      #endif
    }

    // MARK: Lifecycle
    OnStartObserving {
      self.emitBluetoothStatus()
    }

    OnDestroy {
      self.cleanup()
    }
  }
}
