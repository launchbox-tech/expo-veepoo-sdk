# Issue #146 — Wire OriginReadPipeline into runtime, delete OriginReadProgressFilter

**Status:** Closed  
**Labels:** needs-triage  
**Parent:** #140  
**GitHub:** https://github.com/launchbox-tech/expo-veepoo-sdk/issues/146

## What to build

Replace `VeepooSDKRuntime`'s use of `OriginReadProgressFilter` with the new `OriginReadPipeline`. The 14-line `readOriginProgress` extraction block in `emitLocal()` (including `isEventRecord` guards, `getPayloadDeviceId`, raw casts, and the filter call) collapses to a single `this.originReadPipeline.shouldEmit(normalizedPayload)` call. The `clearDevice` call on `deviceDisconnected` is updated to reference the pipeline.

Delete `OriginReadProgressFilter` (class and file) and `origin-read-progress-filter.test.ts` — both are superseded by `OriginReadPipeline` and its tests from #142.

## Acceptance criteria

- [ ] `VeepooSDKRuntime` imports `OriginReadPipeline` instead of `OriginReadProgressFilter`
- [ ] Field renamed from `originProgressFilter` to `originReadPipeline`
- [ ] `emitLocal()`'s `readOriginProgress` branch is a single pipeline call — no inline field extraction
- [ ] `pipeline.clearDevice(deviceId)` called on `deviceDisconnected` (same behaviour, updated reference)
- [ ] `src/bridge/origin-read-progress-filter.ts` deleted
- [ ] `src/__tests__/origin-read-progress-filter.test.ts` deleted
- [ ] Full test suite passes with no regressions

## Blocked by

- #142
