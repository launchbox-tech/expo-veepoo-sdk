# Issue #6: Example app — scan + device list

> GitHub: https://github.com/launchbox-tech/expo-veepoo-sdk/issues/6
> Status: open | Type: AFK | Blocked by: #4

## Parent

[#1 Initial setup: verify fork builds + create example app](https://github.com/launchbox-tech/expo-veepoo-sdk/issues/1)

## What to build

Tapping "Start Scan" calls `startScan()` and transitions the app to a scanning state. Discovered `VeepooDevice` objects appear as rows in a scrollable list, each showing the device name, RSSI, and a "Connect" button. A "Stop Scan" button is available while scanning is active. Verifiable by seeing real HBand devices appear in the list on a physical device.

## Acceptance criteria

- [ ] Tapping "Start Scan" calls `startScan()` and shows a scanning indicator
- [ ] Discovered `VeepooDevice` rows appear in a scrollable list with name, RSSI, and "Connect" button
- [ ] New devices are appended to the list as they are discovered
- [ ] "Stop Scan" button stops scanning and hides the indicator
- [ ] At least one physical HBand device appears in the list during a scan

## Blocked by

- [#4 Example app: init + permissions + idle-state UI](https://github.com/launchbox-tech/expo-veepoo-sdk/issues/4)
