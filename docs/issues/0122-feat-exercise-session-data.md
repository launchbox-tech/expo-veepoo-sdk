# 0122 — feat: exercise session data

> GitHub: https://github.com/launchbox-tech/expo-veepoo-sdk/issues/122
> Labels: needs-triage
> Status: open

## Parent

#118

## What to build

Sync stored sport/running sessions from the Band to the app. Sessions are stored per-workout with metadata (sport type, begin/end timestamps, totals) and per-minute arrays (HR, distance, calories, pace).

Introduce `startReadExerciseData()` (triggers sync from Band → vendor SDK DB) and streaming `exerciseSessionData` events. Follows the same pipeline as `startReadOriginData()` / `originFiveMinuteData`.

## Acceptance criteria

- [ ] `SportMode` string union covers the documented modes (outdoorRun, indoorRun, cycling, swimming, and the full set from `VPDeviceRuningMode`)
- [ ] `ExerciseMinuteData` interface: `{ heartRate, distance, calories, steps, sportValue, isPaused }`
- [ ] `ExerciseSession` interface: `{ type: SportMode, beginTime, endTime, totalSteps, totalDistance, totalCalories, totalTime, averageHeartRate, averagePace, pauseCount, pauseTotalTime, minuteData: ExerciseMinuteData[] }`
- [ ] `startReadExerciseData()` triggers Band → SDK DB sync; returns void; rejects `CAPABILITY_UNSUPPORTED` when unsupported
- [ ] `exerciseSessionData` event emitted for each session as sync progresses
- [ ] iOS: `veepooSDKStartReadDeviceRunningData` wired for sync; session array normalised and emitted
- [ ] Android: equivalent sport-data read path wired
- [ ] Normalizer unit-tested: raw vendor dict/object normalises to `ExerciseSession` shape
- [ ] Method + event added to bridge-contract registries
- [ ] Parity matrix row added under "Historical & periodic data"

## Blocked by

None — can start immediately
