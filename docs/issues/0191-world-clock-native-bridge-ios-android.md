# 0191 — feat: world clock — native bridge (iOS + Android)

> GitHub: https://github.com/launchbox-tech/expo-veepoo-sdk/issues/191
> Labels: enhancement, needs-triage, ready-for-human
> Status: OPEN

## Parent

#180

## What to build

Wire `readWorldClock` and `setWorldClock` on both platforms. Requires confirming the native event or callback used to return the current world-clock entries on each platform. Requires physical Band for verification.

## Acceptance criteria

- [ ] Android: world clock read and set APIs wired; response decoded into `WorldClockEntry[]`
- [ ] iOS: world clock read and set APIs wired; response decoded into `WorldClockEntry[]`
- [ ] `CAPABILITY_UNSUPPORTED` returned when `device_functions.world_clock !== 'support'`
- [ ] Manually verified on physical Band: set two time zones, confirm they appear on the Band display

## Blocked by

#185
