# 0126 — feat: sport mode setting

> GitHub: https://github.com/launchbox-tech/expo-veepoo-sdk/issues/126
> Labels: needs-triage
> Status: open

## Parent

#118

## What to build

Allow the app to activate a named sport mode on the Band before a workout, read the currently active sport type, and receive an event when the Band ends a sport session on its own.

Introduce `readSportMode()`, `setSportMode(mode: SportMode)`, `stopSportMode()`, and `sportModeData` event.

## Acceptance criteria

- [ ] `SportMode` string union defined (or imported from #122 if already shipped) covering the 127+ documented modes
- [ ] `readSportMode()` resolves with `{ mode: SportMode | null; isActive: boolean }`; rejects `CAPABILITY_UNSUPPORTED` when unsupported
- [ ] `setSportMode(mode)` activates the given sport type on the Band; resolves on success
- [ ] `stopSportMode()` deactivates the current sport mode; resolves on success
- [ ] `sportModeData` event emitted when the Band reports a sport-mode change (device-side workout end)
- [ ] iOS: `veepooSDKSettingDeviceRunning:runMode:result:` wired for set; read path wired
- [ ] Android: equivalent sport-mode set/read paths wired
- [ ] Normalizer unit-tested: `VPDeviceRuningMode` raw value normalises to `SportMode` string
- [ ] Methods + event added to bridge-contract registries
- [ ] Parity matrix row added under "Device information & settings"

## Blocked by

None — can start immediately
