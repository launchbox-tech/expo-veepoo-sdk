# 0180 — PRD: Feature parity gaps — sport mode control, device function switches, sensor alarms, calibration, utility methods

> GitHub: https://github.com/launchbox-tech/expo-veepoo-sdk/issues/180
> Labels: enhancement, needs-triage
> Status: Open

## Problem Statement

The VeepooSDK bridge covers the core health test and data-sync surface well, but four categories of vendor SDK functionality remain unbridged. A companion app built on the current bridge cannot:

- Start, stop, or read the active sport mode on the Band before a workout. The `SportMode` type and `SPORT_MODE_ORDINALS` table already exist in the JS layer, and the `sport_mode_data` event already fires when the Band changes mode autonomously — but the app has no way to *set* a mode.
- Toggle individual device feature switches (continuous auto-monitoring of HR, BP, SpO₂, temperature, HRV, blood glucose; raise-to-wake; wear detection; disconnect alarm; SOS remind; accurate sleep mode; ECG-always-on; MET monitoring; stress monitoring; and others). The vendor SDK exposes `VPSettingBaseFunctionSwitchType` (iOS) and a custom-setting model (Android) for these, but nothing in the bridge surfaces them.
- Read or set a SpO₂ low-level alarm threshold for continuous overnight monitoring. This is distinct from the existing apnea-remind (which is threshold-based apnea detection) and from the HR alarm already bridged — it is a separate Band-side alert that fires when continuous SpO₂ drops below a configured percentage.
- Calibrate blood pressure offset values (systolic / diastolic correction) or blood glucose (single-point calibration + risk-level configuration) — features present in both vendor SDKs and used by health-focused apps to improve measurement accuracy.
- Set or read the world clock (multiple time zones displayed on Band), rename the BLE device name, or control the connection-confirmation popup behaviour added in vendor SDK v1.2.3.

These gaps were confirmed by direct comparison of the live vendor SDKs (https://github.com/HBandSDK/Android_Ble_SDK, https://github.com/HBandSDK/iOS_Ble_SDK) against the current JS API surface.

---

## Solution

Add JS methods, TypeScript types, normalizers, validators, and native bridge stubs for each of the six feature groups below. Each group follows the established capability module pattern: a typed `CapabilityContext`, `invokeOrThrow` for native calls, new `VeepooEvent` + payload entries where data arrives asynchronously, `CAPABILITY_UNSUPPORTED` rejection when the device capability flag is absent, and full unit-test coverage of the JS layer before native bridges are written.

**Feature groups:**

1. **Sport mode control** — `readSportMode()` / `setSportMode(mode: SportMode)` / `stopSportMode()`. The `SportMode` type, `SPORT_MODE_ORDINALS` ordinal table, `SportModeStatus` interface, and `sport_mode_data` event are all already defined — only the capability class and native bridge are missing.

2. **Device function switches** — A new `DeviceSwitchesCapability` exposing `readDeviceSwitches()` and `setDeviceSwitch(type: DeviceSwitchType, enabled: boolean)`. `DeviceSwitchType` is a string-union enum covering every named switch in the vendor SDK. A `device_switches_data` event fires when the Band reports its current switch state. Gated on `readDeviceFunctions()` capability flags where applicable.

3. **SpO₂ alarm** — `readSpo2Alarm()` / `setSpo2Alarm(alarm: Spo2Alarm)` added to the existing `AlarmsCapability`. `Spo2Alarm` mirrors the existing `HeartRateAlarm` shape (`enabled`, `low_threshold`). A `spo2_alarm_data` event carries the current setting after read or write.

4. **Sensor calibration** — A new `CalibrationCapability` with `calibrateBloodPressure(systolic, diastolic)`, `calibrateBloodGlucose(value)`, and `setBloodGlucoseRiskLevel(config: BloodGlucoseRiskConfig)`. All three gated on the corresponding `readDeviceFunctions()` capability flag.

5. **World clock** — A new `WorldClockCapability` with `readWorldClock()` / `setWorldClock(clocks: WorldClockEntry[])`. `WorldClockEntry` carries a timezone offset and display name. Gated on `device_functions.world_clock === 'support'`.

6. **Device utility methods** — Small methods added to the existing `SessionCapability`: `renameDevice(name)`, `isConnectionConfirmEnabled()`, `setConnectionConfirmEnabled(enabled)`, `setConnectionConfirmTimeout(seconds)`.

---

## User Stories

1. As a companion-app developer, I want to call `setSportMode('outdoor_run')` before a workout starts, so that the Band applies the correct heart-rate and calorie algorithm for that activity.
2. As a companion-app developer, I want to call `stopSportMode()` when the user ends their workout from the app UI, so that the Band stops sport-mode tracking.
3. As a companion-app developer, I want to call `readSportMode()` to know whether a sport mode is currently active on the Band, so that I can reflect that state in the app UI without waiting for a `sport_mode_data` event.
4. As a companion-app developer, I want a `sport_mode_data` event to fire whenever the Band autonomously enters or exits a sport mode, so that the app stays in sync.
5. As a companion-app developer, I want to call `readDeviceSwitches()` to retrieve the current state of all Band feature switches in one call, so that I can render a settings screen showing which features are active.
6. As a companion-app developer, I want to call `setDeviceSwitch('auto_hr', true)` to enable continuous heart-rate monitoring on the Band.
7. As a companion-app developer, I want to toggle auto-monitoring for BP, SpO₂, temperature, HRV, and blood glucose independently.
8. As a companion-app developer, I want to toggle the disconnect alarm so that the Band vibrates when it loses connection to the phone.
9. As a companion-app developer, I want to toggle wear-detection so that the Band can automatically pause activity tracking when removed.
10. As a companion-app developer, I want to toggle ECG-always-on for Bands that support passive ECG collection.
11. As a companion-app developer, I want to toggle MET monitoring and stress monitoring independently.
12. As a companion-app developer, I want to toggle accurate-sleep mode so that the Band uses its deeper sleep-analysis algorithm overnight.
13. As a companion-app developer, I want a `device_switches_data` event that fires when the Band reports its switch state on connection.
14. As a companion-app developer, I want to call `readSpo2Alarm()` to retrieve the SpO₂ low-level alarm threshold.
15. As a companion-app developer, I want to call `setSpo2Alarm({ enabled: true, low_threshold: 90 })` to configure the Band to alert when overnight SpO₂ drops below 90%.
16. As a companion-app developer, I want a `spo2_alarm_data` event that carries the updated alarm config after read or write.
17. As a companion-app developer, I want to call `calibrateBloodPressure(systolic, diastolic)` to push a calibration offset to the Band.
18. As a companion-app developer, I want to call `calibrateBloodGlucose(value)` with a reference glucose reading.
19. As a companion-app developer, I want to call `setBloodGlucoseRiskLevel(config)` to configure low/high glucose alert thresholds.
20. As a companion-app developer, I want calibration calls to reject with `CAPABILITY_UNSUPPORTED` when the device flag is absent.
21. As a companion-app developer, I want to call `readWorldClock()` to retrieve the list of time zones on the Band.
22. As a companion-app developer, I want to call `setWorldClock(clocks)` to push up to four time-zone entries.
23. As a companion-app developer, I want world clock to reject with `CAPABILITY_UNSUPPORTED` on unsupported Bands.
24. As a companion-app developer, I want to call `renameDevice(name)` to set a new BLE advertised name.
25. As a companion-app developer, I want to call `isConnectionConfirmEnabled()` to know whether the Band requires user confirmation before accepting a BLE connection.
26. As a companion-app developer, I want to call `setConnectionConfirmEnabled(false)` to disable the popup for seamless auto-reconnect.
27. As a companion-app developer, I want to call `setConnectionConfirmTimeout(seconds)` to configure the confirm timeout.
28. As a companion-app user, I want the app to activate the correct sport profile on my Band when I start a workout.
29. As a companion-app user, I want to enable continuous HR monitoring from the app without navigating Band menus.
30. As a companion-app user, I want to calibrate my blood pressure readings against a validated reference.
31. As a companion-app user, I want the disconnect alarm to turn on when I configure it in the app.
32. As a companion-app user, I want the SpO₂ alarm to alert me at night if my oxygen levels drop unexpectedly.

---

## Implementation Decisions

- **Sport mode control**: New `SportModeCapability`. `setSportMode` maps `SportMode` string to integer ordinal via `SPORT_MODE_ORDINALS`. `stopSportMode` sends ordinal 0. `readSportMode` returns `SportModeStatus`. Gated on `device_functions.sport_model_function === 'support'`.
- **Device function switches**: New `DeviceSwitchesCapability`. `DeviceSwitchType` string-union covers all named switches. `DeviceSwitches` is `Record<DeviceSwitchType, boolean>`. `wrist_flip` capability is not duplicated. New `device_switches_data` event in `VeepooEventPayload`.
- **SpO₂ alarm**: Added to `AlarmsCapability`. `Spo2Alarm` type: `{ enabled: boolean; low_threshold: number }`. New `spo2_alarm_data` event. Follows existing `heartRateAlarm` pattern with `emitLocal`.
- **Calibration**: New `CalibrationCapability`. `BloodGlucoseRiskConfig`: `{ low: number; high: number; unit: BloodGlucoseUnit }`. All methods return `Promise<OperationStatus>`.
- **World clock**: New `WorldClockCapability`. `WorldClockEntry`: `{ timezone_offset_minutes: number; city_name: string; dst_offset?: number }`. Max 4 entries validated in JS layer.
- **Device utilities**: Added to `SessionCapability`. Connection-confirm and rename are thin native delegates.
- All new events registered in `NATIVE_TO_JS_EVENT_MAP` or `JS_LOCAL_ONLY_EVENTS`, added to `VeepooEventPayload`, normalizer dispatch table, and bridge-contract registry.

---

## Testing Decisions

Good tests verify external behaviour: given a mock native resolving with a fixture, assert the JS return value and any `emitLocal` / `sdk.on` side-effects. No testing of internal normalizer logic unless it is complex enough to warrant isolation (following `normalizers.test.ts` precedent).

Modules to test:
- `SportModeCapability` — correct ordinal sent to native, `SportModeStatus` normalized, `CAPABILITY_UNSUPPORTED` when flag absent
- `DeviceSwitchesCapability` — full `DeviceSwitches` record returned, `setDeviceSwitch` sends correct type+enabled, `device_switches_data` fires via `emitLocal`
- `AlarmsCapability` extension — `readSpo2Alarm`/`setSpo2Alarm` normalize and validate, `spo2_alarm_data` emitLocal fires
- `CalibrationCapability` — validated inputs, `CAPABILITY_UNSUPPORTED` when flag absent, `INVALID_ARGUMENT` for out-of-range
- `WorldClockCapability` — timezone entries normalized, max-4 validation, `CAPABILITY_UNSUPPORTED` when flag absent
- `SessionCapability` extension — `renameDevice` and connection-confirm delegate correctly

Prior art: `alarm-settings.test.ts`, `emergency-settings.test.ts`, `health-config.test.ts`, `system-settings.test.ts`.

---

## Out of Scope

- Native (iOS Swift / Android Kotlin) bridge implementations — separate issues per feature group, labelled `ready-for-human`.
- App-side HRV computation (Lorenz scatter RR-interval analysis).
- Air-pump blood pressure device support.
- 4G functionality, JH58 raw PPG, GSR health-glance, JL chip file system, vibration motor (QX17), always-off screen (ZT163).
- ECG diagnosis interface.
- Text/image push to device display.
- Blood glucose multi-point calibration.

---

## Further Notes

- `device_switches_data` likely maps to an existing native event; confirm native event name before bridge registration.
- `setSportMode` on Android takes an integer ordinal; iOS uses a string. The JS normalizer bridges both.
- iOS `readSportMode` returns `mode: null` (vendor limitation) — `SportModeStatus` already accounts for this.
- `renameDevice` added in Android vendor SDK v1.2.6; iOS equivalent should be confirmed before native bridge.
- Connection-confirm methods added in Android vendor SDK v1.2.3.
