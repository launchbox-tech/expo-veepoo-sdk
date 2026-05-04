# refactor(device-settings): MediaInteraction sub-class + unit tests

**Issue:** #151
**Status:** Closed
**Labels:** needs-triage, enhancement
**Parent:** #138

## What to build

Create `MediaInteraction` class implementing `MediaInteractionInterface` in `device-settings/` directory with unit tests.

## Acceptance criteria

- [ ] `MediaInteraction` implements `MediaInteractionInterface` and accepts `SubsystemRuntime`
- [ ] Unit tests: happy path, INVALID_ARGUMENT for pushMusicData with empty name/artist, no emitLocal calls
- [ ] All existing tests pass

## Blocked by

#144
