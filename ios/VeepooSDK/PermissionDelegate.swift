import CoreBluetooth

#if !targetEnvironment(simulator)
// MARK: - 权限回调委托
//
// Only built for device targets — the simulator-only `VeepooSDKModule`
// stub in `VeepooSDKSimulator.swift` doesn't expose
// `handlePermissionStateUpdate`, and the podspec already excludes the
// real module file (and every `VeepooSDKModule+*.swift` extension) from
// `iphonesimulator*` builds via `EXCLUDED_SOURCE_FILE_NAMES`.
final class PermissionDelegate: NSObject, CBCentralManagerDelegate {
  private weak var module: VeepooSDKModule?
  init(module: VeepooSDKModule) { self.module = module }
  func centralManagerDidUpdateState(_ central: CBCentralManager) {
    module?.handlePermissionStateUpdate(central)
  }
}

// MARK: - 状态回调委托 (always-on)
//
// [SCAN-FIX] The module's own `centralManager` was previously created with a
// nil delegate. Per CoreBluetooth, a nil-delegate central never completes
// initialization — `centralManagerDidUpdateState` is never delivered, so its
// `.state` stays `.unknown` indefinitely. `emitBluetoothStatus()` reads that
// state, so JS was blind to power-on for ~10s on a cold scan. This delegate
// drives the state callback so power-on is observed in ~200ms and any pending
// scan is re-armed immediately.
final class CentralStateDelegate: NSObject, CBCentralManagerDelegate {
  private weak var module: VeepooSDKModule?
  init(module: VeepooSDKModule) { self.module = module }
  func centralManagerDidUpdateState(_ central: CBCentralManager) {
    module?.handleCentralStateUpdate(central)
  }
}
#endif
