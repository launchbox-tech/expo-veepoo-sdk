# Issue #45: writeSocialMsgData — iOS native implementation

> GitHub: https://github.com/launchbox-tech/expo-veepoo-sdk/issues/45
> Status: closed | Type: AFK | Blocked by: #42

## Parent

[#39 feat(notifications): add writeSocialMsgData() to set per-channel notification switches](https://github.com/launchbox-tech/expo-veepoo-sdk/issues/39)

## What to build

Implement `writeSocialMsgData` in the iOS native module:

- Call `veepooSDKBatchSettingWithMessageTypeModels:` passing only the channels present in the partial input (the batch API handles per-channel BLE traffic for channels not included)
- Resolve the returned `Promise` with `'success'` or `'fail'` based on the native callback result
- No new event type — result is returned inline, symmetric with other fire-and-resolve methods (e.g. `setLanguage`)

The JS wrapper and validator are already in place from #42. No new types required.

## Acceptance criteria

- [ ] `writeSocialMsgData({ instagram: 'close' })` on a connected Band disables only the Instagram channel
- [ ] Method resolves with `'success'` when the Band acknowledges the write
- [ ] Method resolves with `'fail'` (not rejects) when the Band returns a failure
- [ ] No new event is emitted; the result arrives solely via the Promise
- [ ] TypeScript compiles without errors (`tsc --noEmit`)

## Blocked by

- [#42 writeSocialMsgData — TypeScript foundation](https://github.com/launchbox-tech/expo-veepoo-sdk/issues/42)
