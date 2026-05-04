# refactor(device-settings): HealthConfig sub-class + unit tests

**Issue:** #149
**Status:** Open
**Labels:** needs-triage, enhancement
**Parent:** #138

## What to build

Create `HealthConfig` class implementing `HealthConfigInterface` in `device-settings/` directory with unit tests.

## Acceptance criteria

- [ ] `HealthConfig` implements `HealthConfigInterface` and accepts `SubsystemRuntime`
- [ ] Unit tests: happy path, modifyAutoMeasureSetting logs preserved, INVALID_ARGUMENT for out-of-range interval, no emitLocal calls in this group
- [ ] All existing tests pass

## Blocked by

#144
