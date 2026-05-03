# 0127 — feat: blood analysis test

> GitHub: https://github.com/launchbox-tech/expo-veepoo-sdk/issues/127
> Labels: needs-triage
> Status: open

## Parent

#118

## What to build

Bridge the blood-composition (blood analysis) manual realtime test. Follows the same start/stop + event pattern as existing realtime tests. Gated on device capability flag. Participates in the realtime-test mutex (rejects with `REALTIME_TEST_IN_PROGRESS` if another test is active).

## Acceptance criteria

- [ ] `BloodAnalysisTestResult` interface: `{ state: TestState; progress: number; values: Record<string, number> | null }`
- [ ] `startBloodAnalysisTest()` starts the test; rejects `CAPABILITY_UNSUPPORTED` when flag absent; rejects `REALTIME_TEST_IN_PROGRESS` if another test is running
- [ ] `stopBloodAnalysisTest()` stops the test; resolves void
- [ ] `bloodAnalysisTestResult` event emitted on each state/progress/result update
- [ ] Realtime mutex tested: starting blood analysis while another test is active rejects with `REALTIME_TEST_IN_PROGRESS`
- [ ] iOS: `veepooSDKTestBloodAnalysisStart` wired with `isPersonalModel: false`; result and progress blocks map to `bloodAnalysisTestResult` events
- [ ] Android: blood-analysis detect API wired and gated
- [ ] Normalizer unit-tested: `VPBloodAnalysisResultModel` normalises to `BloodAnalysisTestResult`
- [ ] Methods + event added to bridge-contract registries
- [ ] Parity matrix row added under "Real-time health tests"

## Blocked by

None — can start immediately
