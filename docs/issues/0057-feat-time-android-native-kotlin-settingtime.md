# 57 — feat(time): Android native — implement setDeviceTime in Kotlin (settingTime)

## Parent

#55

## What to build

Implement `setDeviceTime` in the Android (Kotlin) native module using `VPOperateManager.settingTime` directly — not via `confirmDevicePwd` or the connect flow.

New file `VeepooSDKModuleTime.kt` with a `defineTime(module)` extension function, following the pattern of `VeepooSDKModuleAlarms.kt`. Register it in `VeepooSDKModule.kt`.

Two code paths:
- **No argument (`null` map)**: build `DeviceTimeSetting` from `Calendar.getInstance()` (current phone local time).
- **Explicit map**: build `DeviceTimeSetting` from the received `year/month/day/hour/minute/second` fields, falling back to `Calendar` for any missing field.

Use the 6-argument `DeviceTimeSetting(year, month, day, hour, minute, second)` constructor — no `ETimeMode` — so the Band's 12/24-hour display setting is left unchanged.

Response handling: resolve `false` only when `IBleWriteResponse.onResponse` returns a non-`REQUEST_SUCCESS` code (BLE write failed). Resolve `true` when `IResponseListener.response(Int)` fires — any invocation means the device received and processed the command (`IResponseListener` semantics are undocumented in the public API; empirically any callback = success).

Guard against double-resolve with a `var resolved = false` flag (same pattern as alarm methods).

## Acceptance criteria

- [ ] `AsyncFunction("setDeviceTime")` is registered and callable from JS
- [ ] No-argument call (`null` map) syncs Band clock to current phone local time
- [ ] Explicit map call sets the extracted year/month/day/hour/minute/second on the Band
- [ ] Resolves `false` when BLE write fails; resolves `true` on device response
- [ ] No new event is emitted
- [ ] Verified on a physical Band — Band clock updates to match the sent time

## Blocked by

- #56
