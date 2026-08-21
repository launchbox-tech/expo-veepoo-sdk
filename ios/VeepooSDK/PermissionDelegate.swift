import CoreBluetooth

// MARK: - 权限回调委托
//
// Pure CoreBluetooth — no vendor SDK — so these compile on the simulator too.
// They are only ever *constructed* inside `#if !targetEnvironment(simulator)`
// branches, so the simulator has nothing to instantiate.
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
