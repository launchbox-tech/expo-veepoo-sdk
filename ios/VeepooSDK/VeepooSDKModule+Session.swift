import ExpoModulesCore
import CoreBluetooth
import VeepooBleSDK

extension VeepooSDKModule {
  // MARK: Initialization
  func handleInit(promise: Promise) {
    #if !targetEnvironment(simulator)
    let promiseBox = self.makePromiseBox(promise)
    #endif
    DispatchQueue.main.async {
      #if targetEnvironment(simulator)
      self.isInitialized = true
      promise.resolve(nil)
      #else
      guard let manager = VPBleCentralManage.sharedBleManager() else {
        promiseBox.reject("SDK_NOT_AVAILABLE", "Failed to initialize Veepoo SDK")
        return
      }
      self.bleManager = manager
      self.peripheralManage = VPPeripheralManage.shareVPPeripheralManager()
      manager.peripheralManage = self.peripheralManage
      manager.isLogEnable = true
      manager.manufacturerIDFilter = false
      // [SINGLE-OWNER RECONNECT — official doc: multiple connections to one
      // peripheral trigger "an infinite loop of reading data and cause
      // exceptions"] The SDK's own auto-reconnect loop is a SECOND connection
      // owner racing our JS reconnect (band-session: backoff + tight-loop guard +
      // native adopt). Two owners re-issuing connect (→ read) into one band is the
      // documented concurrency hazard — and the experiment that enabled it was
      // never verified to help (it competed with our retrieve-first handleConnect).
      // JS owns ALL reconnection; the SDK loop stays off.
      manager.automaticConnection = false
      manager.isAutoConnectBT = false
      self.setupVeepooCallbacks()
      self.isInitialized = true
      self.ensureCentralManager()
      promiseBox.resolve(nil)
      #endif
    }
  }

  // MARK: Permissions
  func handleIsBluetoothEnabled(promise: Promise) {
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

  func handleRequestPermissions(promise: Promise) {
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
}
