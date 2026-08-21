import ExpoModulesCore
import VeepooBleSDK

// Mutable state shared between SDK callbacks of a single realtime test session.
// Both wrappers live here (rather than in each per-modality file) because the
// heart-rate, blood-oxygen, and blood-glucose handlers each need an
// ObservableObject-style box to pass the running progress and the latest sensor
// value between the simulated progress Timer and the vendor SDK callback.
class ProgressWrapper {
  var value: Int = 0
}

class ValueWrapper<T> {
  var value: T
  init(value: T) {
    self.value = value
  }
}

extension VeepooSDKModule {
  /// Mutex for realtime-test starts. Refuses to begin a new test while one is
  /// already running and records the active modality so the matching `stop`
  /// path can clear it via `finishMeasurement`.
  func ensureMeasurementCanStart(type: String, promise: Promise) -> Bool {
    #if !targetEnvironment(simulator)
    let connectedId = self.connectedDeviceId ?? self.activeConnectDeviceId ?? ""
    print("[Measurement] 准备启动\(type)测量 - connectionState: \(self.connectionState.rawValue), connectedDeviceId: \(self.connectedDeviceId ?? "nil"), activeConnectDeviceId: \(self.activeConnectDeviceId ?? "nil"), activeMeasurementType: \(self.activeMeasurementType ?? "nil")")

    guard self.isInitialized else {
      print("[Measurement] 拒绝启动\(type)测量 - SDK 未初始化")
      promise.reject("SDK_NOT_INITIALIZED", "SDK not initialized")
      return false
    }

    guard self.peripheralManage != nil else {
      print("[Measurement] 拒绝启动\(type)测量 - peripheralManage 为 nil")
      promise.reject("SDK_NOT_INITIALIZED", "Peripheral manager is nil")
      return false
    }

    guard !connectedId.isEmpty else {
      print("[Measurement] 拒绝启动\(type)测量 - 当前没有连接设备")
      promise.reject("DEVICE_NOT_CONNECTED", "No device connected")
      return false
    }

    guard self.connectionState.rawValue == ConnectionState.ready.rawValue else {
      print("[Measurement] 拒绝启动\(type)测量 - 设备尚未 ready, 当前状态: \(self.connectionState.rawValue)")
      promise.reject("DEVICE_NOT_READY", "Device is not ready for measurement")
      return false
    }

    // [DAILY-READ EXCLUSIVITY — official doc: "in the process of reading daily
    // data, it does not support operating the switch state of the device"] A
    // realtime test issued mid-read is the documented concurrency violation —
    // refuse it (fail-fast device-busy) so the read isn't deafened. The app layer
    // already sequences its own ops after the read; this bounces stray callers.
    if self.dailyReadInFlight {
      print("[Measurement] 拒绝启动\(type)测量 - 正在读取每日数据 (daily read in flight)")
      promise.reject("BAND_BUSY_READING", "Device is busy reading daily data; retry after the read completes")
      return false
    }

    if self.activeMeasurementType != nil {
      let busy = self.activeMeasurementType ?? ""
      print("[Measurement] 拒绝启动\(type)测量 - 已有测量进行中: \(busy)")
      promise.reject("REALTIME_TEST_IN_PROGRESS", busy == type ? "This realtime test is already in progress" : "Another realtime test is already in progress (\(busy))")
      return false
    }

    self.activeMeasurementType = type
    print("[Measurement] 已允许启动\(type)测量")
    return true
    #else
    return true
    #endif
  }

  /// Counterpart to `ensureMeasurementCanStart`. Clears the active modality
  /// only when the call matches the currently-tracked type, so an out-of-order
  /// callback from a previously-cancelled test cannot wipe state owned by the
  /// current run.
  func finishMeasurement(type: String, reason: String) {
    #if !targetEnvironment(simulator)
    if self.activeMeasurementType == type {
      print("[Measurement] 结束\(type)测量 - reason: \(reason)")
      self.activeMeasurementType = nil
    } else {
      print("[Measurement] 收到\(type)测量结束，但当前 activeMeasurementType=\(self.activeMeasurementType ?? "nil"), reason: \(reason)")
    }
    #endif
  }
}
