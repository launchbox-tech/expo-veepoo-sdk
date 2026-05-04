# refactor(device-settings): AlarmSettings sub-class + unit tests

**Issue:** #147
**Status:** Closed
**Labels:** needs-triage, enhancement
**Parent:** #138

## What to build

Create `AlarmSettings` class implementing `AlarmSettingsInterface` in `device-settings/` directory with unit tests.

## Acceptance criteria

- [ ] `AlarmSettings` implements `AlarmSettingsInterface` and accepts `SubsystemRuntime`
- [ ] `readAlarms` emits `alarmData` via `emitLocal`
- [ ] `readHeartRateAlarm` and `setHeartRateAlarm` emit `heartRateAlarmData`
- [ ] Unit tests: happy path, emitLocal spy, INVALID_ARGUMENT for bad alarm id / HR thresholds
- [ ] All existing tests pass

## Blocked by

#144
