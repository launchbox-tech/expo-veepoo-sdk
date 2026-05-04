# refactor(device-settings): EmergencySettings sub-class + unit tests

**Issue:** #150
**Status:** Open
**Labels:** needs-triage, enhancement
**Parent:** #138

## What to build

Create `EmergencySettings` class implementing `EmergencySettingsInterface` in `device-settings/` directory with unit tests.

## Acceptance criteria

- [ ] `EmergencySettings` implements `EmergencySettingsInterface` and accepts `SubsystemRuntime`
- [ ] `readContacts` emits `contactsData`, `readSosCallTimes` emits `sosCallTimesData`
- [ ] Unit tests: happy path, emitLocal spy, INVALID_ARGUMENT for deleteContact(-1) / setSosCallTimes(0)
- [ ] All existing tests pass

## Blocked by

#144
