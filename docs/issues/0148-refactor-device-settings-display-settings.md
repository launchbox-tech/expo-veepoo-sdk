# refactor(device-settings): DisplaySettings sub-class + unit tests

**Issue:** #148
**Status:** Open
**Labels:** needs-triage, enhancement
**Parent:** #138

## What to build

Create `DisplaySettings` class implementing `DisplaySettingsInterface` in `device-settings/` directory with unit tests.

## Acceptance criteria

- [ ] `DisplaySettings` implements `DisplaySettingsInterface` and accepts `SubsystemRuntime`
- [ ] Unit tests: happy path, INVALID_ARGUMENT for setScreenLightDuration(0)/(601), WatchFaceStyle normalization shape, dialType default behaviour
- [ ] All existing tests pass

## Blocked by

#144
