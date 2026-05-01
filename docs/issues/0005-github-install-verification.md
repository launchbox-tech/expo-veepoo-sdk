# Issue #5: GitHub install verification in external project

> GitHub: https://github.com/launchbox-tech/expo-veepoo-sdk/issues/5
> Status: closed | Type: HITL | Blocked by: none

## Parent

[#1 Initial setup: verify fork builds + create example app](https://github.com/launchbox-tech/expo-veepoo-sdk/issues/1)

## What to build

In a fresh external Expo project (outside this repo), run `npm install github:launchbox-tech/expo-veepoo-sdk`. Add the plugin to `app.json`, run `npx expo prebuild`, and confirm the module links correctly on both Android and iOS. This validates the distribution path the companion app will use.

## Acceptance criteria

- [x] `npm install github:launchbox-tech/expo-veepoo-sdk` completes without errors in an external Expo project
- [x] `npx expo prebuild` succeeds after install
- [x] Module is importable: `import * as VeepooSDK from 'expo-veepoo-sdk'` resolves without errors
- [x] Android native module links correctly after prebuild
- [x] iOS native module links correctly after prebuild (`pod install` succeeds)

## Blocked by

- [#3 Example app scaffold + config plugin](https://github.com/launchbox-tech/expo-veepoo-sdk/issues/3)
