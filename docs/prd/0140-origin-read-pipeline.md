# PRD #140 — Extract OriginReadPipeline: concentrate readOriginProgress flow into one seam

**Status:** Closed  
**Labels:** needs-triage  
**GitHub:** https://github.com/launchbox-tech/expo-veepoo-sdk/issues/140

## Problem Statement

The `readOriginProgress` event processing path has no single owner. A raw native event arrives, passes through `emitLocal()` in `VeepooSDKRuntime`, which manually extracts `deviceId`, `readState`, and `progress` from the normalized payload — then hands those primitives to `OriginReadProgressFilter.shouldEmit()` — then falls through to `EventBus.emit()`. Three modules, one logical pipeline, no clear seam.

The deletion test confirms the problem: deleting `OriginReadProgressFilter` does not concentrate complexity — the deduplication logic must be copied into `emitLocal()`, re-scattering it. If origin-read filtering breaks, there is no single file to open and no single test file that covers the full flow.

The extraction block in `emitLocal()` (currently ~14 lines) is tightly coupled to the internal shape of the normalized payload. It uses runtime-private helpers (`isEventRecord`, `getPayloadDeviceId`) and raw casts to pull out fields that belong conceptually to the filter's domain.

## Solution

Extract an `OriginReadPipeline` module that is the single seam for the `readOriginProgress` decision. It takes the already-normalized payload, extracts `deviceId`, `readState`, and `progress` internally, applies the deduplication rule, and returns a boolean. `emitLocal()` replaces its 14-line extraction block with a single pipeline call.

`OriginReadProgressFilter` is absorbed into the pipeline and deleted as a standalone module. Its deduplication state and logic live inside the pipeline's implementation, not behind a separately-testable class.

`emitLocal()` remains the lifecycle coordinator: it still calls `pipeline.clearDevice(deviceId)` when `deviceDisconnected` fires. Normalization (`normalizeEventPayload`) stays in `emitLocal()` as it does for every other event — the pipeline receives the already-normalized payload.

## User Stories

1. As a developer debugging a duplicate `readOriginProgress` event, I want all origin-read filtering logic in one module, so that I know exactly which file to open and which test to run.
2. As a developer writing a test for the origin-read flow, I want a single `OriginReadPipeline.shouldEmit(payload)` interface, so that I can cover normalization, extraction, and deduplication in one test file.
3. As a developer reading `emitLocal()`, I want the `readOriginProgress` branch to be a single pipeline call, so that I can understand the event flow without tracing across three modules.
4. As a developer adding a new filtering rule to `readOriginProgress`, I want the rule implemented in `OriginReadPipeline`, so that I only edit one file and one test file.
5. As a developer onboarding to the codebase, I want `OriginReadPipeline` to be the authoritative module for origin-read filtering, so that searching for "origin read" leads me to one place.
6. As a developer handling a `deviceDisconnected` event, I want `emitLocal()` to call `pipeline.clearDevice(deviceId)` as before, so that per-device deduplication state is reset on disconnect.
7. As a developer running the test suite, I want the pipeline tests to exercise `shouldEmit` through typed payload objects (not primitive arguments), so that tests are aligned with the actual call site.
8. As a developer, I want the pipeline to handle the pass-through case (payload whose `progress` field is not a well-formed record) gracefully by passing the event through, so that no events are lost when normalization falls back to a pass-through.
9. As a developer, I want `OriginReadProgressFilter` deleted as a standalone exported class, so that there is no ambiguity about which module owns origin-read state.
10. As a developer searching for tests of the deduplication rules, I want a single `origin-read-pipeline.test.ts` file, so that I don't need to look in two test files.

## Implementation Decisions

- **New module: `OriginReadPipeline`** — owns payload extraction and deduplication. Public interface: `shouldEmit(payload: VeepooEventPayload["readOriginProgress"]): boolean` and `clearDevice(deviceId: string): void`. Internally holds a `Map<string, number>` of last-seen progress per device.
- **Absorbed: `OriginReadProgressFilter`** — the filter's deduplication state and all four rules (pass non-finite, reset on `start`, suppress equal, pass changed) move into `OriginReadPipeline`'s implementation. The filter class is deleted.
- **Modified: `VeepooSDKRuntime.emitLocal()`** — the `readOriginProgress` extraction block (~14 lines, including `isEventRecord` guards, `getPayloadDeviceId`, raw casts) is replaced by a single `this.originReadPipeline.shouldEmit(normalizedPayload)` call. The `clearDevice` call on `deviceDisconnected` is updated to reference the pipeline.
- **Naming**: the runtime field is renamed from `originProgressFilter` to `originReadPipeline`.
- **Payload shape handling**: the pipeline must handle the normalization pass-through case (when the raw payload was not a record, `normalizeReadOriginProgressPayload` returns it as-is). If `payload.progress` is not an object, the pipeline passes the event through (`shouldEmit` returns `true`) without storing state.
- **Normalization stays in `emitLocal()`**: `normalizeEventPayload` is called before the pipeline, as it is for all events. The pipeline receives the already-normalized payload.
- **Lifecycle coordination stays in `emitLocal()`**: `emitLocal()` remains responsible for calling `pipeline.clearDevice(deviceId)` on `deviceDisconnected`. The pipeline does not subscribe to events itself.
- **No changes to `EventBus`**, `normalizeReadOriginProgressPayload`, or any other event's handling in `emitLocal()`.

## Testing Decisions

- **Good tests exercise external behaviour only**: tests should call `pipeline.shouldEmit(payload)` with full payload objects, not internal methods or state directly. Tests must not inspect the internal `Map`.
- **The pipeline is the test surface**: `OriginReadPipeline` replaces `OriginReadProgressFilter` as the unit under test. The test file is renamed from `origin-read-progress-filter.test.ts` to `origin-read-pipeline.test.ts`.
- **Coverage required** (expressed through payload objects):
  - First event for an unseen device → passes
  - Second event with equal progress → suppressed
  - Increasing progress → passes
  - Decreasing progress → passes
  - `readState === "start"` with same progress as previous → passes and resets so the next equal value is suppressed
  - `clearDevice()` resets state so next equal value passes; other devices are unaffected
  - Two devices tracked independently
  - Non-finite progress value → passes, no state stored (subsequent finite value is a fresh first occurrence)
  - Pass-through payload (progress field is not an object) → passes, no state stored
- **Prior art**: the existing `origin-read-progress-filter.test.ts` covers the same deduplication rules at the primitive level — adapt them to payload-level inputs.

## Out of Scope

- Changes to `EventBus` (its interface and implementation are unaffected)
- Changes to `normalizeReadOriginProgressPayload` or the normalizer layer
- Changes to any other event's handling in `emitLocal()`
- Changes to device lifecycle management beyond renaming the pipeline field

## Further Notes

This refactor was identified during an architecture review as candidate #4 — "Progress filter scattered across three modules — no single seam owns the flow." The grilling session settled on Option C: the pipeline takes the already-normalized payload (normalization stays in `emitLocal()`) and returns a boolean. Logging and `bus.emit()` remain in `emitLocal()`, keeping the pipeline pure (no external dependencies on logger or bus).
