# Issue #142 — Create OriginReadPipeline with tests

**Status:** Open  
**Labels:** needs-triage  
**Parent:** #140  
**GitHub:** https://github.com/launchbox-tech/expo-veepoo-sdk/issues/142

## What to build

Create an `OriginReadPipeline` class that is the single seam for all `readOriginProgress` decision logic. It absorbs the deduplication state and rules currently split between `OriginReadProgressFilter` and the extraction block in `emitLocal()`.

The pipeline takes the already-normalized `readOriginProgress` payload, extracts `deviceId`, `readState`, and `progress` internally, applies the four deduplication rules, and returns a boolean. It also exposes `clearDevice(deviceId)` for lifecycle reset on disconnect.

Replace the existing `origin-read-progress-filter.test.ts` with a new `origin-read-pipeline.test.ts` that exercises the pipeline through typed payload objects (not raw primitives).

Do not wire the pipeline into `VeepooSDKRuntime` yet — that is #146. Verifiable by running the test suite alone.

## Acceptance criteria

- [ ] `OriginReadPipeline` class exists with public interface: `shouldEmit(payload): boolean` and `clearDevice(deviceId: string): void`
- [ ] Pipeline internally holds per-device last-progress state (no external dependencies on logger, bus, or runtime)
- [ ] Deduplication rules implemented: pass non-finite, reset and pass on `readState === "start"`, suppress equal, pass changed
- [ ] Pass-through case handled: if `payload.progress` is not an object, `shouldEmit` returns `true` and stores no state
- [ ] `origin-read-pipeline.test.ts` covers: first unseen device passes, equal suppresses, increasing passes, decreasing passes, `start` resets then suppresses equal, `clearDevice` resets one device without affecting others, two devices tracked independently, non-finite passes without storing state, pass-through payload passes without storing state
- [ ] All tests pass

## Blocked by

None — can start immediately.
