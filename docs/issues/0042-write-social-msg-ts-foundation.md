# Issue #42: writeSocialMsgData — TypeScript foundation (validator + interface + JS wrapper)

> GitHub: https://github.com/launchbox-tech/expo-veepoo-sdk/issues/42
> Status: open | Type: AFK | Blocked by: none

## Parent

[#39 feat(notifications): add writeSocialMsgData() to set per-channel notification switches](https://github.com/launchbox-tech/expo-veepoo-sdk/issues/39)

## What to build

Add the full TypeScript layer for `writeSocialMsgData(data: Partial<SocialMsgData>): Promise<OperationStatus>`:

- `validateSocialMsgData(data: Partial<SocialMsgData>): void` in `validators/device-settings.ts` — throws `VeepooError(INVALID_ARGUMENT)` if the object has zero keys, or if any value is not a valid `FunctionStatus` literal
- `writeSocialMsgData` signature on `VeepooSDKModuleInterface` in `VeepooSDKModule.ts`
- A stub implementation in `NativeVeepooSDK.ts` that throws `"not implemented"` (replaced when native slices land)
- `VeepooSDK.writeSocialMsgData()` in `VeepooSDK.ts`: runs the validator, delegates to native, returns `OperationStatus`
- Unit tests in `src/__tests__/validators/device-settings.test.ts` covering: empty object throws, valid partial passes, invalid `FunctionStatus` value throws, all 13 channel keys accept valid values

No new types. Uses existing `SocialMsgData` (13 channels), `FunctionStatus`, and `OperationStatus`.

## Acceptance criteria

- [ ] `validateSocialMsgData({})` throws `VeepooError` with code `INVALID_ARGUMENT`
- [ ] `validateSocialMsgData({ whatsapp: 'open' })` passes without throwing
- [ ] `validateSocialMsgData({ whatsapp: 'badvalue' as any })` throws `VeepooError` with code `INVALID_ARGUMENT`
- [ ] All 13 `SocialMsgData` channel keys are covered by validator tests
- [ ] `writeSocialMsgData` is present on `VeepooSDKModuleInterface` with the correct signature
- [ ] `VeepooSDK.writeSocialMsgData` calls the validator before reaching native
- [ ] TypeScript compiles without errors (`tsc --noEmit`)
- [ ] All new tests pass (`jest`)

## Blocked by

None — can start immediately.
