# refactor(device-settings): wire sub-classes into VeepooSDK + delete DeviceSettings

**Issue:** #153
**Status:** Open
**Labels:** needs-triage, enhancement
**Parent:** #138

## What to build

Replace `deviceSettings: DeviceSettings` in `VeepooSDK` with six typed sub-class fields. Re-route all 41 delegation methods. Export sub-classes from a barrel. Delete old `DeviceSettings` god object.

## Acceptance criteria

- [ ] `VeepooSDK` holds six private sub-class fields
- [ ] All 41 delegation methods route to correct sub-instance
- [ ] Old `DeviceSettings` class deleted
- [ ] `device-settings/index.ts` barrel exports all six sub-classes
- [ ] `VeepooSDKModuleInterface` and public method signatures unchanged
- [ ] All `VeepooSDK.test.ts` integration tests pass
- [ ] TypeScript compilation succeeds

## Blocked by

#147, #148, #149, #150, #151, #152
