import ExpoModulesCore
import CoreBluetooth

#if !targetEnvironment(simulator)
import VeepooBleSDK
#endif

/**
 [RESTORATION] Arms CoreBluetooth state restoration on the VENDOR's central
 manager, during `didFinishLaunchingWithOptions`.

 Why a launch subscriber and not `handleInit`: iOS delivers
 `centralManager(_:willRestoreState:)` ONLY if a `CBCentralManager` carrying the
 matching restore identifier is re-instantiated while the app is launching
 (QA1962). `handleInit` is called FROM JS, so on a cold BLE relaunch the order is
 `didFinishLaunching` → bridge boots → bundle loads → `initialize()`. By the time
 the vendor manager exists, iOS has nothing left to restore into. Arming there
 would look armed and silently never deliver.

 Why the vendor's manager and not ours: `VeepooSDKModule.centralManager` only
 scans and reads radio state. The manager that owns the CONNECTION lives on
 `VPBleCentralManage.sharedBleManager().centralManager`, and that class already
 implements `centralManager:willRestoreState:` — confirmed present in the
 shipped framework binary. The vendor simply never passes
 `CBCentralManagerOptionRestoreIdentifierKey`, so their handler is dead code
 today. The property is `readwrite`, so we can supply a manager that arms it and
 let their existing handler run.

 This is an UNSUPPORTED seam. A vendor update can change how
 `sharedBleManager()` builds its manager and quietly break this. The pass
 criterion is NOT that `willRestoreState:` fires — it is that a restored link
 completes a real command (see `band.bg_sync.summary` on the app side). A
 delegate callback that hands back a peripheral the vendor's own bookkeeping
 doesn't know about is the zombie-link state, not a working sync.
 */
public final class VeepooRestorationSubscriber: ExpoAppDelegateSubscriber {
  /// Must be STABLE across launches — iOS keys preserved state by this string.
  public static let restoreIdentifier = "ai.rayu.veepoo.central"

  /// Set once a band has been connected at least once. Gates the arming so a
  /// first launch never constructs a central manager (which would raise the iOS
  /// Bluetooth permission prompt before the user reaches onboarding).
  public static let pairedFlagKey = "ai.rayu.veepoo.hasPairedDevice"

  /// True when THIS launch was started by iOS to restore Bluetooth work: set
  /// from the launch options or, when those arrive empty, by iOS calling
  /// `centralManager(_:willRestoreState:)` while the app is still in the
  /// background.
  public private(set) static var didLaunchForRestoration = false

  /// The restore ids iOS passed in the launch options, empty on a normal launch.
  public private(set) static var launchRestoreIds: [String] = []

  /// How the launch-time arming ended: `armed`, or the reason it was skipped.
  public private(set) static var armOutcome = "not_run"

  /// The exact manager built with the restore identifier. "Armed" means the
  /// vendor still holds THIS object; any other manager, even a non-nil one the
  /// vendor built itself, carries no restore identifier and restores nothing.
  public private(set) static var armedCentral: CBCentralManager?

  private static let traceLock = NSLock()
  private static var traceLines: [String] = []
  private static let traceCap = 100

  /// Records one restoration line for the app's log sink and prints it. The
  /// `print` alone only reaches the Xcode console, which a field device trace
  /// can't retrieve; JS drains these through `getRestorationState`.
  public static func trace(_ line: String) {
    let stamped = "\(ISO8601DateFormatter().string(from: Date())) \(line)"
    print("[VeepooSDK] [RESTORATION] \(line)")
    traceLock.lock()
    traceLines.append(stamped)
    if traceLines.count > traceCap { traceLines.removeFirst(traceLines.count - traceCap) }
    traceLock.unlock()
  }

  /// Returns the trace lines recorded since the last drain, oldest first.
  public static func drainTrace() -> [String] {
    traceLock.lock()
    defer { traceLock.unlock() }
    let lines = traceLines
    traceLines.removeAll()
    return lines
  }

  /// Records that a band has been connected, so later launches may arm.
  public static func markPaired() {
    UserDefaults.standard.set(true, forKey: pairedFlagKey)
  }

  #if !targetEnvironment(simulator)
  /// Whether the vendor's connection-owning manager is the one armed at launch.
  public static func vendorCentralIsArmed() -> Bool {
    guard let armed = armedCentral, let vendor = VPBleCentralManage.sharedBleManager()?.centralManager else {
      return false
    }
    return vendor === armed
  }

  /// One line naming every fact that decides whether iOS can restore us.
  public static func describeState(_ label: String) -> String {
    let vendor = VPBleCentralManage.sharedBleManager()?.centralManager
    let vendorDelegateIsVendor = vendor?.delegate === VPBleCentralManage.sharedBleManager()
    let appState = UIApplication.shared.applicationState.rawValue
    return "\(label) arm_outcome=\(armOutcome) vendor_central_is_armed=\(vendorCentralIsArmed()) "
      + "vendor_central_present=\(vendor != nil) vendor_delegate_is_vendor=\(vendorDelegateIsVendor) "
      + "vendor_central_state=\(vendor?.state.rawValue ?? -1) armed_central_state=\(armedCentral?.state.rawValue ?? -1) "
      + "bt_authorization=\(CBManager.authorization.rawValue) paired_flag=\(UserDefaults.standard.bool(forKey: pairedFlagKey)) "
      + "app_state=\(appState) restoration_launch=\(didLaunchForRestoration) restore_ids=\(launchRestoreIds)"
  }
  #endif

  public func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil
  ) -> Bool {
    #if !targetEnvironment(simulator)
    // iOS sets this key only when the launch itself was caused by restorable
    // Bluetooth work. Logged separately from the arming so a device trace can
    // tell "we armed it" apart from "iOS actually relaunched us for BLE".
    let centrals = launchOptions?[.bluetoothCentrals] as? [String]
    Self.launchRestoreIds = centrals ?? []
    Self.didLaunchForRestoration = !(centrals?.isEmpty ?? true)
    let optionKeys = (launchOptions ?? [:]).keys.map { $0.rawValue }.sorted()
    Self.trace("launch restore_ids=\(Self.launchRestoreIds) restoration_launch=\(Self.didLaunchForRestoration) option_keys=\(optionKeys) app_state=\(application.applicationState.rawValue)")

    armRestoration()
    #endif
    return true
  }

  #if !targetEnvironment(simulator)
  // The last moment before a background kill: if the vendor has swapped the
  // armed manager out by now, iOS has nothing to restore when it relaunches us.
  public func applicationDidEnterBackground(_ application: UIApplication) {
    Self.trace(Self.describeState("did_enter_background"))
  }

  public func applicationWillEnterForeground(_ application: UIApplication) {
    Self.trace(Self.describeState("will_enter_foreground"))
  }

  /// Wraps the vendor's own CoreBluetooth callbacks so the trace shows the
  /// moments that decide restoration: iOS handing state back at launch, and
  /// the band dropping while we are in the background. The vendor's handler
  /// still runs unchanged after each line.
  private static var hooksInstalled = false
  private static func installVendorHooks() {
    guard !hooksInstalled else { return }
    hooksInstalled = true
    let cls: AnyClass = VPBleCentralManage.self

    let restoreSel = NSSelectorFromString("centralManager:willRestoreState:")
    if let method = class_getInstanceMethod(cls, restoreSel) {
      typealias Restore = @convention(c) (AnyObject, Selector, CBCentralManager, NSDictionary) -> Void
      let original = unsafeBitCast(method_getImplementation(method), to: Restore.self)
      let block: @convention(block) (AnyObject, CBCentralManager, NSDictionary) -> Void = { target, central, dict in
        let peripherals = (dict[CBCentralManagerRestoredStatePeripheralsKey] as? [CBPeripheral]) ?? []
        let described = peripherals.map { "\($0.identifier.uuidString):\($0.state.rawValue)" }
        let services = (dict[CBCentralManagerRestoredStateScanServicesKey] as? [CBUUID])?.map { $0.uuidString } ?? []
        // iOS hands back preserved state to ANY launch that rebuilds the
        // restore-keyed manager, including one the user opened after a kill
        // (seen on device 2026-10-04 with app_state=1). Only a launch still in
        // the background when state arrives is one iOS started for Bluetooth.
        // The launch-options key can't decide it: a real Bluetooth relaunch
        // arrived with no launch options at all.
        if UIApplication.shared.applicationState == .background {
          Self.didLaunchForRestoration = true
        }
        Self.trace("will_restore_state peripherals=\(described) scan_services=\(services) is_armed_central=\(central === Self.armedCentral) app_state=\(UIApplication.shared.applicationState.rawValue)")
        original(target, restoreSel, central, dict)
      }
      method_setImplementation(method, imp_implementationWithBlock(block))
    } else {
      trace("hook skipped, vendor has no willRestoreState")
    }

    let connectSel = NSSelectorFromString("centralManager:didConnectPeripheral:")
    if let method = class_getInstanceMethod(cls, connectSel) {
      typealias Connect = @convention(c) (AnyObject, Selector, CBCentralManager, CBPeripheral) -> Void
      let original = unsafeBitCast(method_getImplementation(method), to: Connect.self)
      let block: @convention(block) (AnyObject, CBCentralManager, CBPeripheral) -> Void = { target, central, peripheral in
        Self.trace("did_connect peripheral=\(peripheral.identifier.uuidString) is_armed_central=\(central === Self.armedCentral) app_state=\(UIApplication.shared.applicationState.rawValue)")
        original(target, connectSel, central, peripheral)
      }
      method_setImplementation(method, imp_implementationWithBlock(block))
    }

    let disconnectSel = NSSelectorFromString("centralManager:didDisconnectPeripheral:error:")
    if let method = class_getInstanceMethod(cls, disconnectSel) {
      typealias Disconnect = @convention(c) (AnyObject, Selector, CBCentralManager, CBPeripheral, NSError?) -> Void
      let original = unsafeBitCast(method_getImplementation(method), to: Disconnect.self)
      let block: @convention(block) (AnyObject, CBCentralManager, CBPeripheral, NSError?) -> Void = { target, central, peripheral, error in
        Self.trace("did_disconnect peripheral=\(peripheral.identifier.uuidString) error=\(error?.code ?? 0) is_armed_central=\(central === Self.armedCentral) app_state=\(UIApplication.shared.applicationState.rawValue)")
        original(target, disconnectSel, central, peripheral, error)
      }
      method_setImplementation(method, imp_implementationWithBlock(block))
    }
  }

  private func armRestoration() {
    // Never construct a central manager for a user who has never paired a band —
    // doing so raises the Bluetooth permission prompt at first launch, before
    // onboarding. Nothing is restorable in that case anyway.
    guard UserDefaults.standard.bool(forKey: Self.pairedFlagKey) else {
      Self.armOutcome = "skipped_not_paired"
      Self.trace("skipped, no paired band on this install")
      return
    }
    // Same reason, for a user who has since denied or not yet granted BLE: a
    // manager built here would prompt at launch rather than at a moment the
    // user understands.
    guard CBManager.authorization == .allowedAlways else {
      Self.armOutcome = "skipped_bt_authorization_\(CBManager.authorization.rawValue)"
      Self.trace("skipped, bluetooth authorization=\(CBManager.authorization.rawValue)")
      return
    }
    guard let manager = VPBleCentralManage.sharedBleManager() else {
      Self.armOutcome = "skipped_no_vendor_manager"
      Self.trace("skipped, sharedBleManager unavailable")
      return
    }
    Self.installVendorHooks()
    let previous = manager.centralManager
    // The vendor object is its own CBCentralManagerDelegate and already
    // implements willRestoreState:. Keep it as the delegate so its internal
    // bookkeeping stays on the path it expects.
    let central = CBCentralManager(
      delegate: manager,
      queue: nil,
      options: [
        CBCentralManagerOptionRestoreIdentifierKey: Self.restoreIdentifier,
        // Suppress the system power alert here: at launch the user has no
        // context for it. The scan path raises it at a moment that makes sense.
        CBCentralManagerOptionShowPowerAlertKey: false,
      ]
    )
    manager.centralManager = central
    Self.armedCentral = central
    Self.armOutcome = "armed"
    Self.trace("armed id=\(Self.restoreIdentifier) state=\(central.state.rawValue) replaced_vendor_central=\(previous != nil) took=\(manager.centralManager === central)")
  }
  #endif
}
