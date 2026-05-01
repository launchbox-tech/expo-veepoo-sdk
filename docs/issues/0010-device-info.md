# Issue #10: Example app — device info (battery + version)

> GitHub: https://github.com/launchbox-tech/expo-veepoo-sdk/issues/10
> Status: closed | Type: AFK | Blocked by: #7

## Parent

[#1 Initial setup: verify fork builds + create example app](https://github.com/launchbox-tech/expo-veepoo-sdk/issues/1)

## What to build

In the session section, call `readBattery()` and display the Band's battery level as a percentage. Also display the device firmware version. Both values should update when a new Session becomes active. Verifiable on a physical HBand device.

## Acceptance criteria

- [x] Battery level (percentage) is displayed in the session section
- [x] `readBattery()` is called when the Session becomes active (`deviceReady`)
- [x] Device firmware version is displayed in the session section
- [x] Values are cleared/hidden when the Session ends
- [ ] Verified against a physical HBand device (requires hardware)

## Blocked by

- [#7 Example app: connect + Session + disconnect/reconnect](https://github.com/launchbox-tech/expo-veepoo-sdk/issues/7)
