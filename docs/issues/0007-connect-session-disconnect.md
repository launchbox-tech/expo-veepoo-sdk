# Issue #7: Example app — connect + Session + disconnect/reconnect

> GitHub: https://github.com/launchbox-tech/expo-veepoo-sdk/issues/7
> Status: open | Type: AFK | Blocked by: #6

## Parent

[#1 Initial setup: verify fork builds + create example app](https://github.com/launchbox-tech/expo-veepoo-sdk/issues/1)

## What to build

Tapping a device row's "Connect" button calls `connect(deviceId)` and transitions the app to a connecting state. On `deviceReady`, the app transitions to `ready`, calls `syncPersonalInfo()`, and reveals the session section of the UI. When a `deviceDisconnected` event fires, the app transitions to `disconnected` and shows a "Reconnect" button that re-enters the scan flow via `startScan()`.

## Acceptance criteria

- [ ] Tapping "Connect" calls `connect(deviceId)` and shows a connecting indicator
- [ ] `deviceReady` event transitions UI to `ready` state and reveals the session section
- [ ] `syncPersonalInfo()` is called immediately on every `deviceReady` event
- [ ] Session section is only visible in `ready` state
- [ ] `deviceDisconnected` event transitions UI to `disconnected` state
- [ ] "Reconnect" button is shown in `disconnected` state and calls `startScan()` when tapped
- [ ] Full flow verified on a physical HBand device: scan → connect → ready → disconnect → reconnect

## Blocked by

- [#6 Example app: scan + device list](https://github.com/launchbox-tech/expo-veepoo-sdk/issues/6)
