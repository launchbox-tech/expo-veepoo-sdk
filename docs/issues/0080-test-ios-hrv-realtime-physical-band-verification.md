# 80 — test(ios): HRV realtime — physical Band verification (#77)

**Status:** closed — not planned (blocked on #79; sync from GitHub)  
**Labels:** _(none)_

> https://github.com/launchbox-tech/expo-veepoo-sdk/issues/80

## Parent

[#77 — PRD: iOS HRV realtime manual test parity with Android](https://github.com/launchbox-tech/expo-veepoo-sdk/issues/77)

## What to build

With **#79** merged (or native HRV otherwise available), run **manual acceptance** on a **physical Band**: start HRV test, observe **`hrvTestResult`** progression, stop test, attempt second **`start*Test`** while HRV active to confirm **`REALTIME_TEST_IN_PROGRESS`**. Update **`docs/vendor-parity-matrix.md`** **Device tested** for the HRV row when verified (or note failure/limitation).

## Acceptance criteria

- [ ] Checklist recorded (issue comment or **PR**): start / progress / stop / mutex.
- [ ] Matrix **Device tested** updated from **TBD** when passing, or documented limitation.

## Blocked by

- #79 — N/A until native iOS HRV path exists (**#78** no-go as of 2026-05-02).
