# 49 — feat(time): iOS native — implement setDeviceTime in Swift/ObjC module

> Superseded by #58.

## Parent

Closes #38

## What to build

Implement `setDeviceTime` in the iOS native module. The method takes an optional timestamp and calls the correct VeepooSDK Objective-C method depending on whether a specific date was supplied.

Two code paths:
- **No argument / `nil`**: call `veepooSDKSettingTimeWithResult:` to sync the phone's current system time.
- **Explicit timestamp**: extract year, month, day, hour, minute, second and call `veepooSDKSettingTimeWithYear:month:day:hour:minute:second:timeSystem:result:` with `timeSystem: 0` (24-hour).

The method must resolve `true` on success and `false` on failure. No event is emitted.

## Acceptance criteria

- [ ] `setDeviceTime` is implemented in the iOS module and wired to the Expo module bridge
- [ ] Calling with no argument invokes `veepooSDKSettingTimeWithResult:` (phone-time sync path)
- [ ] Calling with a specific timestamp invokes `veepooSDKSettingTimeWithYear:month:day:hour:minute:second:timeSystem:result:` with the correct extracted fields
- [ ] Returns `true` on success, `false` on failure
- [ ] No new event is emitted by this method
- [ ] Verified on a physical Band

## Blocked by

- #46
