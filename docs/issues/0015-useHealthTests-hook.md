# Issue #15: example: extract useHealthTests hook

> GitHub: https://github.com/launchbox-tech/expo-veepoo-sdk/issues/15
> Status: closed | Labels: enhancement

## Parent

[refactor(example): extract custom hooks per SDK lifecycle phase](https://github.com/gaozh1024/expo-veepoo-sdk/issues/1)

## What to build

Move health test state and handlers into `hooks/useHealthTests.ts`. The hook owns `hrResult`, `bpResult`, `spo2Result`, and `activeTest`. Uses `useSDKEvent` for `heartRateTestResult`, `bloodPressureTestResult`, and `bloodOxygenTestResult` — all guarded by `appState === 'ready'`. Exposes `startHR`, `stopHR`, `startBP`, `stopBP`, `startSpo2`, `stopSpo2`.

The main component removes its 4 health test useState calls, the health test useEffect block, and all 6 start/stop useCallback handlers.

## Acceptance criteria

- [ ] `hooks/useHealthTests.ts` exists; owns 4 state variables; uses `useSDKEvent` for all 3 events
- [ ] Health test useEffect block removed from main component
- [ ] All 6 health test useCallback handlers removed from main component
- [ ] HR, BP, and SpO₂ tests work end-to-end: start → progress → result displayed → auto-stop on completion
- [ ] Only one test can be active at a time (activeTest guard still enforced)
- [ ] `tsc --noEmit` passes with zero errors

## Blocked by

- [#14](https://github.com/launchbox-tech/expo-veepoo-sdk/issues/14)
