# refactor(realtime-tests): collapse 20-method interface to startTest/stopTest + modality constants

**Issue:** #137
**Status:** Open
**Labels:** needs-triage

## Problem Statement

The `RealtimeTests` subsystem exposes 22 named methods — 11 start/stop pairs for health-test modalities (heart rate, blood pressure, blood oxygen, temperature, stress, blood glucose, HRV, fatigue, breathing, body composition) plus explicit ECG methods. Every pair follows an identical implementation pattern: log, invoke native, map error. The variation between pairs is three values: a log-action key, a human-readable label, and a native method thunk. Because the pattern is repeated rather than abstracted, the interface has 22 entries when 4 would suffice. Adding a new modality currently requires two new methods on the interface, two on the implementation, and two delegations on the facade — three files touched for one new capability.

The interface surface is the test surface. 20 of the 22 methods have no individual tests because writing the same delegation test 20 times adds no signal; the pattern is either correct for all of them or for none. This leaves the real invariant (start/stop symmetry, error propagation) untestable as a unit — it's only exercised indirectly through the VeepooSDK integration suite.

## Solution

Replace the 20 modality-specific methods with two generic methods — `startTest(modality)` and `stopTest(modality)` — backed by a dispatch table that maps each modality to its native thunks and log label. Expose a `RealtimeTestModality` union type and a `RealtimeTest` constants object so callers retain TypeScript autocomplete (e.g. `sdk.startTest(RealtimeTest.HEART_RATE)`). Keep `startEcgTest(options?)` and `stopEcgTest()` as explicit methods because ECG's optional options parameter does not fit the generic pattern without polluting the dispatch type.

## User Stories

1. As an SDK maintainer, I want a `startTest(modality)` method that accepts any realtime test modality, so that I can start any health test without knowing the per-modality method name.
2. As an SDK maintainer, I want a `stopTest(modality)` method that accepts any realtime test modality, so that I can stop any health test symmetrically with the same modality value I used to start it.
3. As an SDK maintainer, I want a `RealtimeTestModality` union type covering all non-ECG modalities, so that TypeScript rejects an invalid modality string at the call site.
4. As an SDK maintainer, I want a `RealtimeTest` constants object (e.g. `RealtimeTest.HEART_RATE`, `RealtimeTest.BLOOD_PRESSURE`), so that callers can discover available modalities through IDE autocomplete without memorising string literals.
5. As an SDK maintainer, I want `startEcgTest(options?)` and `stopEcgTest()` retained as explicit methods, so that the ECG-specific `includeWaveform` option remains first-class and typed.
6. As an SDK maintainer, I want `RealtimeTestsInterface` to declare only four methods (`startTest`, `stopTest`, `startEcgTest`, `stopEcgTest`), so that adding a new modality never requires an interface change.
7. As an SDK maintainer, I want the start/stop log keys derived from the modality string (e.g. `test.heartRate.start`), so that the log key format is enforced by construction rather than by convention.
8. As an SDK maintainer, I want the dispatch table to be exhaustive over `RealtimeTestModality`, so that a new modality added to the type without a dispatch entry is a compile error.
9. As an SDK maintainer, I want `startTest` and `stopTest` tested against a single representative modality, so that the shared implementation logic (logging, error propagation, native delegation) is covered once at the correct seam.
10. As an SDK maintainer, I want the REALTIME_TEST_IN_PROGRESS error-propagation test rewritten against the generic interface, so that it validates the invariant rather than the specific method name.
11. As an SDK maintainer, I want `RealtimeTestModality` and `RealtimeTest` exported from the package's public types surface, so that consuming apps can use the constants without reaching into SDK internals.
12. As a consuming app developer, I want to call `sdk.startTest(RealtimeTest.HEART_RATE)` instead of `sdk.startHeartRateTest()`, so that my code works uniformly across all modalities and is unaffected when a new modality is added to the Band firmware.
13. As a consuming app developer, I want TypeScript to reject `sdk.startTest('unknown')`, so that a typo in a modality name is caught at compile time.
14. As an SDK maintainer, I want the `VeepooSDK` facade delegations collapsed from 20 arrow-function properties to two (`startTest`, `stopTest`), so that adding a new modality to the facade requires no change.

## Implementation Decisions

### Modules modified

**`RealtimeTestModality` type + `RealtimeTest` constants (new, in types layer)**
A `const` object mapping uppercase constant names to camelCase string literals (e.g. `HEART_RATE: 'heartRate'`), covering all 10 non-ECG modalities. `RealtimeTestModality` is the derived union type. Both are exported from the package's public types index.

**`RealtimeTests` (rewrite)**
Holds an internal dispatch table built in the constructor, mapping each `RealtimeTestModality` to `{ label: string; start: () => Promise<void>; stop: () => Promise<void> }`. A private `runTest(modality, direction)` helper handles logging, native invocation, and error mapping. Public surface: `startTest`, `stopTest`, `startEcgTest`, `stopEcgTest`. The dispatch table type is exhaustive over `RealtimeTestModality` (indexed by `Record<RealtimeTestModality, ...>`), so a missing modality is a compile error.

**`RealtimeTestsInterface` (shrink)**
Remove the 20 named modality methods. Add `startTest(modality: RealtimeTestModality): Promise<void>` and `stopTest(modality: RealtimeTestModality): Promise<void>`. Retain `startEcgTest(options?: EcgTestOptions): Promise<void>` and `stopEcgTest(): Promise<void>` unchanged.

**`VeepooSDK` facade (shrink)**
Remove the 20 individual delegation properties. Add `startTest` and `stopTest` delegations. ECG delegations are unchanged.

**Tests (update)**
Update the five existing realtime-test integration cases to use the new `startTest`/`stopTest` interface with `RealtimeTest` constants. The error-propagation test retains full coverage by operating on `RealtimeTest.HEART_RATE` via `startTest`.

### Design decisions

- ECG is excluded from the generic pattern. Its optional `options` parameter makes a uniform thunk signature impractical without polluting the dispatch type for the 10 modalities that have no options.
- The dispatch table is constructed per-instance in the constructor (not a static map), because the native thunks close over `rt.native` which is instance-specific.
- Log keys are derived as `test.${modality}.${direction}` — the camelCase modality string doubles as the log segment, eliminating a separate key field from the dispatch entry.
- `RealtimeTest` is a value (const object), not an enum, so it survives transpilation to plain JS without runtime overhead and is importable as a type-only import when needed.

## Testing Decisions

A good test exercises observable external behaviour through the public interface, not implementation structure. For `RealtimeTests`, the observable behaviour is: the correct native method is called; errors from native are propagated with the correct code; both start and stop are symmetric.

**`RealtimeTests` is tested through the `VeepooSDK` integration suite** (no isolated unit file exists, consistent with the rest of the subsystems). Prior art: the existing `startHeartRateTest` delegation and error-propagation tests in `VeepooSDK.test.ts`.

Tests to update/add:
- `startTest(RealtimeTest.HEART_RATE) delegates to native` — confirms the dispatch reaches the correct native method
- `startTest(RealtimeTest.HEART_RATE) preserves REALTIME_TEST_IN_PROGRESS from native` — error-propagation invariant
- `stopTest(RealtimeTest.HEART_RATE) delegates to native` — stop-side coverage
- `startTest(RealtimeTest.HRV) delegates to native` — second modality to confirm dispatch table, not just the first entry
- `stopTest(RealtimeTest.FATIGUE) delegates to native` — stop-side on a different modality

All other modalities are covered implicitly by the exhaustive compile-time dispatch table check.

## Out of Scope

- Adding new health-test modalities not currently in the native interface.
- Changing `startEcgTest` / `stopEcgTest` behaviour or options shape.
- Changes to the native bridge contract (`NativeVeepooSDK` interface) — native method names are unchanged.
- Adding a modality for GSR, PTT, or blood analysis tests — those are not currently in `RealtimeTests`.
- Migrating the example app call sites (none exist yet for realtime tests).

## Further Notes

The `RealtimeTest` constant object name mirrors the existing `SPORT_MODE_ORDINALS` pattern in the settings types — a plain const exported alongside its derived union type.
