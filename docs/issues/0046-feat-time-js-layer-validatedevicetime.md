# 46 — feat(time): JS layer — validateDeviceTime, setDeviceTime interface + SDK method + tests

## Parent

Closes #38

## What to build

Add the complete JS-side implementation of `setDeviceTime(time?: Date): Promise<boolean>` end-to-end through the JS layers, with no native code required:

- `validateDeviceTime(time?: Date): void` in `src/validators/device-settings.ts` — throws `VeepooError` with code `INVALID_ARGUMENT` if `time` is provided but is not a valid `Date` (i.e. `isNaN(time.getTime())`); accepts `undefined` unconditionally.
- `setDeviceTime(time?: Date): Promise<boolean>` added to `VeepooSDKModuleInterface` in `src/VeepooSDKModule.ts`.
- `setDeviceTime(time?: Date): Promise<boolean>` added to `NativeVeepooSDKInterface` in `src/NativeVeepooSDK.ts`.
- `setDeviceTime` implementation in `src/VeepooSDK.ts` — calls `validateDeviceTime`, then delegates to the native module.
- No new types, no new events. Return type is a plain `boolean`.
- Validator tests in `src/__tests__/validators/` (or the existing `validators.test.ts`): `validateDeviceTime(undefined)` passes, `validateDeviceTime(new Date())` passes, `validateDeviceTime(new Date('invalid'))` throws, non-`Date` values (string, number) throw.

## Acceptance criteria

- [ ] `validateDeviceTime(undefined)` does not throw
- [ ] `validateDeviceTime(new Date())` does not throw
- [ ] `validateDeviceTime(new Date('invalid'))` throws `VeepooError` with code `INVALID_ARGUMENT`
- [ ] Passing a non-`Date` value (string, number) also throws `VeepooError` with code `INVALID_ARGUMENT`
- [ ] `setDeviceTime` appears on `VeepooSDKModuleInterface` and `NativeVeepooSDKInterface`
- [ ] `VeepooSDK.setDeviceTime` validates its argument before calling the native module
- [ ] All existing tests continue to pass
- [ ] `jest` suite passes with no device required

## Blocked by

None — can start immediately.
