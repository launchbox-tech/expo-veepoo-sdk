# Issue #44: writeSocialMsgData — Android native implementation

> GitHub: https://github.com/launchbox-tech/expo-veepoo-sdk/issues/44
> Status: closed | Type: AFK | Blocked by: #42

## Parent

[#39 feat(notifications): add writeSocialMsgData() to set per-channel notification switches](https://github.com/launchbox-tech/expo-veepoo-sdk/issues/39)

## What to build

Implement `writeSocialMsgData` in the Android Kotlin native module:

- Build a `FunctionSocailMsgData` object from the partial input merged over the module's last-cached read state (so channels absent from `data` retain their current values)
- Call `VPOperateManager.settingSocialMsg` with the merged object
- Resolve the returned `Promise` with `'success'` or `'fail'` based on the native callback's success flag
- Replace the "not implemented" stub in `NativeVeepooSDK.ts` with the real Android bridge call

The JS wrapper and validator are already in place from #42. No new types required.

## Acceptance criteria

- [ ] `writeSocialMsgData({ whatsapp: 'open' })` on a connected Band updates only the WhatsApp channel; all other channels retain their previous values
- [ ] Method resolves with `'success'` when the Band acknowledges the write
- [ ] Method resolves with `'fail'` (not rejects) when the Band returns a failure
- [ ] The stub in `NativeVeepooSDK.ts` is replaced with the live Android bridge method
- [ ] TypeScript compiles without errors (`tsc --noEmit`)

## Blocked by

- [#42 writeSocialMsgData — TypeScript foundation](https://github.com/launchbox-tech/expo-veepoo-sdk/issues/42)
