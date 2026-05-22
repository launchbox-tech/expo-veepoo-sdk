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
#endif
