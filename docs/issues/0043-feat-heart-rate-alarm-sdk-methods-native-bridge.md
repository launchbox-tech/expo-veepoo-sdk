# 43 — feat(heart-rate-alarm): SDK methods + native bridge — readHeartRateAlarm / setHeartRateAlarm

**Status:** closed  
**Labels:** (sync from GitHub)

## Parent

#40

## What to build

Expose `readHeartRateAlarm()` and `setHeartRateAlarm()` through the full stack: `VeepooSDKModuleInterface`, `VeepooSDK.ts`, and both native bridges (Android + iOS).

- Add `readHeartRateAlarm(): Promise<HeartRateAlarm>` and `setHeartRateAlarm(alarm: HeartRateAlarm): Promise<OperationStatus>` to `VeepooSDKModuleInterface`
- Implement both methods in `VeepooSDK.ts`: `setHeartRateAlarm` calls `validateHeartRateAlarm` before any BLE traffic; both methods emit `heartRateAlarmData` after the native call completes
- Android bridge: map to `HeartWaringSetting` fields `heartHigh`, `heartLow`, `isOpen`
- iOS bridge: map to `VPDeviceHeartAlarmModel`; derive `settingMode` from `alarm.enabled` (0 = close, 1 = open, 2 = read)

## Acceptance criteria

- [x] `readHeartRateAlarm()` and `setHeartRateAlarm()` are declared on `VeepooSDKModuleInterface`
- [x] `readHeartRateAlarm()` resolves with a `HeartRateAlarm` and emits `heartRateAlarmData`
- [x] `setHeartRateAlarm({ enabled: true, highThreshold: 120, lowThreshold: 50 })` resolves with `'success'` or `'fail'`
- [x] `setHeartRateAlarm({ enabled: false, ... })` disables the alarm without losing threshold values (native model carries thresholds + `isOpen`)
- [x] `setHeartRateAlarm` throws `VeepooError(INVALID_ARGUMENT)` before hitting the bridge when thresholds are invalid
- [x] Android bridge correctly maps to/from `HeartWaringSetting`
- [x] iOS bridge correctly maps to/from `VPDeviceHeartAlarmModel` with `settingMode` derived from `enabled`
- [ ] Verified on a physical Band that read and set round-trip correctly
