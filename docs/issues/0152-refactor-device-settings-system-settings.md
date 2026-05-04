# refactor(device-settings): SystemSettings sub-class + unit tests

**Issue:** #152
**Status:** Closed
**Labels:** needs-triage, enhancement
**Parent:** #138

## What to build

Create `SystemSettings` class implementing `SystemSettingsInterface` in `device-settings/` directory with unit tests.

## Acceptance criteria

- [ ] `SystemSettings` implements `SystemSettingsInterface` and accepts `SubsystemRuntime`
- [ ] Unit tests: happy path, setDeviceTime decomposed object (1-based month), setDeviceTime() undefined passthrough, INVALID_ARGUMENT for startLocalFirmwareDfu(''), filePath trimmed
- [ ] All existing tests pass

## Blocked by

#144
