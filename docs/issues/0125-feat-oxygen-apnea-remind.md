# 0125 — feat: oxygen apnea remind

> GitHub: https://github.com/launchbox-tech/expo-veepoo-sdk/issues/125
> Labels: needs-triage
> Status: open

## Parent

#118

## What to build

Bridge the SpO2 apnea alert setting: a threshold-based alert that fires when the Band detects breath-holding or apnea events during sleep. iOS only — no vendor Android path is currently documented; Android stub rejects with `CAPABILITY_UNSUPPORTED`.

Introduce `readApneaRemindSettings()`, `setApneaRemindSettings(settings: ApneaRemindSettings)`, and `apneaRemindData` event.

## Acceptance criteria

- [ ] `ApneaRemindSettings` interface: `{ enabled: boolean; threshold: number }`
- [ ] `readApneaRemindSettings()` resolves with `ApneaRemindSettings`; rejects `CAPABILITY_UNSUPPORTED` on Android and on iOS when capability absent
- [ ] `setApneaRemindSettings(settings)` applies the settings; rejects `CAPABILITY_UNSUPPORTED` on Android
- [ ] `apneaRemindData` event emitted on read response
- [ ] iOS: settingMode 2 = read, settingMode 1 = set, wired to `VPOxygenApneaRemindModel`
- [ ] Android: both methods reject with `CAPABILITY_UNSUPPORTED`
- [ ] Normalizer unit-tested: `VPOxygenApneaRemindModel` normalises to `ApneaRemindSettings`
- [ ] Methods + event added to bridge-contract registries
- [ ] Parity matrix row added under "Device information & settings" with note "iOS only"

## Blocked by

None — can start immediately
