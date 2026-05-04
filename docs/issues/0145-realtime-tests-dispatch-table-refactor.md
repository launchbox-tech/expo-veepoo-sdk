# refactor(realtime-tests): dispatch table + shrink interface to startTest/stopTest

**Issue:** #145
**Status:** Open
**Labels:** needs-triage

## Parent

#137

## What to build

Replace the 20 named start/stop methods in `RealtimeTests` with a constructor-built dispatch table and a single `runTest(modality, direction)` helper. Shrink `RealtimeTestsInterface` from 22 methods to 4 (`startTest`, `stopTest`, `startEcgTest`, `stopEcgTest`). Collapse the 20 delegation properties in `VeepooSDK` to 2. Update the five existing realtime-test integration cases to use `startTest(RealtimeTest.HEART_RATE)` / `stopTest(...)` etc. Migrate the 14 named-method call sites in the example app's `useHealthTests` hook to the new generic interface. ECG methods are untouched throughout.

## Acceptance criteria

- [ ] `RealtimeTests` constructor builds a dispatch table typed as `Record<RealtimeTestModality, { label: string; start: () => Promise<void>; stop: () => Promise<void> }>` — exhaustive over all 10 modalities, so a missing entry is a compile error
- [ ] Log keys are derived as `` `test.${modality}.${direction}` `` — no separate key field in the dispatch entry
- [ ] `RealtimeTestsInterface` declares exactly 4 methods: `startTest(modality: RealtimeTestModality)`, `stopTest(modality: RealtimeTestModality)`, `startEcgTest(options?: EcgTestOptions)`, `stopEcgTest()`
- [ ] `VeepooSDK` facade has exactly 2 realtime-test delegation properties (`startTest`, `stopTest`) plus the unchanged ECG delegations
- [ ] Five existing realtime-test tests updated: `startTest(RealtimeTest.HEART_RATE) delegates to native`, `startTest(RealtimeTest.HEART_RATE) preserves REALTIME_TEST_IN_PROGRESS`, `stopTest(RealtimeTest.HEART_RATE) delegates to native`, `startTest(RealtimeTest.HRV) delegates to native`, `stopTest(RealtimeTest.FATIGUE) delegates to native`
- [ ] Example app `useHealthTests` hook migrated: all 14 named-method calls replaced with `startTest(RealtimeTest.X)` / `stopTest(RealtimeTest.X)` using the appropriate modality constant
- [ ] `tsc` compiles with no errors and all tests pass

## Blocked by

- #141
