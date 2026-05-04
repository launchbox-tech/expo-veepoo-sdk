# feat(example): full SDK coverage — all 59 methods and 56 events reachable from the example app

**Issue:** #154
**Status:** OPEN
**Labels:** enhancement, needs-triage

## Problem Statement

The example app currently exercises only 29 of the SDK's 59 public methods and subscribes to 21 of its 56 events. A developer integrating the SDK into a companion app cannot use the example to validate any of the 30 uncovered methods — alarms, contacts, auto-measure, weather, social messages, direct historical queries, temperature/stress/glucose realtime tests, and system config operations all have zero example coverage. Five existing settings cards expose only read operations; their matching write methods are unreachable. The Band's passive event stream (stored vitals, sleep, exercise sessions, PTT, GSR, SOS triggers) is entirely unsubscribed, so those payloads never appear in the event log.

## Solution

Extend the example app so that every public SDK method has at least one reachable call path and every event is subscribed and surfaced. New UI cards cover the six missing feature groups. Five existing read-only cards gain "Apply" write buttons. The three missing realtime-test modalities are added to the existing health-test section. All remaining passive events are funnelled through a new hook into the existing EventLogCard.

## User Stories

1. As a developer validating alarm functionality, I want an Alarms card in the example that calls `readAlarms`, `setAlarm`, `deleteAlarm`, `readHeartRateAlarm`, and `setHeartRateAlarm`, so that I can confirm all five alarm methods work against a real Band.
2. As a developer validating alarm events, I want the example to subscribe to `alarmData` and `heartRateAlarmData` and show the payload in the UI, so that I can confirm the Band emits these events correctly.
3. As a developer validating contact management, I want a Contacts card that calls `readContacts`, `addContact`, `deleteContact`, and `setContactSosState`, so that I can verify the full contacts CRUD cycle on a real Band.
4. As a developer validating SOS configuration, I want the Contacts card to also call `readSosCallTimes` and `setSosCallTimes`, so that I can confirm SOS timing reads and writes correctly.
5. As a developer validating contacts events, I want the example to subscribe to `contactsData` and `sosCallTimesData`, so that I can see the event payloads in the log.
6. As a developer validating auto-measure, I want an Auto-Measure card that calls `readAutoMeasureSetting` and `modifyAutoMeasureSetting` with a sample interval, so that I can confirm the auto-measure read/write cycle.
7. As a developer validating system configuration, I want a System Config card that calls `setLanguage`, `setDeviceTime`, `readDeviceFunctions`, `checkBluetoothStatus`, and `getConnectionStatus`, so that I can verify each method reaches the Band.
8. As a developer validating weather push, I want a Weather card that calls `readWeatherSettings`, `setWeatherSettings`, and `pushWeatherData`, so that I can confirm weather data reaches the Band's display.
9. As a developer validating social notifications, I want a Social Messages card that calls `readSocialMsgData` and `writeSocialMsgData`, so that I can confirm notification-filter settings round-trip correctly.
10. As a developer validating social message events, I want the example to subscribe to `socialMsgData` and show the payload, so that I can confirm the Band emits the event after a write.
11. As a developer validating the temperature realtime test, I want the health-test section to include a Temperature test card that calls `startTest(RealtimeTest.TEMPERATURE)` / `stopTest(...)` and subscribes to `temperatureTestResult`, so that I can verify temperature measurement on a real Band.
12. As a developer validating the stress realtime test, I want the health-test section to include a Stress test card that calls `startTest(RealtimeTest.STRESS)` / `stopTest(...)` and subscribes to `stressData`, so that I can verify stress measurement.
13. As a developer validating the blood glucose realtime test, I want the health-test section to include a Blood Glucose test card that calls `startTest(RealtimeTest.BLOOD_GLUCOSE)` / `stopTest(...)` and subscribes to `bloodGlucoseData`, so that I can verify glucose measurement.
14. As a developer validating display write operations, I want the ScreenLightCard to expose "Apply brightness" and "Apply duration" buttons that call `setScreenLightSettings` and `setScreenLightDuration` with the last-read values, so that I can confirm write operations reach the Band.
15. As a developer validating watch face writes, I want the WatchFaceCard to expose an "Apply style" button that calls `setWatchFaceStyle` with the last-read values, so that I can confirm the watch face round-trip.
16. As a developer validating wrist-flip writes, I want the WristFlipCard to expose an "Apply" button that calls `setWristFlipWakeSettings` with the last-read values, so that I can confirm the setting persists.
17. As a developer validating sedentary reminder writes, I want the SedentaryCard to expose an "Apply" button that calls `setSedentaryReminder` with the last-read values, so that I can confirm the setting persists.
18. As a developer validating women's health writes, I want the WomenHealthCard to expose an "Apply" button that calls `setWomenHealthSettings` with the last-read values, so that I can confirm the setting persists.
19. As a developer validating direct historical queries, I want a Historical Query card that calls `readDeviceAllData`, `readSleepData`, `readSportStepData`, and `readDaySummaryData` as one-shot reads, so that I can verify the direct-query API independent of the event-based sync flow.
20. As a developer validating firmware DFU, I want the FirmwareDfuCard to subscribe to `firmwareDfuProgress` and display the state and progress fields, so that I can observe firmware update progress during a real DFU operation.
21. As a developer validating firmware DFU initiation, I want the FirmwareDfuCard to expose a dev-only "Start DFU" button that calls `startLocalFirmwareDfu` with a test path, clearly labelled with a "may brick Band" warning, so that I can verify the DFU start call reaches the native layer.
22. As a developer monitoring the Band's passive event stream, I want the example to subscribe to `originFiveMinuteData`, `originHalfHourData`, `originSpo2Data`, `storedTemperatureData`, `storedBloodGlucoseData`, `storedHrvData`, `storedEcgData`, `storedBodyCompositionData`, `accurateSleepData`, and `exerciseSessionData`, and route each payload to the EventLogCard, so that I can observe real stored-data events during a sync.
23. As a developer monitoring platform-specific events, I want the example to subscribe to `pttTestResult`, `pttStateChanged` (iOS), `gsrTestResult` (Android), `deviceSosTriggered` (iOS), and `apneaRemindData` (iOS), and log each payload, so that I can verify these events fire on the correct platform.
24. As a developer monitoring device state changes, I want the example to subscribe to `deviceConnected`, `deviceVersion`, `deviceFunction`, `passwordData`, `deviceBTStateChanged`, `customSettingsData`, `healthRemindData`, and `sportModeData`, and route each to the EventLogCard, so that no SDK event is silently dropped.
25. As a developer checking the example compiles, I want `tsc --noEmit` to pass with zero errors after all additions, so that TypeScript catches any mismatched payloads before a device test.

## Implementation Decisions

### Modules to build or modify

**New hooks:**
- `usePassiveEvents` — subscribes to all remaining events not claimed by any existing hook and pushes timestamped entries to a shared log array. Accepts the SDK instance and a log-append callback. No UI; pure side effects.

**Extend existing hooks:**
- `useHealthTests` — add TEMPERATURE, STRESS, BLOOD_GLUCOSE to the modality map; subscribe to their three result events; derive `resultLine` using the same pattern as the existing eight entries.
- `useDataSync` — unchanged structurally; passive stored-data events go to `usePassiveEvents` instead.

**New cards (components):**
- `AlarmsCard` — five-method alarm group; subscribes to `alarmData` / `heartRateAlarmData` locally.
- `ContactsCard` — six-method contacts + SOS group; subscribes to `contactsData` / `sosCallTimesData` locally.
- `AutoMeasureCard` — two-method read/modify auto-measure.
- `SystemConfigCard` — five-method system config (language, time, BT status, device functions, connection status).
- `WeatherCard` — three-method weather read/set/push.
- `SocialMsgCard` — two-method social message read/write; subscribes to `socialMsgData`.
- `HistoricalQueryCard` — four one-shot historical query methods.

**Extend existing cards:**
- `ScreenLightCard` — add Apply buttons for `setScreenLightSettings` and `setScreenLightDuration` using last-read values.
- `WatchFaceCard` — add Apply button for `setWatchFaceStyle` using last-read values.
- `WristFlipCard` — add Apply button for `setWristFlipWakeSettings`.
- `SedentaryCard` — add Apply button for `setSedentaryReminder`.
- `WomenHealthCard` — add Apply button for `setWomenHealthSettings`.
- `FirmwareDfuCard` — subscribe to `firmwareDfuProgress`; add dev-only DFU trigger button.

**Wiring:**
- `ReadyScreen` — receives new cards as children in the settings and data sections.
- `index.tsx` (app entry) — instantiates `usePassiveEvents` with the shared lab-log append callback; passes new card props through.

### Write-operation UX pattern
All "Apply" write buttons use the last successful read value as the argument, avoiding the need for input forms. This keeps each card self-contained and validates the round-trip (read → display → re-apply → confirm success status) without requiring user data entry.

### Passive event strategy
Events that fire automatically (stored data, SOS trigger, PTT, GSR, health reminders) do not warrant dedicated UI cards — a log entry is sufficient to confirm the event fires. All such events are handled in `usePassiveEvents` and appear in the existing `EventLogCard`, which already has a 48-entry cap.

### Fixed sample data for write operations
New cards that need arguments for write operations (weather data, contact details, alarm timing, etc.) use hardcoded sample values defined as constants at the top of each card file. No user input fields are added — the example is a validation harness, not a full-featured app.

## Testing Decisions

The example app has no automated test suite; correctness is verified by:
1. `tsc --noEmit` — every new prop, event payload type, and SDK call must pass TypeScript's strict checks. This is the primary regression gate.
2. The existing `bun test` suite for the SDK library must continue to pass unchanged — example changes must not touch any `src/` module.
3. Manual smoke-test on a real Band: confirm each new button produces a visible response (status string update, log entry, or event payload rendered).

Good automated tests are not applicable here because all behaviour is UI interaction against a physical device. The TypeScript compiler is the automated correctness check.

## Out of Scope

- Adding automated UI tests or Detox/Maestro tests for the example app.
- Building a real settings form UI (inputs, pickers, validation messages) — hardcoded sample values are sufficient for a validation harness.
- Adding `readOriginData(dayOffset?)` to the Historical Query card — this method returns raw 5-min data arrays that are already covered by the event-based `originFiveMinuteData` flow; adding a one-shot read would duplicate effort.
- Platform-specific build configuration for testing iOS-only or Android-only events — the example runs on both platforms; platform-specific events are subscribed unconditionally and will simply never fire on the other platform.
- Changes to the SDK library (`src/`) — this PRD covers the example app only.

## Further Notes

The gap was discovered during a full audit comparing `VeepooSDKModuleInterface` (59 methods, 56 events) against every `sdk.` reference in the example source. The five read-only cards with missing setters were originally built before the corresponding write methods were implemented in the SDK. The three missing test modalities (temperature, stress, blood glucose) were excluded from the initial `useHealthTests` implementation but the `RealtimeTest` constants for them have existed since PRD #137.
