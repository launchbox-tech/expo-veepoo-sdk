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

  /// True when THIS launch was started by iOS to restore Bluetooth work.
  public private(set) static var didLaunchForRestoration = false

  /// Records that a band has been connected, so later launches may arm.
  public static func markPaired() {
    UserDefaults.standard.set(true, forKey: pairedFlagKey)
  }

  public func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil
  ) -> Bool {
    #if !targetEnvironment(simulator)
    // iOS sets this key only when the launch itself was caused by restorable
    // Bluetooth work. Logged separately from the arming so a device trace can
    // tell "we armed it" apart from "iOS actually relaunched us for BLE".
    let centrals = launchOptions?[.bluetoothCentrals] as? [String]
    Self.didLaunchForRestoration = !(centrals?.isEmpty ?? true)
    print("[VeepooSDK] [RESTORATION] launch restore_ids=\(centrals ?? []) restoration_launch=\(Self.didLaunchForRestoration)")

    armRestoration()
    #endif
    return true
  }

  #if !targetEnvironment(simulator)
  private func armRestoration() {
    // Never construct a central manager for a user who has never paired a band —
    // doing so raises the Bluetooth permission prompt at first launch, before
    // onboarding. Nothing is restorable in that case anyway.
    guard UserDefaults.standard.bool(forKey: Self.pairedFlagKey) else {
      print("[VeepooSDK] [RESTORATION] skipped — no paired band on this install")
      return
    }
    // Same reason, for a user who has since denied or not yet granted BLE: a
    // manager built here would prompt at launch rather than at a moment the
    // user understands.
    guard CBManager.authorization == .allowedAlways else {
      print("[VeepooSDK] [RESTORATION] skipped — bluetooth authorization=\(CBManager.authorization.rawValue)")
      return
    }
    guard let manager = VPBleCentralManage.sharedBleManager() else {
      print("[VeepooSDK] [RESTORATION] skipped — sharedBleManager unavailable")
      return
    }
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
    print("[VeepooSDK] [RESTORATION] armed id=\(Self.restoreIdentifier) state=\(central.state.rawValue)")
  }
  #endif
}
