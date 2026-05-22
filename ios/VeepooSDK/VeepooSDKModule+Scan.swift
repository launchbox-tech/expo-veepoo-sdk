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

  func handleStopScan(promise: Promise) {
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
}
