# feat(example): usePassiveEvents hook — subscribe all remaining 22 events to EventLog

**Issue:** #165
**Status:** Closed
**Labels:** enhancement, ready-for-agent
**Parent:** #154

## What to build

New `usePassiveEvents` hook that subscribes to every SDK event not claimed by existing hooks and routes each payload as a timestamped entry to `EventLogCard` via a shared `appendLog` callback.

## Acceptance criteria

- [ ] Hook subscribes to all remaining events: `originFiveMinuteData`, `originHalfHourData`, `originSpo2Data`, `storedTemperatureData`, `storedBloodGlucoseData`, `storedHrvData`, `storedEcgData`, `storedBodyCompositionData`, `accurateSleepData`, `exerciseSessionData`, `pttTestResult`, `pttStateChanged`, `gsrTestResult`, `deviceVersion`, `deviceFunction`, `passwordData`, `deviceBTStateChanged`, `deviceSosTriggered`, `customSettingsData`, `healthRemindData`, `apneaRemindData`, `sportModeData`, `deviceConnected`
- [ ] Each event routes its payload to `appendLog` as a timestamped entry
- [ ] Hook is consumed in `ReadyScreen` alongside `useHealthTests`
