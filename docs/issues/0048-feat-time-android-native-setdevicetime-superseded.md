# 48 — feat(time): Android native — implement setDeviceTime in Kotlin module

> Superseded by #57.

## Parent

Closes #38

## What to build

Implement `setDeviceTime` in the Android (Kotlin) native module. The method takes an optional timestamp and calls the Band's time-setting API directly — not via `confirmDevicePwd` or the connect flow.

Two code paths:
- **No argument / `null`**: read `System.currentTimeMillis()` and send the phone's current time to the Band.
- **Explicit timestamp**: extract year, month, day, hour, minute, second from the provided value and send those fields.

The method must resolve `true` on success and `false` on failure. No event is emitted.

## Acceptance criteria

- [ ] `setDeviceTime` is implemented in the Android module and wired to the Expo module bridge
- [ ] Calling with no argument syncs the phone's current system time to the Band
- [ ] Calling with a specific timestamp sets the extracted date/time fields on the Band
- [ ] Returns `true` on success, `false` on failure
- [ ] No new BLE event is emitted by this method
- [ ] Method is usable after a Session is established, independent of the connect flow
- [ ] Verified on a physical Band

## Blocked by

- #46
