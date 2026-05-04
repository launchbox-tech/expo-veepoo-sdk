# types: add RealtimeTestModality union + RealtimeTest constants

**Issue:** #141
**Status:** Open
**Labels:** needs-triage

## Parent

#137

## What to build

Add `RealtimeTestModality` (a union of the 10 non-ECG modality string literals) and `RealtimeTest` (a `const` object mapping uppercase names to those literals, e.g. `RealtimeTest.HEART_RATE`) to the health-tests types file. Re-export both from the package's public types index. No existing code changes — purely additive.

## Acceptance criteria

- [ ] `RealtimeTestModality` is a union type covering all 10 non-ECG modalities: `heartRate`, `bloodPressure`, `bloodOxygen`, `temperature`, `stress`, `bloodGlucose`, `hrv`, `fatigue`, `breathing`, `bodyComposition`
- [ ] `RealtimeTest` is a `const` object with an uppercase key for each modality (e.g. `HEART_RATE`, `BLOOD_PRESSURE`) whose values are the corresponding `RealtimeTestModality` literals
- [ ] `RealtimeTestModality` is derived from `RealtimeTest` via `typeof RealtimeTest[keyof typeof RealtimeTest]` so the const object is the single source of truth
- [ ] Both are exported from the package's public types index alongside the existing health-test result types
- [ ] `tsc` compiles with no errors and all existing tests pass unchanged

## Blocked by

None — can start immediately.
