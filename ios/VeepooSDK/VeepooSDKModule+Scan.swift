import ExpoModulesCore
import VeepooBleSDK

extension VeepooSDKModule {
  func handleStartScan(options: [String: Any]?, promise: Promise) {
    #if targetEnvironment(simulator)
    promise.resolve(nil)
    #else
    guard self.isInitialized else {
      promise.reject("SDK_NOT_INITIALIZED", "SDK not initialized")
      return
    }
    self.pendingScanStart = true
    guard self.bleManager != nil else {
      promise.reject("SDK_NOT_INITIALIZED", "BLE manager is nil")
      return
    }
    if self.isScanning {
      promise.resolve(nil)
      return
    }
    self.isScanning = true
    self.scanRearmedOnPowerOn = false // [SCAN-FIX] new scan session
    self.emitBluetoothStatus()
    // [SCAN-FIX] Don't start the vendor scan inline — a scan issued before the
    // radio is poweredOn is silently dropped, and the cold first scan needs a
    // stop+start. ensureScanning() starts a clean scan when poweredOn, or defers
    // to the power-on callback; it's idempotent so the race with the delegate's
    // power-on is safe either way.
    let radioPoweredOn = self.centralManager?.state == .poweredOn
    print("[VeepooSDK] [SCAN-FIX] handleStartScan, radioPoweredOn: \(radioPoweredOn)")
    self.ensureScanning(source: "startScan")
    // [SCAN-FIX] JS numbers bridge as Double/NSNumber, so `as? Int` was failing
    // and silently defaulting to 10s (auto-stop cut the 20s search window short).
    let timeout = (options?["timeout"] as? NSNumber)?.intValue ?? 10000
    DispatchQueue.main.asyncAfter(deadline: .now() + Double(timeout) / 1000) { [weak self] in
      guard let self = self, self.isScanning else { return }
      self.bleManager?.veepooSDKStopScanDevice()
      self.isScanning = false
      self.pendingScanStart = false
      self.scanRearmedOnPowerOn = false
      self.emitBluetoothStatus()
    }
    promise.resolve(nil)
    #endif
  }

  func handleStopScan(promise: Promise) {
    #if targetEnvironment(simulator)
    promise.resolve(nil)
    #else
    self.pendingScanStart = false
    self.isScanning = false
    self.scanRearmedOnPowerOn = false
    self.bleManager?.veepooSDKStopScanDevice()
    self.emitBluetoothStatus()
    promise.resolve(nil)
    #endif
  }
}
