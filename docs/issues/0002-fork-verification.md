# Issue #2: Fork verification — install + compile

> GitHub: https://github.com/launchbox-tech/expo-veepoo-sdk/issues/2
> Status: open | Type: AFK | Blocked by: none

## Parent

[#1 Initial setup: verify fork builds + create example app](https://github.com/launchbox-tech/expo-veepoo-sdk/issues/1)

## What to build

Verify the forked repo builds cleanly from a fresh clone. Run `npm install` to confirm all JS dependencies resolve, `tsc --noEmit` to confirm the TypeScript layer compiles with zero errors, and manually inspect the native artifact directories to confirm Android AARs (`android/libs/*.aar`) and iOS frameworks (`ios/Frameworks/*.framework`) are present and referenced correctly in `build.gradle` and `VeepooSDK.podspec`.

## Acceptance criteria

- [ ] `npm install` completes without errors
- [ ] `tsc --noEmit` passes with zero type errors
- [ ] Android `libs/*.aar` files are present and referenced in `build.gradle`
- [ ] iOS `Frameworks/*.framework` files are present and referenced in `VeepooSDK.podspec`
- [ ] `normalizers.test.ts` passes with `npm test`

## Blocked by

None — can start immediately.
