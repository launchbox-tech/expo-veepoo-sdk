# 0181 — feat: sport mode control — JS layer

> GitHub: https://github.com/launchbox-tech/expo-veepoo-sdk/issues/181
> Labels: enhancement, needs-triage
> Status: OPEN

## Parent

#180

## What to build

Add a `SportModeCapability` that lets the app start, stop, and read the active sport mode on the Band. The `SportMode` union type, `SPORT_MODE_ORDINALS` ordinal table, `SportModeStatus` interface, and `sport_mode_data` event are already defined in the JS layer — this slice wires them into a capability class with full test coverage. No native bridge code in this slice.

## Acceptance criteria

- [ ] `SportModeCapability` class with `readSportMode()`, `setSportMode(mode: SportMode)`, `stopSportMode()`
- [ ] `setSportMode` maps `SportMode` string to integer ordinal via `SPORT_MODE_ORDINALS`; `stopSportMode` sends ordinal 0
- [ ] `readSportMode` returns `SportModeStatus` (`{ mode: SportMode | null; is_active: boolean }`)
- [ ] All three methods reject with `CAPABILITY_UNSUPPORTED` when `device_functions.sport_model_function !== 'support'`
- [ ] Native method names added to `async-native-method-registry.ts`
- [ ] `sport_mode_data` already registered; confirm normalizer pass-through is correct
- [ ] Capability wired into `VeepooSDK` facade and `VeepooSDKModuleInterface`
- [ ] Unit tests: `setSportMode` sends correct ordinal, `stopSportMode` sends 0, `readSportMode` normalizes response, `CAPABILITY_UNSUPPORTED` rejection when flag absent

## Blocked by

None — can start immediately
