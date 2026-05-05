# 0187 — feat: SpO₂ alarm — native bridge (iOS + Android)

> GitHub: https://github.com/launchbox-tech/expo-veepoo-sdk/issues/187
> Labels: enhancement, needs-triage, ready-for-human
> Status: OPEN

## Parent

#180

## What to build

Wire `readSpo2Alarm` and `setSpo2Alarm` on both platforms. The SpO₂ alarm is a continuous-monitoring threshold alert (distinct from apnea-remind). Requires physical Band for verification.

## Acceptance criteria

- [ ] Android: SpO₂ alarm read and set APIs wired; `spo2AlarmData` native event mapped to `spo2_alarm_data`
- [ ] iOS: SpO₂ alarm read and set APIs wired; corresponding native event mapped
- [ ] `CAPABILITY_UNSUPPORTED` returned on platforms or devices that do not support the SpO₂ alarm
- [ ] Manually verified on physical Band: set threshold to 90%, confirm Band reflects the new setting

## Blocked by

#183
