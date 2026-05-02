# 55 — feat(time): setDeviceTime native bridge + platform implementations

## Problem Statement

Device time is currently synced only once, at connect-time, via `ConnectOptions.timeSetting`. After a Session is established there is no way for the app to re-sync the Band's clock — for example after a timezone change, a daylight-saving transition, or when the user has manually drifted the Band clock. The `setDeviceTime` JS method and validator landed in #46, but the native bridge and platform implementations are still missing, so every call throws a link error at runtime.

## Solution

Wire `setDeviceTime(time?: Date): Promise<boolean>` end-to-end through the native bridge and both platform modules so the host app can sync the Band's clock at any point during a Session, not only at connect-time.

## User Stories

1. As a host-app developer, I want `setDeviceTime()` (no argument) to sync the Band clock to the current phone local time, so that the Band always shows the correct time after reconnection or timezone changes.
2. As a host-app developer, I want `setDeviceTime(myDate)` to set a specific date and time on the Band, so that I can support time-adjustment workflows in my UI.
3. As a host-app developer, I want `setDeviceTime` to resolve `true` on success and `false` on failure, so that I can surface a retry option without subscribing to a separate event.
4. As a host-app developer, I want `setDeviceTime` to throw a `VeepooError` with code `INVALID_ARGUMENT` if the provided value is not a valid `Date`, so that invalid inputs fail before reaching the bridge.
5. As a host-app developer, I want `setDeviceTime` to work on both iOS and Android without any platform-specific call sites in my code, so that the SDK abstracts all platform differences.
6. As a host-app developer, I want `setDeviceTime` to reject (or resolve `false`) immediately if no Band is connected, so that I get a clear failure signal rather than a silent hang.
7. As an SDK maintainer, I want the native bridge type to use `Omit<DeviceTimeSetting, 'system'>` rather than an inline record, so that the bridge interface stays consistent with the existing `DeviceTimeSetting` type used in `ConnectOptions`.
8. As an SDK maintainer, I want the JS layer to convert the `Date` to a plain year/month/day/hour/minute/second map using local-time extraction before calling native, so that the Band clock shows the user's local wall-clock time.
9. As an SDK maintainer, I want the iOS no-argument path to call `veepooSDKSettingTime` (SDK reads phone system time internally), so that the correct iOS SDK path is used for each case.
10. As an SDK maintainer, I want the iOS explicit-date path to call `veepooSDKSettingTime(withYear:month:day:hour:minute:second:timeSystem:)` with `timeSystem: 0` (don't change display format), so that time sync does not accidentally change the Band's 12/24-hour display setting.
11. As an SDK maintainer, I want the Android implementation to call `VPOperateManager.settingTime` directly with a `DeviceTimeSetting`, so that time sync is independent of the connect flow.
12. As an SDK maintainer, I want the Android implementation to resolve `false` only when the BLE write itself fails (`IBleWriteResponse`), and resolve `true` when the device responds via `IResponseListener`, so that the boolean result accurately reflects whether the command reached the device.
13. As an SDK maintainer, I want the iOS simulator path to resolve `true` immediately, so that development builds on simulator do not hang.
14. As an SDK maintainer, I want the simulator guard to live inside the handler, not duplicated in the module registration, consistent with the alarm handler pattern.

## Implementation Decisions

### Bridge type

The native interface accepts an optional `Omit<DeviceTimeSetting, 'system'>` map. The `system` field is excluded because `setDeviceTime` never changes the display format — that is a separate device-settings concern. The `Date`-to-map conversion (using local-time getters) lives in the JS SDK class.

### No new types or events

`DeviceTimeSetting` (already in `src/types/connection.ts`) covers the wire fields. No new types are introduced. No event is emitted — the return value is a plain `boolean`.

### iOS: two native paths

- **No argument**: calls `veepooSDKSettingTime` with a trailing closure — the SDK reads phone system time internally. This is the Swift-bridged name for `veepooSDKSettingTimeWithResult:`. The alternative ObjC-style call `veepooSDKSettingTimeWithResult {}` is wrong Swift and will not compile.
- **Explicit date**: calls `veepooSDKSettingTime(withYear:month:day:hour:minute:second:timeSystem:)` with `timeSystem: 0`. The official SDK docs confirm `timeSystem: 0` means "don't set display format" (not "24-hour"). The official example also passes `timeSystem: 0`.

Both paths return a `BOOL success` closure. The handler resolves the Expo promise with that boolean directly.

### Android: `settingTime` API

`VPOperateManager.settingTime(IBleWriteResponse, IResponseListener, DeviceTimeSetting)` exists in the SDK JAR but is absent from the public Android API docs. `IResponseListener.response(Int)` is fully undocumented — its integer code semantics are unknown. The implementation treats any invocation of `response()` as success (`true`); only a BLE write failure from `IBleWriteResponse` (non-`REQUEST_SUCCESS` code) resolves `false`. The 6-argument `DeviceTimeSetting(year, month, day, hour, minute, second)` constructor is used — no `ETimeMode` — consistent with iOS's `timeSystem: 0` (don't change display format).

When `time` is `null` (no-argument call), the current phone local time is read from `Calendar.getInstance()`.

### Simulator

The iOS simulator path resolves `true` immediately inside the handler (`#if targetEnvironment(simulator)`). Android has no simulator equivalent — the BLE stack is absent but the Expo module bridge handles that at a lower level.

### Module registration pattern

The iOS `AsyncFunction("setDeviceTime")` registration is a clean one-liner that delegates to `handleSetDeviceTime` in a new extension file, following the alarm handler pattern. The Android `AsyncFunction("setDeviceTime")` lives in a new `VeepooSDKModuleTime.kt` file with a `defineTime` extension function, following the alarm and write-data patterns.

## Testing Decisions

Good tests assert on the promise value returned from the public SDK interface — they do not inspect which native method was called or spy on internal fields.

**Modules with tests:**

- **Validators** — `validateDeviceTime` tests already landed in #46 as part of `src/__tests__/validators/validators.test.ts`. No additional validator tests needed.

No normalizer tests needed — `setDeviceTime` returns a plain `boolean` with no normalization.

Native integration tests (on-device verification) are outside the Jest suite. Acceptance is confirmed by calling `await sdk.setDeviceTime()` from the example app and observing the Band clock update.

## Out of Scope

- Changing the 12/24-hour display format — that is a separate device-settings concern.
- Replacing the `timeSetting` field in `ConnectOptions` — the connect-time path remains unchanged.
- Automatic re-sync on reconnect — the host app owns reconnection logic per the SDK decisions in `CLAUDE.md`.
- Tests for the native Kotlin/Swift code — verified on device only.

## Further Notes

The most common call pattern will be `await sdk.setDeviceTime()` (no argument), called from the `deviceReady` handler. The `settingTime` method on Android is absent from the official public docs but present in the SDK JAR; its `IResponseListener` callback semantics were determined empirically. Both platforms treat "don't change display format" consistently: iOS uses `timeSystem: 0`, Android uses the 6-argument `DeviceTimeSetting` constructor without an `ETimeMode`.

Parent issue: #38
Related issues: #46 (JS layer, done), #48 (Android, pending), #49 (iOS, pending)
