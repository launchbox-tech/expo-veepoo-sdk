# PRD: Initial setup — verify fork builds + create example app

> GitHub: https://github.com/launchbox-tech/expo-veepoo-sdk/issues/1

## Problem Statement

We have forked `expo-veepoo-sdk` (v1.2.7) as the native bridge between our companion app and HBand wearable devices. The fork contains complete Kotlin and Swift native implementations, vendored SDK binaries (AARs + iOS frameworks), TypeScript types, normalizers, and a config plugin — but it has never been built or tested in this org's environment. Without a verified build and a working example app, we cannot confidently integrate it into the companion app.

## Solution

Stand up the fork so it builds cleanly on both platforms, ship a minimal `example/` app that exercises the full scan → connect → health-data flow, and confirm the module can be installed from GitHub in a real Expo project.

## User Stories

1. As a developer, I want `npm install` to complete without errors, so that I can start working on the module immediately.
2. As a developer, I want `tsc --noEmit` to pass with zero errors, so that I know the TypeScript layer is sound before touching native code.
3. As a developer, I want an `example/` Expo app inside the repo, so that I can test the module in isolation without needing the full companion app.
4. As a developer, I want `npx expo prebuild --clean` in the example app to succeed, so that I know the config plugin injects permissions correctly on both platforms.
5. As a developer, I want `npx expo run:android` to produce a working APK, so that I can test BLE connectivity on a physical Android device.
6. As a developer, I want `npx expo run:ios` to produce a working IPA, so that I can test BLE connectivity on a physical iOS device.
7. As a developer, I want the example app to call `init()` and `requestPermissions()` on launch, so that the user is prompted for Bluetooth access before any scan.
8. As a developer, I want the example app to call `startScan()` and display discovered `VeepooDevice`s in a list, so that I can confirm the SDK surfaces HBand devices correctly.
9. As a developer, I want to tap a discovered device in the example app and trigger `connect(deviceId)`, so that I can verify the connection + password-verification sequence works.
10. As a developer, I want the example app to listen for the `deviceReady` event and update the UI accordingly, so that I know when a Session is active and operations are safe.
11. As a developer, I want the example app to call `syncPersonalInfo()` immediately on `deviceReady`, so that the Band has accurate user data for health calculations.
12. As a developer, I want the example app to provide a "Start Heart Rate Test" button that calls `startHeartRateTest()` and displays progress + BPM from `heartRateTestResult` events, so that I can verify real-time health measurement works end-to-end.
13. As a developer, I want the example app to provide a "Start Blood Pressure Test" button, so that I can verify BP measurement works on a real device.
14. As a developer, I want the example app to provide a "Start SpO2 Test" button, so that I can verify blood oxygen measurement works on a real device.
15. As a developer, I want the example app to provide a "Sync Data" button that calls `startReadOriginData()` and shows progress via `readOriginProgress` events, so that I can verify historical data sync works.
16. As a developer, I want the example app to display sleep data after sync, so that I can verify `sleepData` events are parsed and rendered correctly.
17. As a developer, I want the example app to display step count after sync, so that I can verify `sportStepData` is populated.
18. As a developer, I want the example app to call `readBattery()` and display the Band's battery level, so that I can verify device info reads work.
19. As a developer, I want the example app to listen for `deviceDisconnected` events and show a "Reconnect" button, so that I can verify the connection-drop UX pattern works as designed.
20. As a developer, I want the example app to work in iOS Simulator with mock data, so that I can do UI development without a physical device.
21. As a developer, I want `npm install github:launchbox-tech/expo-veepoo-sdk` in an external Expo project to succeed and the module to link correctly after prebuild, so that the companion app can consume it via GitHub install.

## Implementation Decisions

### Modules

**Module 1 — Fork verification**
- Run `npm install` to resolve all JS dependencies
- Run `tsc --noEmit` to confirm the TypeScript layer compiles
- Confirm Android `libs/*.aar` files are present and `build.gradle` references them correctly
- Confirm iOS `Frameworks/*.framework` files are present and `VeepooSDK.podspec` references them

**Module 2 — Example app scaffold** ✅ DONE
- Created `example/` using `npx create-expo-app@latest --template default@sdk-55` (Expo SDK 55, React Native 0.83.6)
- Added `expo-veepoo-sdk: "file:.."` to example dependencies; bun install resolves without errors
- Added `"expo-veepoo-sdk"` to plugins in `example/app.json`; `npx expo prebuild --clean` succeeds
- Fixed config plugin to also inject `NSLocationWhenInUseUsageDescription` (required by issue #3 acceptance criteria)
- All 6 permissions verified in AndroidManifest.xml and all 3 iOS keys verified in Info.plist

**Module 3 — Example app UI (single screen)** (in progress)
- State machine mirroring `VeepooSDK`'s connection lifecycle: `idle → scanning → pairing → connecting → ready → disconnected`
- [✅ idle state] `init()` + `requestPermissions()` called on mount; "Start Scan" button disabled until `permissions.granted`
- [✅ scan section] "Start Scan" → `startScan()` + `deviceFound` listener → `FlatList` of device rows (name, RSSI dBm, MAC); "Stop Scan" → `stopScan()` + back to idle; deduplication by device ID
- [✅ connect/session/disconnect] Connect row → `connect(id)`, connecting splash; `deviceReady` → 'ready' + `syncPersonalInfo()`; `deviceDisconnected` → 'disconnected' + Reconnect button; Disconnect button; session card shows sync status
- [✅ health tests] HR, BP, SpO₂ cards in session screen; each has Start button (disabled while another test runs), progress bar (0-100%), and result display; `heartRateTestResult`/`bloodPressureTestResult`/`bloodOxygenTestResult` event listeners active in 'ready' state
- Session section (visible only in `ready` state): battery level, device version, personal info sync status
- Health test section: HR / BP / SpO2 buttons with progress bars and result display
- Data sync section: sync button, progress indicator, summary of sleep + steps for today
- Disconnect button always visible when in session

**Module 4 — Config plugin verification**
- After prebuild, `AndroidManifest.xml` must contain: `BLUETOOTH`, `BLUETOOTH_ADMIN`, `BLUETOOTH_SCAN`, `BLUETOOTH_CONNECT`, `ACCESS_FINE_LOCATION`
- `Info.plist` must contain: `NSBluetoothAlwaysUsageDescription`, `NSBluetoothPeripheralUsageDescription`, `NSLocationWhenInUseUsageDescription`

### Key architectural decisions carried from grilling session
- `syncPersonalInfo()` is called by the example app on every `deviceReady` event
- No auto-reconnect in the module — `deviceDisconnected` triggers a UI prompt to rescan
- The module is installed as a GitHub dependency, not from npm
- Simulator returns mock data; all `#if targetEnvironment(simulator)` branches are already implemented

## Testing Decisions

Testing for this PRD is integration-focused, not unit-focused. The fork's internal normalizer logic (`normalizers.ts`) is the only JS layer with pure functions worth unit testing — `normalizers.test.ts` already exists.

**What a good test looks like here:** test observable behavior (does the event arrive with the right shape? does the UI update?), not implementation details (don't assert that `VPOperateManager.getInstance()` was called).

**Modules to test:**
- `normalizers.ts` — already has `normalizers.test.ts`; confirm it passes with `npm test`
- TypeScript compilation — `tsc --noEmit` is the test
- Config plugin — `expo prebuild` output is the test; inspect generated files manually
- End-to-end on device — manual test with physical HBand device following the verification checklist

**No unit tests needed for:** native Kotlin/Swift code (VeepooSDK handles its own protocol correctness), the example app UI (manual verification is sufficient for v1).

## Out of Scope

- Alarm management, watch face transfers, OTA firmware updates — covered by the SDK but not needed for initial setup verification
- Blood glucose and stress tests — present in the SDK; add to example app only after core tests pass
- Publishing to npm — this is a private, GitHub-only module
- Automated CI/CD pipeline — manual builds only for v1
- Renaming `VeepooSDK` → `HBandSDK` anywhere — decided against this (ADR 0001)
- Auto-reconnect logic inside the module
- Storing `deviceId` or personal info — that belongs in the companion app, not this module

## Further Notes

- Working directory: `/Users/saileshbro/Projects/expo-veepoo-sdk`
- GitHub remote: `https://github.com/launchbox-tech/expo-veepoo-sdk`
- Upstream (original fork source): `https://github.com/gaozh1024/expo-veepoo-sdk`
- Domain glossary and architectural decisions are captured in `CONTEXT.md` and `docs/adr/` at the repo root
- The fork is on Expo SDK 54 / React Native 0.81.6 / expo-modules-core 3.x
