# 0118 — PRD: Feature parity gaps — health reminders, exercise data, offline vitals, accurate sleep, SOS event, units, sport mode, apnea, electrode tests

> GitHub: https://github.com/launchbox-tech/expo-veepoo-sdk/issues/118
> Labels: (none)
> Status: closed (fully fulfilled — all 11 implementation issues #119–#129 shipped)

## Problem Statement

The VeepooSDK bridge has a solid core of health tests and device settings, but a second tier of vendor SDK capabilities remains unbridged. A companion app built on the current bridge cannot:

- Configure any health reminder except sedentary (drink-water, medication, eye-strain, and four more reminder types exist in the vendor SDK but are not exposed)
- Read stored exercise/running sessions (GPS sport sessions stored per-session with per-minute HR, pace, and calorie data — separate from the daily step stream)
- Read accurate/detailed sleep analysis (REM, insomnia tracking, per-minute sleep-state curve with quality scores — richer than the basic `readSleepData` result)
- Read per-modality offline vitals history stored by the Band (temperature, blood glucose, HRV, ECG, body composition each have separate DB-read paths that are not yet bridged)
- Receive the device-initiated SOS event (the Band fires a callback when the user triggers the SOS button; the app needs this to start the emergency call flow)
- Push measurement-unit preferences to the Band (temperature unit °C/°F, blood glucose unit mmol/L vs mg/dL, skin-tone calibration — all affect how the Band calibrates sensor readings)
- Set an active sport mode on the Band (activates Band-side sport tracking for 127+ modes before a workout starts)
- Read or configure the oxygen apnea alert threshold (iOS vendor API only)
- Run electrode-dependent tests: blood analysis, PTT (Pulse Transit Time), GSR (Galvanic Skin Response) — gated on device capability flags

These gaps are confirmed by direct comparison of the live vendor SDKs (https://github.com/HBandSDK/Android_Ble_SDK, https://github.com/HBandSDK/iOS_Ble_SDK) against the current JS API surface and the parity matrix (`docs/vendor-api/vendor-parity-matrix.md`).

---

## Solution

Add JS methods, TypeScript types, normalizers, validators, native bridge implementations (iOS Swift + Android Kotlin), and parity-matrix rows for each of the nine feature groups below. Each group follows the established module pattern: `AsyncFunction` on both platforms, new `VeepooEvent` entries and event payloads where data arrives asynchronously, and `CAPABILITY_UNSUPPORTED` rejection when the device capability flag is absent.

**Feature groups:**
1. **Health Reminders (multi-type)** — read and set all eight reminder types (sedentary, drink water, look far away, sport, take medicine, read, trip, wash hands) via a single parameterised API instead of the existing sedentary-only methods.
2. **Exercise Session Data** — sync stored running/sport sessions from device to app: session metadata (begin/end time, total steps, distance, calories, average HR, pace, sport type) plus per-minute HR/distance/calorie arrays.
3. **Accurate Sleep** — read the detailed sleep model per day: REM duration, insomnia flags and scores, per-minute sleep-state curve (deep/light/REM/insomnia/awake), quality scores, fall-asleep latency.
4. **Offline Vitals History** — per-modality DB reads for stored temperature, blood glucose, HRV, ECG, and body composition records.
5. **Device SOS Event** — receive and emit the Band-initiated SOS trigger (user presses SOS button on Band).
6. **Custom Measurement Units** — read and write device-level unit preferences: temperature unit (°C/°F), blood glucose unit (mmol/L vs mg/dL), skin-tone calibration level (1–6).
7. **Oxygen Apnea Remind** — read and set the apnea alert configuration on iOS (threshold, enabled state); Android gated on `CAPABILITY_UNSUPPORTED`.
8. **Sport Mode Setting** — activate or deactivate a named sport mode on the Band; read the current active sport type.
9. **Electrode-gated tests** — blood analysis test (start/stop + result event), PTT test (status listener + value events), GSR test (start/stop + result event); all gated on `readDeviceFunctions()` capability flags.

---

## User Stories

1. As a companion-app developer, I want to read all health reminder types (drink water, medication, eye strain, etc.) in a single call, so that I can display the full reminder schedule to the user without requiring per-type read calls.
2. As a companion-app developer, I want to write any health reminder type with a start time, end time, interval, and enabled flag, so that the user can configure their reminders from within the app.
3. As a companion-app developer, I want a `healthRemindData` event that fires when the Band proactively reports a reminder state change, so that the UI stays in sync without polling.
4. As a companion-app developer, I want to call `startReadExerciseData()` to sync stored sport sessions from the Band, so that the app can display workout history.
5. As a companion-app developer, I want `exerciseSessionData` events that carry a full session (type, begin/end, totals, per-minute HR/pace/cals) as the sync progresses, so that I can render workout detail views.
6. As a companion-app developer, I want to call `readAccurateSleepData(date?)` to retrieve detailed sleep analysis for a given day, so that the app can show REM duration, sleep quality score, insomnia flags, and a per-minute sleep-state curve.
7. As a companion-app developer, I want `accurateSleepData` events with the enriched model so I can distinguish deep/light/REM/insomnia/awake states at per-minute granularity.
8. As a companion-app developer, I want to call `readStoredTemperatureData(date?)` to retrieve historical temperature readings stored on the Band, so that the app can chart a multi-day temperature trend.
9. As a companion-app developer, I want to call `readStoredBloodGlucoseData(date?)` to retrieve stored glucose measurement history, so that the user can review past readings.
10. As a companion-app developer, I want to call `readStoredHrvData(date?)` to retrieve minute-level HRV samples stored on the Band.
11. As a companion-app developer, I want to call `readStoredEcgData(date?)` to retrieve stored ECG recordings and their diagnostic summaries.
12. As a companion-app developer, I want to call `readStoredBodyCompositionData(date?)` to retrieve body-composition measurements stored on the Band.
13. As a companion-app developer, I want corresponding `storedTemperatureData`, `storedBloodGlucoseData`, `storedHrvData`, `storedEcgData`, and `storedBodyCompositionData` events with typed payloads, so that I can build list/chart views for each modality.
14. As a companion-app developer, I want a `deviceSosTriggered` event that fires when the user presses the SOS button on the Band, so that the app can immediately initiate the emergency call sequence.
15. As a companion-app developer, I want to call `readCustomSettings()` to retrieve the Band's current unit configuration (temperature unit, glucose unit, skin-tone level), so that the app can display readings in the user's preferred unit.
16. As a companion-app developer, I want to call `writeCustomSettings(settings: Partial<CustomSettings>)` to push unit preferences to the Band, so that calibrated readings match the user's preference.
17. As a companion-app developer, I want `customSettingsData` events that fire when the Band reports its settings, so that the app receives updates after connection without a manual read call.
18. As a companion-app developer, I want to call `readApneaRemindSettings()` to retrieve the oxygen apnea alert configuration on supported devices.
19. As a companion-app developer, I want to call `setApneaRemindSettings(settings)` to configure the SpO2 apnea threshold and alert enabled flag.
20. As a companion-app developer, I want to call `setSportMode(mode: SportMode)` to activate a named sport type on the Band before a workout, so that the Band applies the correct algorithm for that activity.
21. As a companion-app developer, I want to call `readSportMode()` to retrieve the currently active sport mode on the Band.
22. As a companion-app developer, I want a `sportModeData` event that fires when the Band's sport mode changes (e.g. the user ends a workout on the device side), so that the app knows when to trigger a data sync.
23. As a companion-app developer, I want to call `startBloodAnalysisTest()` / `stopBloodAnalysisTest()` on devices that expose the blood-composition sensor, gated on `readDeviceFunctions()`, so that the app can expose advanced metabolic metrics where hardware supports them.
24. As a companion-app developer, I want `bloodAnalysisTestResult` events with the result model (component values, test state, progress) so that I can render blood-analysis results.
25. As a companion-app developer, I want to call `startPttTest()` / `stopPttTest()` on iOS devices that support the PTT chest-mode electrode, so that HR, HRV, and QT-interval data from PTT can be surfaced.
26. As a companion-app developer, I want `pttTestResult` events (HR, HRV, QT interval, signal quality) from PTT measurements.
27. As a companion-app developer, I want a `pttStateChanged` event that fires when the device enters or exits PTT mode automatically, so that the app can update its UI without polling.
28. As a companion-app developer, I want to call `startGsrTest()` / `stopGsrTest()` on devices with a galvanic skin response sensor, so that stress/arousal data from GSR can be surfaced.
29. As a companion-app developer, I want `gsrTestResult` events with the GSR value and test state.
30. As a companion-app user, I want reminders other than sedentary (hydration, medication, eye strain) to be configurable from the app, so that I don't have to open the Band's companion or factory app to set them.
31. As a companion-app user, I want my workout sessions (runs, walks, gym sessions) to appear in the app with duration, HR, and calorie data, so that I have a full activity log.
32. As a companion-app user, I want to see REM sleep, sleep quality scores, and per-minute sleep-state breakdowns in the app, so that I can understand my sleep quality better than light/deep totals alone.
33. As a companion-app user, I want my body-temperature and blood-glucose historical charts to load past readings from the Band, not just the current test result.
34. As a companion-app user, I want the emergency SOS I trigger on the Band to immediately open the emergency call UI in the app, so that help is not delayed.
35. As a companion-app user, I want the app to display temperatures and glucose values in my preferred unit, matching what I see on other health apps.

---

## Implementation Decisions

### Module boundaries

- **Feature group 1 (health reminders)** replaces / supersedes the existing `readSedentaryReminder` / `setSedentaryReminder` API. The existing sedentary methods remain for backwards compatibility but the new multi-type methods (`readHealthReminder(type)` / `setHealthReminder(reminder)`) will become the recommended path. A `HealthReminderType` union type covers all 8 reminder categories.
- **Feature group 2 (exercise sessions)** introduces `startReadExerciseData()` and streaming `exerciseSessionData` events — analogous to `startReadOriginData()` / `originFiveMinuteData`. No DB or file I/O in the JS layer; all persistence is in the vendor SDK's internal DB.
- **Feature group 3 (accurate sleep)** introduces `readAccurateSleepData(date?)` and `accurateSleepData` events. The existing `readSleepData` is not deprecated. Accurate sleep requires `peripheralModel.supportAccurateSleep` (iOS) / `VpSpGetUtil.isSupportAccurateSleep` (Android) capability check.
- **Feature group 4 (offline vitals)** introduces five new read methods (`readStoredTemperatureData`, `readStoredBloodGlucoseData`, `readStoredHrvData`, `readStoredEcgData`, `readStoredBodyCompositionData`) and five corresponding streaming events. Payloads reuse or extend existing result types (e.g. `TemperatureTestResult`, `BloodGlucoseTestResult`) with a `timestamp` field to distinguish stored records from live test results.
- **Feature group 5 (SOS event)** adds a single new event `deviceSosTriggered` with payload `{ deviceId: string }`. No methods required.
- **Feature group 6 (custom settings)** introduces `readCustomSettings()` / `writeCustomSettings(settings: Partial<CustomSettings>)` and `customSettingsData` event. `CustomSettings` interface: `{ temperatureUnit, bloodGlucoseUnit, skinTone }`. `TemperatureUnit` and `BloodGlucoseUnit` types already exist in `src/types/settings.ts`; `SkinTone` (1–6 integer) is added there. Android uses `CustomSettingData`; iOS uses `VPSettingTemperatureUnit` / `VPSettingBloodGlucoseUnit` base-function toggles.
- **Feature group 7 (oxygen apnea)** introduces `readApneaRemindSettings()` / `setApneaRemindSettings(settings)` and `apneaRemindData` event. iOS: `veepooSDKSettingOxygenApneaRemind`. Android: `CAPABILITY_UNSUPPORTED` until a vendor Android path is confirmed.
- **Feature group 8 (sport mode)** introduces `readSportMode()` / `setSportMode(mode: SportMode)` / `stopSportMode()` and `sportModeData` event. `SportMode` is a string union of the documented modes (outdoor run, indoor run, cycling, swimming, etc.). The full 127+ mode list is enumerated in the `SportMode` type.
- **Feature group 9 (electrode tests)** follows the existing realtime-test mutex pattern (`REALTIME_TEST_IN_PROGRESS` guard). Blood analysis: `startBloodAnalysisTest()` / `stopBloodAnalysisTest()` + `bloodAnalysisTestResult` event. PTT: `startPttTest()` / `stopPttTest()` + `pttTestResult` + `pttStateChanged`. GSR: `startGsrTest()` / `stopGsrTest()` + `gsrTestResult`. All three gated on corresponding `readDeviceFunctions()` package flags.

### Cross-cutting

- All methods added to `NativeVeepooSDK.ts`, `VeepooSDKModule.ts` (interface), and `VeepooSDK.ts` (facade), following the existing domain-split pattern in `src/sdk/`.
- All new event names added to `VeepooEvent` union in `src/types/events.ts`; payload types added to `VeepooEventPayload` map.
- All normalizers co-located in the relevant domain file (`src/normalizers/`).
- Android: new `VeepooSDKModule*.kt` files per feature group, following the established per-feature-file pattern.
- iOS: new `VeepooSDKModule+*.swift` extension files per feature group.
- Parity matrix (`docs/vendor-api/vendor-parity-matrix.md`) updated with new rows after each group ships.

---

## Testing Decisions

Good tests exercise external behaviour (what the module emits given a native callback) rather than internal implementation details (how data is transformed internally).

- **Health reminders normalizer**: unit-test that a raw native `HealthRemind` object with each `HealthReminderType` value normalises to the correct JS payload shape. Prior art: `src/__tests__/normalizers.test.ts`.
- **Custom settings normalizer**: unit-test that Android `CustomSettingData` and iOS base-function toggle payloads both normalise to a `CustomSettings` object with the correct `temperatureUnit` / `bloodGlucoseUnit` / `skinTone` values.
- **Event contract**: add `deviceSosTriggered`, `exerciseSessionData`, `accurateSleepData`, the five stored-vitals events, `healthRemindData`, `customSettingsData`, `apneaRemindData`, `sportModeData`, `bloodAnalysisTestResult`, `pttTestResult`, `pttStateChanged`, `gsrTestResult` to the bridge-contract event registry so `npm run verify:events` catches any naming drift. Prior art: `src/bridge-contract/verify-veepoo-events.ts`.
- **Method registry**: add all new `AsyncFunction` names to the native method registry so `npm run verify:rejection` enforces the rejection contract. Prior art: `src/bridge-contract/async-native-method-registry.ts`.
- **Realtime mutex**: verify that starting any electrode test (`startBloodAnalysisTest`, `startPttTest`, `startGsrTest`) while another realtime test is active rejects with `REALTIME_TEST_IN_PROGRESS`. Prior art: `src/__tests__/session-baseline.test.ts`.

Physical Band verification (all "Device tested: TBD" at merge time; update parity matrix when verified on hardware).

---

## Out of Scope

- Watch face / dial upload, custom photo dials, server marketplace dials — no screen on target Band
- Screen brightness and screen duration settings — no screen on target Band
- Camera remote mode — no screen on target Band
- Weather push — no screen on target Band
- Music control and metadata push — no screen on target Band
- Text alarms (60-byte label alarms) — no screen on target Band
- Custom device name setting — no screen benefit
- Remote / server OTA firmware download (`checkDeviceOTAInfo`, server DFU path) — tracked separately in existing backlog
- AGPS ephemeris transfer and device-initiated live GPS feed — tracked separately in existing backlog
- Advanced Band Bluetooth audio controls (auto-reconnect, routing, pairing clear) — tracked separately in existing backlog
- AI features (speech-to-text, chat response push, image push) — no screen on target Band
- 4G connectivity toggle — not confirmed on target hardware
- Running mode types beyond the 127 documented modes (KAABA direction, QR code, Chinese medicine) — niche, no confirmed hardware support
- Splash screen, market dial, video dial transfer — no screen on target Band

---

## Further Notes

- The `TemperatureUnit` and `BloodGlucoseUnit` types already exist in `src/types/settings.ts`; feature group 6 extends those rather than redefining them.
- Accurate sleep (group 3) gating: both platforms have a capability flag (`peripheralModel.supportAccurateSleep` on iOS; `VpSpGetUtil.isSupportAccurateSleep` on Android). If the flag is absent, `readAccurateSleepData` should reject with `CAPABILITY_UNSUPPORTED` — not return an empty array.
- PTT (group 9) is iOS-only per current vendor SDK; `startPttTest` should reject with `CAPABILITY_UNSUPPORTED` on Android until a vendor Android path is documented.
- Offline vitals (group 4) all read from the vendor SDK's internal SQLite DB — not directly from the Band over BLE. The app must have called `startReadOriginData()` or `readDeviceAllData()` at least once to populate that DB with recent data. This constraint should be documented in the JSDoc of each read method.
- The `onHealthRemindReport` callback (Android) and `deviceInfoDidChangeBlock` (iOS) should both map to the same `healthRemindData` event, not separate events. This mirrors how other settings proactively push updates.
- All nine feature groups should be broken into focused implementation issues (one group = one or more issues), following the existing slice pattern used for PRD #66 (vitals) and PRD #95 (checklist closure).
