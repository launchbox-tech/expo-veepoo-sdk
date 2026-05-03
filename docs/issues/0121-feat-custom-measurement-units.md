# 0121 — feat: custom measurement units

> GitHub: https://github.com/launchbox-tech/expo-veepoo-sdk/issues/121
> Labels: needs-triage
> Status: open

## Parent

#118

## What to build

Bridge the device-level measurement unit preferences: temperature unit (°C / °F), blood glucose unit (mmol/L vs mg/dL), and skin-tone calibration level (1–6). These affect how the Band calibrates its optical sensors.

Introduce `readCustomSettings()`, `writeCustomSettings(settings: Partial<CustomSettings>)`, and `customSettingsData` event.

## Acceptance criteria

- [ ] `SkinTone` type added to `src/types/settings.ts`: integer 1–6 (1 = lightest, 6 = darkest)
- [ ] `CustomSettings` interface: `{ temperatureUnit: TemperatureUnit; bloodGlucoseUnit: BloodGlucoseUnit; skinTone: SkinTone }`
- [ ] `readCustomSettings()` resolves with `CustomSettings`; rejects `CAPABILITY_UNSUPPORTED` when unsupported
- [ ] `writeCustomSettings(Partial<CustomSettings>)` applies only the provided fields; resolves on success
- [ ] `customSettingsData` event emitted on read response and on Band-initiated update
- [ ] Android: `readCustomSetting` / `changeCustomSetting` paths implemented
- [ ] iOS: base-function toggle paths for temperature and glucose unit; skin-tone level path
- [ ] Normalizer unit-tested: Android `CustomSettingData` and iOS toggle values both normalise to correct `CustomSettings` shape
- [ ] Method names added to async-native-method registry; `customSettingsData` added to event contract
- [ ] Parity matrix row added under "Device information & settings"

## Blocked by

None — can start immediately
