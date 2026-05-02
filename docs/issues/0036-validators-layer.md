# feat(validators): add src/validators/ layer and wire into VeepooSDK

> GitHub: https://github.com/launchbox-tech/expo-veepoo-sdk/issues/36
> Status: closed | Labels: enhancement
> Parent: #32

## What to build

Add `src/validators/` — pure functions that validate inputs before they reach the native bridge. Add `INVALID_ARGUMENT` to `VeepooErrorCode`. Create `shared.ts` (primitive guards), `connection.ts` (`validateDeviceId`, `validateConnectOptions`, `validatePersonalInfo`), `device-settings.ts` (`validateAlarm`, `validateAutoMeasureSetting`), and `index.ts` barrel. Wire into `VeepooSDK.connect()`, `syncPersonalInfo()`, `modifyAutoMeasureSetting()`.

## Acceptance criteria

- [ ] `INVALID_ARGUMENT` added to `VeepooErrorCode`
- [ ] All validator files created under `src/validators/`
- [ ] Validators wired into `connect()`, `syncPersonalInfo()`, `modifyAutoMeasureSetting()`
- [ ] `connect('')` throws `VeepooError { code: 'INVALID_ARGUMENT' }` before reaching native
- [ ] `syncPersonalInfo({ height: -5 })` throws with the invalid field named in the message
- [ ] Tests in `src/__tests__/validators/` — no BLE mock required
- [ ] All existing tests pass unchanged

## Blocked by

- #33
- #35
