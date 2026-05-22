# refactor(ios): split VeepooSDK.swift AsyncFunction surface into per-feature extensions

**Issue:** #194
**Status:** Open
**Labels:** enhancement

## What to build

[`ios/VeepooSDK/VeepooSDK.swift`](../../ios/VeepooSDK/VeepooSDK.swift) (~1295 lines) registers dozens of `AsyncFunction`s in one body. Move registrations into `VeepooSDKModule+<Feature>.swift` extensions (mirror Android hub pattern: [`VeepooSDKModule.kt`](../../android/src/main/kotlin/expo/modules/veepoo/VeepooSDKModule.kt)).

Target: `VeepooSDK.swift` is **wiring-only** (constants, module skeleton, shared imports), **under ~300 lines**.

## Acceptance criteria

- `VeepooSDK.swift` under **~300 lines** (or document why not + follow-up issue).
- No behavior or export name changes; Expo contract unchanged.
- iOS build / example app linking still works.
