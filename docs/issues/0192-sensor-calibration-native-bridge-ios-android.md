# 0192 — feat: sensor calibration — native bridge (iOS + Android)

> GitHub: https://github.com/launchbox-tech/expo-veepoo-sdk/issues/192
> Labels: enhancement, needs-triage, ready-for-human
> Status: OPEN

## Parent

#180

## What to build

Wire `calibrateBloodPressure`, `calibrateBloodGlucose`, and `setBloodGlucoseRiskLevel` on both platforms. These are one-shot write calls — no async event response on most paths. Requires physical Band for verification.

## Acceptance criteria

- [ ] Android: BP calibration, blood glucose single-point calibration, and risk-level APIs wired via vendor Android SDK
- [ ] iOS: equivalent calibration APIs wired via vendor iOS SDK
- [ ] All three methods return `OperationStatus` ('success' / 'fail'); native rejection maps to `OPERATION_FAILED`
- [ ] `CAPABILITY_UNSUPPORTED` returned when the corresponding device capability flag is absent on either platform
- [ ] Manually verified on physical Band: calibrate BP, confirm Band applies offset to subsequent readings

## Blocked by

#184
