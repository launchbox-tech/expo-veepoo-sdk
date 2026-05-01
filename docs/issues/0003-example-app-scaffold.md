# Issue #3: Example app scaffold + config plugin

> GitHub: https://github.com/launchbox-tech/expo-veepoo-sdk/issues/3
> Status: closed | Type: AFK | Blocked by: #2

## Parent

[#1 Initial setup: verify fork builds + create example app](https://github.com/launchbox-tech/expo-veepoo-sdk/issues/1)

## What to build

Create a bare Expo SDK 54 app under `example/` using `create-expo-app --template blank-typescript`. Add `expo-veepoo-sdk: "file:.."` as a dependency and `"plugins": ["expo-veepoo-sdk"]` to `example/app.json`. Run `npx expo prebuild --clean` on both platforms and verify the config plugin injects all required BLE permissions.

## Acceptance criteria

- [x] `example/` directory exists with a valid Expo SDK 54 bare app
- [x] `npm install` in `example/` resolves without errors
- [x] `npx expo prebuild --clean` succeeds on Android and iOS
- [x] `AndroidManifest.xml` contains: `BLUETOOTH`, `BLUETOOTH_ADMIN`, `BLUETOOTH_SCAN`, `BLUETOOTH_CONNECT`, `ACCESS_FINE_LOCATION`
- [x] `Info.plist` contains: `NSBluetoothAlwaysUsageDescription`, `NSBluetoothPeripheralUsageDescription`, `NSLocationWhenInUseUsageDescription`

## Blocked by

- [#2 Fork verification: install + compile](https://github.com/launchbox-tech/expo-veepoo-sdk/issues/2)
