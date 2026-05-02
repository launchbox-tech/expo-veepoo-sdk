# 80 — test(ios): HRV realtime — physical Band verification (#77)

**Status:** open (sync from GitHub)  
**Labels:** needs-triage

> https://github.com/launchbox-tech/expo-veepoo-sdk/issues/80

## Parent

[#77 — PRD: iOS HRV realtime manual test parity with Android](https://github.com/launchbox-tech/expo-veepoo-sdk/issues/77)

## What to build

With **#79** merged (or native HRV otherwise available), run **manual acceptance** on a **physical Band**: start HRV test, observe **`hrvTestResult`** progression, stop test, attempt second **`start*Test`** while HRV active to confirm **`REALTIME_TEST_IN_PROGRESS`**. Update **`docs/vendor-parity-matrix.md`** **Device tested** for the HRV row when verified (or note failure/limitation).

## Acceptance criteria

- [ ] Checklist recorded (issue comment or **PR**): start / progress / stop / mutex.
- [ ] Matrix **Device tested** updated from **TBD** when passing, or documented limitation.

## Blocked by

- #79
