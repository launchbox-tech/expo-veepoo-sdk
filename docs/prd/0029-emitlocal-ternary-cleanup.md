# PRD: refactor(sdk): eliminate emitLocal nested ternary chain

> GitHub: https://github.com/launchbox-tech/expo-veepoo-sdk/issues/29
> Status: closed | Labels: enhancement

## Problem Statement

The `emitLocal()` private method in `VeepooSDK.ts` (lines 255–315) contains a 17-case nested ternary expression — approximately 60 lines of deeply-indented conditional branching — that maps event names to their normalizer functions. The exported `normalizeEventPayload` function (lines 56–104), introduced in the TDD refactor (issue #22), implements the same mapping as a clean switch statement. Both now coexist in the same file, duplicating normalization logic: any new event normalizer must be registered in two places, and the ternary chain provides no test seam of its own.

## Solution

Replace the entire `const normalizedPayload = event === "bluetoothStateChanged" ? ... : payload` block in `emitLocal()` with a single delegating call:

```ts
const normalizedPayload = normalizeEventPayload(event, payload);
```

`normalizeEventPayload` is defined in the same file and already covers all 17 normalization cases. No import changes are required. The remainder of `emitLocal()` (progress deduplication, logging, state mutation, listener dispatch) is unchanged.

## User Stories

1. As an SDK maintainer adding a new event normalizer, I add it in one place only — the `normalizeEventPayload` switch — so the ternary chain in `emitLocal` no longer needs a parallel update.
2. As a code reviewer, I can read `emitLocal`'s normalization step in one line (`normalizeEventPayload(event, payload)`) instead of decoding 60 lines of nested ternary.
3. As an SDK maintainer, I can verify normalization correctness through direct unit tests on `normalizeEventPayload` covering all 17 cases, giving me confidence the refactor is behavior-preserving.

## Implementation Decisions

### Modules

**`src/VeepooSDK.ts` (modified)**

In `emitLocal()`, delete lines 257–315 (the `const normalizedPayload = ...` ternary block) and replace with:

```ts
const normalizedPayload = normalizeEventPayload(event, payload);
```

No other changes to the method or file.

**`src/__tests__/VeepooSDK.test.ts` (new or modified)**

Add direct unit tests for `normalizeEventPayload` covering:
- All 17 normalization cases with realistic payloads (one assertion per event type)
- Pass-through for events not in the switch (`deviceFound`, `deviceConnected`, `deviceReady`, etc.)
- Non-object payload guard: `null`, `42`, `"string"` → returned unchanged

### Architectural decisions

- `normalizeEventPayload` is called from `emitLocal()` in the same file — no cross-module coupling introduced.
- The `isEventRecord()` guard that each ternary arm used is subsumed by `normalizeEventPayload`'s own `typeof payload !== "object" || payload === null` early return, which is semantically equivalent.
- One behavioral nuance: the current `bluetoothStateChanged` and `readOriginProgress` arms do not check `isEventRecord` before calling their normalizer. After the refactor, `normalizeEventPayload`'s object guard applies uniformly. Both `normalizeBluetoothStatus` and `normalizeReadOriginProgressPayload` already accept `unknown` and handle non-object inputs safely, so there is no behavioral regression.

## Testing Decisions

### What makes a good test here

Each test for `normalizeEventPayload` should assert the output shape for a single event type with a realistic input payload, drawn from the shape described in `VeepooEventPayload`. Pass-through tests should confirm the payload is returned unchanged (referential equality for objects, strict equality for primitives).

### Modules with tests

**`normalizeEventPayload`** (direct unit tests in `VeepooSDK.test.ts`)
- `bluetoothStateChanged` → verifies `normalizeBluetoothStatus` output shape
- `readOriginProgress` → verifies fractional progress converted to integer percentage
- `deviceFunction` → verifies `data` and `functions` fields both normalized
- `deviceVersion` → verifies `version` field normalized
- `passwordData` → verifies `data` field normalized
- `socialMsgData` → verifies `data` field normalized
- `originFiveMinuteData` → verifies `data` field normalized (single item extracted from list)
- `originHalfHourData` → verifies `data` field normalized
- `sleepData` → verifies `data` field normalized (single item extracted from list)
- `sportStepData` → verifies `data` field normalized
- `heartRateTestResult` → verifies `result` field normalized
- `bloodPressureTestResult` → verifies `result` field normalized
- `bloodOxygenTestResult` → verifies `result` field normalized
- `temperatureTestResult` → verifies `result` field normalized
- `stressData` → verifies `data` field normalized
- `bloodGlucoseData` → verifies `data` field normalized
- `batteryData` → verifies `data` field normalized
- Pass-through events (`deviceFound`, `deviceConnected`, `deviceReady`, `readOriginComplete`, `error`)
- Non-object guard (`null`, `42`, `"hello"`)

### Prior art

`src/__tests__/normalizers.test.ts` — uses bare Jest imports (no `.js` extension), plain `describe`/`it` blocks. The new tests follow the same conventions.

## Out of Scope

- Changes to `normalizeEventPayload` itself — the switch is correct as-is
- Changes to any normalizer in `src/normalizers.ts`
- Changes to `emitLocal`'s progress deduplication, logging, state mutation, or listener dispatch sections
- Changes to `src/NativeVeepooSDK.ts`, `src/types.ts`, or `src/index.ts`
- Any behavioral changes to public API methods

## Further Notes

This issue is a direct follow-up to issue #22. The TDD refactor created `normalizeEventPayload` with the explicit intent that it would replace the `emitLocal` ternary chain (PRD #22 states: "Replaces the 12-level nested ternary in `emitLocal()`"), but the implementation left both in place. This issue completes that intent.
