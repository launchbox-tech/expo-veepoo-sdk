# 0189 — feat: sport mode control — native bridge (iOS + Android)

> GitHub: https://github.com/launchbox-tech/expo-veepoo-sdk/issues/189
> Labels: enhancement, needs-triage, ready-for-human
> Status: OPEN

## Parent

#180

## What to build

Wire the `SportModeCapability` native methods on both platforms. On Android, `setSportMode` passes the integer ordinal from `SPORT_MODE_ORDINALS` to the vendor sport-mode API; on iOS, the vendor uses string constants that must be mapped from the `SportMode` type. Requires physical Band for verification.

## Acceptance criteria

- [ ] Android: `setSportMode(ordinal)`, `stopSportMode()` (ordinal 0), `readSportMode()` implemented via vendor Android sport-mode APIs
- [ ] iOS: `setSportMode`, `stopSportMode`, `readSportMode` wired via `veepooSDKSettingDeviceRunning:runMode:result:` or equivalent; iOS `readSportMode` returns `mode: null` per vendor limitation — JS layer already handles this
- [ ] `sportModeData` native event emitted on Band-side mode change; verify it maps correctly through `NATIVE_TO_JS_EVENT_MAP` to `sport_mode_data`
- [ ] `CAPABILITY_UNSUPPORTED` returned when device capability flag is absent on both platforms
- [ ] Manually verified on physical Band: set outdoor_run, confirm Band enters sport mode; stopSportMode, confirm Band exits

## Blocked by

#181
