# 56 — fix(time): correct NativeVeepooSDK bridge type and Date serialization for setDeviceTime

## Parent

#55

## What to build

Fix two JS-layer gaps introduced in #46 that prevent the native bridge from working correctly end-to-end:

1. `NativeVeepooSDKInterface.setDeviceTime` is currently typed as `time?: Date`. Expo module bridges cannot receive a `Date` object — they receive plain maps. Change the type to `time?: Omit<DeviceTimeSetting, 'system'>`, reusing the existing `DeviceTimeSetting` type from `src/types/connection.ts` (minus `system`, which `setDeviceTime` never touches).

2. `VeepooSDK.setDeviceTime` passes the raw `Date` straight to native. Update it to convert the `Date` to a plain `{ year, month, day, hour, minute, second }` map using local-time getters (`getFullYear()`, `getHours()`, etc.) before calling native. Local time is correct here — the Band is a clock that displays the user's wall-clock time.

Both changes are pure JS/TS and fully verifiable with `jest` — no device required.

## Acceptance criteria

- [ ] `NativeVeepooSDKInterface.setDeviceTime` accepts `Omit<DeviceTimeSetting, 'system'>` (not `Date`)
- [ ] `VeepooSDK.setDeviceTime` converts a provided `Date` to a local-time `{ year, month, day, hour, minute, second }` map before calling native
- [ ] When `time` is `undefined`, `undefined` is passed to native (native reads phone system time)
- [ ] `DeviceTimeSetting` is imported from `src/types/index.js` in `NativeVeepooSDK.ts`
- [ ] All existing `jest` tests continue to pass

## Blocked by

None — can start immediately.
