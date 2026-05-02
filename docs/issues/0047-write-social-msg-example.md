# Issue #47: writeSocialMsgData — example app read-then-write demo

> GitHub: https://github.com/launchbox-tech/expo-veepoo-sdk/issues/47
> Status: open | Labels: ready-for-human | Type: HITL | Blocked by: #44, #45

## Parent

[#39 feat(notifications): add writeSocialMsgData() to set per-channel notification switches](https://github.com/launchbox-tech/expo-veepoo-sdk/issues/39)

## What to build

Wire `writeSocialMsgData` into the example app under `example/` to demonstrate and validate the correct read-then-write usage pattern:

1. Call `readSocialMsgData()` to fetch the Band's current channel state and display it
2. Let the user toggle one or more channels
3. Call `writeSocialMsgData(partial)` with only the changed channels and surface the returned `OperationStatus` result

Requires a physical Band to verify end-to-end.

## Acceptance criteria

- [ ] Example app displays current notification channel state after `readSocialMsgData()`
- [ ] User can toggle at least one channel and submit the change
- [ ] `writeSocialMsgData` is called with a partial containing only the changed channels
- [ ] The `OperationStatus` result (`'success'` / `'fail'`) is shown in the UI
- [ ] The read-then-write sequence works end-to-end on a real Band (both Android and iOS)

## Blocked by

- [#44 writeSocialMsgData — Android native implementation](https://github.com/launchbox-tech/expo-veepoo-sdk/issues/44)
- [#45 writeSocialMsgData — iOS native implementation](https://github.com/launchbox-tech/expo-veepoo-sdk/issues/45)
