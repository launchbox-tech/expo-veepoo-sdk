# Issue #4: Example app — init + permissions + idle-state UI

> GitHub: https://github.com/launchbox-tech/expo-veepoo-sdk/issues/4
> Status: closed | Type: AFK | Blocked by: #3

## Parent

[#1 Initial setup: verify fork builds + create example app](https://github.com/launchbox-tech/expo-veepoo-sdk/issues/1)

## What to build

On launch, the example app calls `init()` and `requestPermissions()` from `expo-veepoo-sdk`. The screen renders an idle-state UI (a single "Start Scan" button, disabled until permissions are granted). The app builds and runs on a physical Android device and a physical iOS device (and iOS Simulator with mock data). Verifiable by seeing the BLE permission prompt appear on first launch.

## Acceptance criteria

- [x] `init()` is called before any other SDK method
- [x] `requestPermissions()` is called on launch; BLE permission dialog appears on first run
- [x] UI renders an idle state with a disabled "Start Scan" button when permissions are not yet granted
- [x] "Start Scan" button becomes enabled once permissions are granted
- [x] `npx expo run:android` produces a working APK on a physical device
- [x] `npx expo run:ios` produces a working IPA on a physical device
- [x] App launches without crash on iOS Simulator (mock data path)

## Blocked by

- [#3 Example app scaffold + config plugin](https://github.com/launchbox-tech/expo-veepoo-sdk/issues/3)
