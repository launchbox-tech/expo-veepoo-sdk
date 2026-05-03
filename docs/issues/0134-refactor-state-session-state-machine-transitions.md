# refactor(state): Session state machine — explicit transition methods on VeepooSdkState

**Issue:** #134
**Status:** Open
**Labels:** needs-triage
**Parent:** #130

## What to build

Add explicit Session transition methods to `VeepooSdkState`: `onDeviceConnected(deviceId)`, `onDeviceDisconnected(deviceId?)`, and `onConnectionStatusChanged(deviceId?, status)`. Each method encodes the transition logic (what to set, what to clear, under what conditions). Replace the three `if (event === ...)` state-mutation blocks inside `VeepooSDKRuntime.emitLocal` with calls to these named methods. Add unit tests that drive state transitions directly through the methods, without emitting native events.

## Acceptance criteria

- [ ] `VeepooSdkState` exposes `onDeviceConnected(deviceId: string)`, `onDeviceDisconnected(deviceId?: string)`, and `onConnectionStatusChanged(deviceId?: string, status: ConnectionStatus)`
- [ ] `emitLocal` no longer contains `if (event === "deviceConnected")`, `if (event === "deviceDisconnected")`, or `if (event === "deviceConnectStatus" || event === "connectionStatusChanged")` mutation blocks — each is replaced by the corresponding transition method call
- [ ] Unit test: `onDeviceConnected(id)` sets `connectedDeviceId` to `id`
- [ ] Unit test: `onDeviceDisconnected(id)` clears `connectedDeviceId` when it matches; leaves it unchanged when it does not match
- [ ] Unit test: `onDeviceDisconnected(undefined)` clears `connectedDeviceId` unconditionally
- [ ] Unit test: `onConnectionStatusChanged(id, "disconnected")` clears `connectedDeviceId` when it matches
- [ ] Unit test: `onConnectionStatusChanged(id, "connected")` does not clear `connectedDeviceId`
- [ ] All existing tests pass unchanged

## Blocked by

None — can start immediately
