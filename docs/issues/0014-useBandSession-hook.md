# Issue #14: example: extract useBandSession hook

> GitHub: https://github.com/launchbox-tech/expo-veepoo-sdk/issues/14
> Status: closed | Labels: enhancement

## Parent

[refactor(example): extract custom hooks per SDK lifecycle phase](https://github.com/gaozh1024/expo-veepoo-sdk/issues/1)

## What to build

Move the Session lifecycle into `hooks/useBandSession.ts`. The hook owns `connectedDevice`, `connectingDevice`, `connectError`, `syncDone`, `batteryInfo`, and `deviceVersion`. It uses `useSDKEvent` for four events: `deviceReady`, `deviceDisconnected`, `deviceConnectStatus`, and `batteryData`. Exposes `connect`, `disconnect`, and `reconnect`.

**Correctness fix included:** the `batteryData` listener currently lives in the data sync `useEffect` block — it belongs in this hook since battery level is Session-scoped device info, not sync data. Move it here.

Dispatches `SESSION_READY`, `SESSION_ERROR`, `SESSION_ENDED`, `DISCONNECT`, and `RECONNECT` actions.

## Acceptance criteria

- [ ] `hooks/useBandSession.ts` exists; owns all 6 state variables; uses `useSDKEvent` for all 4 events
- [ ] `batteryData` listener removed from the data sync block and added to this hook
- [ ] Main component's connection lifecycle useEffect block removed
- [ ] `handleConnect`, `handleDisconnect`, `handleReconnect` useCallbacks removed from main component
- [ ] Session flow works end-to-end: connect → ready → battery/version displayed → disconnect → idle
- [ ] Unexpected disconnect (device out of range) correctly shows disconnected screen
- [ ] `tsc --noEmit` passes with zero errors

## Blocked by

- [#13](https://github.com/launchbox-tech/expo-veepoo-sdk/issues/13)
