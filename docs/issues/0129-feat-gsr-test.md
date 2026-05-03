# 0129 — feat: GSR test

> GitHub: https://github.com/launchbox-tech/expo-veepoo-sdk/issues/129
> Labels: needs-triage
> Status: open

## Parent

#118

## What to build

Bridge the GSR (Galvanic Skin Response) manual realtime test. Follows the same start/stop + event pattern as existing realtime tests. Gated on device capability flag. Participates in the realtime-test mutex.

## Acceptance criteria

- [ ] `GsrTestResult` interface: `{ state: TestState; progress: number; value: number | null }`
- [ ] `startGsrTest()` starts the test; rejects `CAPABILITY_UNSUPPORTED` when flag absent; rejects `REALTIME_TEST_IN_PROGRESS` if another test is running
- [ ] `stopGsrTest()` stops the test; resolves void
- [ ] `gsrTestResult` event emitted on each state/progress/value update
- [ ] Realtime mutex tested: starting GSR while another test is active rejects with `REALTIME_TEST_IN_PROGRESS`
- [ ] iOS: `veepooSDKTestGSRStart:progress:testResult:` wired
- [ ] Android: method rejects with `CAPABILITY_UNSUPPORTED` if no vendor Android path is documented
- [ ] Normalizer unit-tested
- [ ] Methods + event added to bridge-contract registries
- [ ] Parity matrix row added under "Real-time health tests"

## Blocked by

None — can start immediately
