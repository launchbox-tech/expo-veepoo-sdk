# 0185 — feat: world clock — JS layer

> GitHub: https://github.com/launchbox-tech/expo-veepoo-sdk/issues/185
> Labels: enhancement, needs-triage
> Status: OPEN

## Parent

#180

## What to build

Add a `WorldClockCapability` for reading and writing the list of time zones displayed on the Band's world-clock screen. Gated on `device_functions.world_clock === 'support'`. No native bridge code in this slice.

## Acceptance criteria

- [ ] `WorldClockEntry` type: `{ timezone_offset_minutes: number; city_name: string; dst_offset?: number }`
- [ ] `WorldClockCapability` with:
  - `readWorldClock(): Promise<WorldClockEntry[]>`
  - `setWorldClock(clocks: WorldClockEntry[]): Promise<OperationStatus>` — validates max 4 entries; validates each `timezone_offset_minutes` in range -720–840; validates `city_name` non-empty string
- [ ] Both methods reject with `CAPABILITY_UNSUPPORTED` when `device_functions.world_clock !== 'support'`
- [ ] `setWorldClock` with more than 4 entries rejects with `INVALID_ARGUMENT`
- [ ] Native method names added to `async-native-method-registry.ts`
- [ ] Capability wired into `VeepooSDK` facade and `VeepooSDKModuleInterface`
- [ ] Unit tests: `readWorldClock` normalizes vendor response to `WorldClockEntry[]`, `setWorldClock` validates entry count and offset range, `CAPABILITY_UNSUPPORTED` when flag absent

## Blocked by

None — can start immediately
