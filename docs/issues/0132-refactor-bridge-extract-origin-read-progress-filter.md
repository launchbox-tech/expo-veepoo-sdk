# refactor(bridge): extract OriginReadProgressFilter from emitLocal

**Issue:** #132
**Status:** Open
**Labels:** needs-triage
**Parent:** #130

## What to build

Extract the `readOriginProgress` deduplication logic currently embedded in `VeepooSDKRuntime.emitLocal` (lines 186–210) into a standalone pure module named `OriginReadProgressFilter`. The module holds a per-device `lastProgress` map and exposes a `shouldEmit(deviceId, readState, progress)` method. Replace the inline block in `emitLocal` with a single call to this method. Add unit tests covering the four deduplication rules.

## Acceptance criteria

- [ ] `OriginReadProgressFilter` module exists with a `shouldEmit(deviceId, readState, progress): boolean` interface
- [ ] The inline deduplication block in `emitLocal` is replaced by a call to `OriginReadProgressFilter.shouldEmit`
- [ ] Unit test: equal progress value is suppressed (returns `false`)
- [ ] Unit test: decreasing progress value passes (returns `true`)
- [ ] Unit test: `readState === "start"` resets the stored progress and passes
- [ ] Unit test: increasing progress value passes (returns `true`)
- [ ] All existing tests pass unchanged

## Blocked by

None — can start immediately
