# 58 — feat(time): iOS native — implement setDeviceTime in Swift (veepooSDKSettingTime)

## Parent

#55

## What to build

Implement `setDeviceTime` in the iOS Swift module using the `VPPeripheralManage` time-setting API, following the alarm handler pattern (`VeepooSDKModule+Alarms.swift`).

New file `VeepooSDKModule+Time.swift` — an extension on `VeepooSDKModule` with `handleSetDeviceTime(_ time: [String: Any]?, promise: Promise)`. Register a clean one-liner `AsyncFunction("setDeviceTime")` in `VeepooSDK.swift` that delegates to the handler (no simulator guard in the registration — guard lives only inside the handler, consistent with alarm handlers).

Two code paths inside the handler:
- **No argument (`nil` map)**: `peripheralManage.veepooSDKSettingTime { success in promise.resolve(success) }` — the SDK reads phone system time internally. Note: the correct Swift bridged name is `veepooSDKSettingTime` (trailing closure), NOT `veepooSDKSettingTimeWithResult` (ObjC name — will not compile in Swift).
- **Explicit map**: `peripheralManage.veepooSDKSettingTime(withYear: Int32(year), month: Int32(month), day: Int32(day), hour: Int32(hour), minute: Int32(minute), second: Int32(second), timeSystem: 0) { success in promise.resolve(success) }`. `timeSystem: 0` means "don't change the display format" (confirmed from official SDK docs and example — not "24-hour").

Simulator path (`#if targetEnvironment(simulator)`) resolves `true` immediately at the top of the handler.

## Acceptance criteria

- [ ] `AsyncFunction("setDeviceTime")` is a one-liner delegate to `handleSetDeviceTime` — no simulator guard in the registration
- [ ] No-argument path calls `veepooSDKSettingTime { }` (Swift bridged name, not ObjC `veepooSDKSettingTimeWithResult`)
- [ ] Explicit-date path calls `veepooSDKSettingTime(withYear:...:timeSystem: 0)`
- [ ] Simulator build resolves `true` without crashing
- [ ] Returns `true` on success, `false` on failure (from the SDK closure `BOOL success`)
- [ ] No new event is emitted
- [ ] Verified on a physical Band — Band clock updates to match the sent time

## Blocked by

- #56
