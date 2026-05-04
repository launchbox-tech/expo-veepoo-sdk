# refactor(device-settings): decompose DeviceSettings into typed sub-interfaces

**Issue:** #138
**Status:** Closed
**Labels:** needs-triage, enhancement

## Problem Statement

`DeviceSettings` is a 552-line god object holding 41 unrelated methods across six distinct capability areas (alarms, display, health configuration, emergency contacts/SOS, media interaction, and system settings). The `DeviceSettingsInterface` mirrors this problem at the type level — a 41-method interface that cannot be narrowed by a caller who only needs alarm management. Because all 41 methods sit in one class and one interface, there are currently zero unit tests for any of them; every test for this code must go through the full `VeepooSDK` integration harness. Applying the deletion test confirms this is a real seam: deleting the class would force 41 invocation patterns to re-emerge across callers, and none of those patterns share an obvious owner.

## Solution

Decompose `DeviceSettings` into six sub-classes, each implementing a narrow interface, and make `DeviceSettingsInterface` a composition of those sub-interfaces — the same pattern already used by `VeepooSDKModuleInterface`. The public flat API of `VeepooSDK` is unchanged; call sites in the example app and external consumers are unaffected. Internally, `VeepooSDK` holds six typed sub-class instances instead of one god object. Each sub-class is independently instantiable with a `SubsystemRuntime`, enabling focused unit tests without a full `VeepooSDK` setup.

## User Stories

1. As an SDK maintainer, I want alarm-related methods (`readAlarms`, `setAlarm`, `deleteAlarm`, `readHeartRateAlarm`, `setHeartRateAlarm`) collected under a single `AlarmSettingsInterface`, so that alarm bugs are isolated to one module and tests exercise only alarm logic.
2. As an SDK maintainer, I want display-related methods (screen light settings, screen light duration, wrist flip wake, watch face style) collected under a single `DisplaySettingsInterface`, so that display bugs are isolated and testable without a full device-settings harness.
3. As an SDK maintainer, I want health-configuration methods (`syncPersonalInfo`, auto-measure, sedentary reminder, women's health) collected under a single `HealthConfigInterface`, so that personal-health config logic is co-located and independently testable.
4. As an SDK maintainer, I want emergency-related methods (contacts, SOS call times) collected under a single `EmergencySettingsInterface`, so that SOS/contact logic is isolated and its event-emission side effects are verifiable in focused tests.
5. As an SDK maintainer, I want media-interaction methods (find-Band, camera mode, music control) collected under a single `MediaInteractionInterface`, so that Band interaction features are co-located and independently testable.
6. As an SDK maintainer, I want system-configuration methods (language, time, GPS/timezone, BT switch/status, weather, firmware DFU) collected under a single `SystemSettingsInterface`, so that low-level device config is isolated and testable.
7. As an SDK maintainer, I want `DeviceSettingsInterface` to extend all six sub-interfaces (the same composition pattern as `VeepooSDKModuleInterface`), so that the decomposition is visible in the type system without changing any public call site.
8. As an SDK maintainer, I want each sub-class to accept only a `SubsystemRuntime`, so that a unit test can create `new AlarmSettings(mockRuntime)` without constructing a full `VeepooSDK` instance.
9. As an SDK maintainer, I want unit tests for each of the six sub-classes, so that a bug in alarm validation is caught without running the full integration suite.
10. As an SDK maintainer, I want tests to verify that each method that calls `emitLocal` (e.g. `readAlarms`, `readHeartRateAlarm`, `readContacts`, `readSosCallTimes`) fires the correct event with the correct payload, so that event-emission regressions surface at the sub-class seam rather than through end-to-end tests.
11. As an SDK maintainer, I want tests to verify that each method with a validator rejects invalid inputs with an `INVALID_ARGUMENT` error, so that validation gaps are caught at the sub-class level.
12. As an SDK maintainer, I want the existing `VeepooSDK` integration tests to continue passing unchanged, so that the refactor is provably non-breaking.
13. As an SDK consumer (example app), I want the flat public API (`sdk.readAlarms()`, `sdk.setAlarm()`, etc.) unchanged, so that no call site in the example app requires modification.
14. As a TypeScript consumer, I want to be able to declare a dependency on `AlarmSettingsInterface` rather than the full `DeviceSettingsInterface`, so that a component that only manages alarms does not carry a compile-time dependency on DFU or camera mode.

## Implementation Decisions

### Modules built or modified

**Six sub-classes (new), housed under a `device-settings/` directory:**

- `AlarmSettings` — implements `AlarmSettingsInterface`: `readAlarms`, `setAlarm`, `deleteAlarm`, `readHeartRateAlarm`, `setHeartRateAlarm`.
- `DisplaySettings` — implements `DisplaySettingsInterface`: `readScreenLightSettings`, `setScreenLightSettings`, `readScreenLightDuration`, `setScreenLightDuration`, `readWristFlipWakeSettings`, `setWristFlipWakeSettings`, `readWatchFaceStyle`, `setWatchFaceStyle`.
- `HealthConfig` — implements `HealthConfigInterface`: `syncPersonalInfo`, `readAutoMeasureSetting`, `modifyAutoMeasureSetting`, `readSedentaryReminder`, `setSedentaryReminder`, `readWomenHealthSettings`, `setWomenHealthSettings`.
- `EmergencySettings` — implements `EmergencySettingsInterface`: `readContacts`, `addContact`, `deleteContact`, `setContactSosState`, `readSosCallTimes`, `setSosCallTimes`.
- `MediaInteraction` — implements `MediaInteractionInterface`: `startFindDevice`, `stopFindDevice`, `enterCameraMode`, `exitCameraMode`, `setMusicControlEnabled`, `pushMusicData`.
- `SystemSettings` — implements `SystemSettingsInterface`: `setLanguage`, `setDeviceTime`, `setDeviceGPSAndTimezone`, `readDeviceBTStatus`, `setDeviceBTSwitch`, `readWeatherSettings`, `setWeatherSettings`, `pushWeatherData`, `startLocalFirmwareDfu`.

Each sub-class constructor takes exactly `SubsystemRuntime` — the same minimal runtime interface already used by all other subsystems.

**`subsystem-interfaces.ts` (modify)**
Add six new sub-interfaces. `DeviceSettingsInterface` becomes a composition: it `extends` all six sub-interfaces. No method moves or is renamed; the interface body becomes empty (the methods are inherited). `VeepooSDKModule` is unchanged — it still extends `DeviceSettingsInterface`.

**`VeepooSDK` (modify — internals only)**
Replace the single `private readonly deviceSettings: DeviceSettings` field with six typed sub-class fields (one per sub-interface group). Update the constructor accordingly. Re-route each of the 41 delegation methods to the correct sub-instance. The public method signatures are identical; no change to `VeepooSDKModuleInterface`.

**Old `DeviceSettings` class (delete)**
The god object is removed entirely. The deletion test passes: no complexity re-emerges in callers; it concentrates into six independently named modules.

### Key invariants preserved

- `invokeNative` call shape is identical across all sub-classes (validate → invoke → normalize → map rejection).
- Methods that call `emitLocal` (alarms, heart-rate alarm, contacts, SOS call times) retain that side effect in the new sub-class.
- The `startLocalFirmwareDfu` warning comment ("can brick a Band if misused") carries over to `SystemSettings`.

## Testing Decisions

**What makes a good test here:** test through the sub-class's public interface (`AlarmSettings`, `DisplaySettings`, etc.) using a mock native and a real `VeepooSDKRuntime`. Do not test normalizer internals (covered by `normalizers.test.ts`) or validator internals (covered by `validators.test.ts`). Test that the right native method was called, that `emitLocal` fired where expected, and that invalid input throws `INVALID_ARGUMENT`.

**Prior art:** `src/__tests__/VeepooSDK.test.ts` for integration patterns; `src/__tests__/helpers/mock-native.ts` for the `makeMockNative` factory; `src/__tests__/event-bus.test.ts` for how to spy on runtime side effects.

**Modules with tests:**

- `AlarmSettings` — happy path for each method; `emitLocal` spy for `readAlarms` and `readHeartRateAlarm`; `INVALID_ARGUMENT` validation for `setAlarm` (bad id), `deleteAlarm` (bad id), `setHeartRateAlarm` (bad thresholds).
- `DisplaySettings` — happy path for each method; `INVALID_ARGUMENT` for `setScreenLightDuration(0)` and `setScreenLightDuration(601)`; normalization shape check for `readWatchFaceStyle`.
- `HealthConfig` — happy path for each method; `emitLocal` not expected (no event emissions in this group); `INVALID_ARGUMENT` for `modifyAutoMeasureSetting` with out-of-range interval.
- `EmergencySettings` — happy path for each method; `emitLocal` spy for `readContacts` and `readSosCallTimes`; `INVALID_ARGUMENT` for `deleteContact(-1)` and `setSosCallTimes(0)`.
- `MediaInteraction` — happy path for each method; `INVALID_ARGUMENT` for `pushMusicData` with empty name/artist.
- `SystemSettings` — happy path for each method; `setDeviceTime` decomposition check (native receives year/month/day/hour/minute/second object); `INVALID_ARGUMENT` for `startLocalFirmwareDfu('')`.

**Regression check:** existing `VeepooSDK.test.ts` must pass without modification.

## Out of Scope

- Changing the public API surface of `VeepooSDK` (no `sdk.alarms.readAlarms()` grouping at the public level — the flat facade is kept as-is per ADR 0001 naming/speed rationale).
- Splitting `HealthData` or `RealtimeTests` — those are separate candidates not selected in this iteration.
- Adding integration tests for the new sub-classes (unit tests against `SubsystemRuntime` are sufficient; integration coverage already exists in `VeepooSDK.test.ts`).
- Updating the example app.

## Further Notes

This refactor mirrors the decomposition already applied to `VeepooSDKModuleInterface` in issue #136 (per-subsystem interfaces). The same composition pattern now reaches one level deeper into `DeviceSettingsInterface`. Once merged, the `DeviceSettings` directory becomes the natural home for any future Band configuration capability, each landing in the correct sub-class without bloating a god object.
