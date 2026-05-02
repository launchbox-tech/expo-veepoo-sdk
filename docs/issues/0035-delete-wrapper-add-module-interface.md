# refactor(native): delete VeepooSDKNativeWrapper and add VeepooSDKModuleInterface

> GitHub: https://github.com/launchbox-tech/expo-veepoo-sdk/issues/35
> Status: closed | Labels: enhancement
> Parent: #32

## What to build

Delete the hollow `VeepooSDKNativeWrapper` class from `NativeVeepooSDK.ts` (~160 lines of pure pass-through). Move default param values (`dayOffset = 0`, `is24Hour = false`) to VeepooSDK call sites. Add `src/VeepooSDKModule.ts` with `VeepooSDKModuleInterface`. `VeepooSDK` gains `implements VeepooSDKModuleInterface`.

## Acceptance criteria

- [ ] `VeepooSDKNativeWrapper` class deleted entirely
- [ ] `NativeVeepooSDK.ts` contains only `NativeVeepooSDKInterface` + loader (~70 lines)
- [ ] `src/VeepooSDKModule.ts` exports `VeepooSDKModuleInterface`
- [ ] `VeepooSDK implements VeepooSDKModuleInterface`
- [ ] Default values `dayOffset = 0` and `is24Hour = false` at VeepooSDK call sites
- [ ] `tsc --noEmit` passes; all existing tests pass unchanged

## Blocked by

- #33
