# Android social-message capabilities are always "unsupported" — toSupportedStatus cannot read the vendor's enum

**Issue:** #212
**Status:** Open
**Labels:** bug, ready-for-agent

## What to build

`toSupportedStatus(value: Any?)`
([VeepooSDKModuleHelpers.kt:98](../../android/src/main/kotlin/expo/modules/veepoo/VeepooSDKModuleHelpers.kt))
branches on `is Boolean` / `is Number` / `is String` and falls through to
`else -> "unsupported"`. Its only remaining callers are the 13 fields of
`FunctionSocailMsgData` read in
[VeepooSDKModuleSocialMsgRead.kt:44-56](../../android/src/main/kotlin/expo/modules/veepoo/VeepooSDKModuleSocialMsgRead.kt).

`javap` on `android/libs/vpprotocol-2.3.80.15.aar` shows every field of that
class is the `EFunctionStatus` **enum**, which matches none of the three
branches. So `readSocialMsgData` returns `"unsupported"` for all 13 channels on
Android whatever the band reported — the value never depends on the input.

iOS is fine: `parseSocialMsgData` decodes the ANCS bytes to real
`open`/`close`/`unsupported` under the same keys. This is a **value**
disagreement between platforms, not a key one — unlike #210.

Fix: use `toFunctionStatus` (added in #210, same file), delete the now-callerless
`toSupportedStatus`, and add a contract check that the 13 keys stay agreed
across the iOS literal, the Kotlin literal and `supportedFunctionKeys` in
[social-msg.ts](../../src/capabilities/social-msg.ts). Do **not** assert the two
platforms share a value vocabulary — they legitimately don't.

## Acceptance criteria

- Android `readSocialMsgData` returns a value that depends on what the band
  reported, for all 13 channels. **Met** — `bun run check:android-function-status`
  compiles [VeepooFunctionStatus.kt](../../android/src/main/kotlin/expo/modules/veepoo/VeepooFunctionStatus.kt)
  against vpprotocol's own classes and runs it: all 5 vendor constants map to 5
  distinct statuses, and each of the 13 channels is driven on its own so a
  crossed field fails too.
- `toSupportedStatus` is gone, with no remaining callers. **Met.**
- A test fails if the 13 keys ever drift between iOS, Android and the JS list.
  **Met** — and the check now also fails if a channel stops going through
  `toFunctionStatus`, or if two channels read the same vendor field.
- Verified against a real band (**outstanding** — `readSocialMsgData` rejects on
  the simulator, and this needs an Android handset, not the paired iPhone).

## Notes

The issue predicted that a channel the band does not report would now yield
`"unknown"` where it previously yielded `"unsupported"`. Measured against
vpprotocol-2.3.80.15, that is narrower than stated: `FunctionSocailMsgData`
seeds all 26 of its own fields to `UNSUPPORT`, so a field the vendor's parser
never writes still reads back `"unsupported"`. `"unknown"` reaches JS only when
the band's byte decodes to `UNKONW`, or a null reaches the mapper. The check
pins that vendor default, so a vendor bump that changes it fails here rather
than in a consumer branching on `=== 'unsupported'`.

Full body: <https://github.com/launchbox-tech/expo-veepoo-sdk/issues/212>
