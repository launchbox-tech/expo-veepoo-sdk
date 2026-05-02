# 101 — feat(device): Dial / watch face management — bridge stub (#95)

> GitHub: https://github.com/launchbox-tech/expo-veepoo-sdk/issues/101
> Status: open | Labels: ready-for-human (device verify)

## Parent

[#95 — PRD: Pre-feature checklist closure](https://github.com/launchbox-tech/expo-veepoo-sdk/issues/95) · [#59 — Vendor upstream tracking & parity](https://github.com/launchbox-tech/expo-veepoo-sdk/issues/59)

## What to build

**Dial / screen-style slice:** read and set the Band’s active **dial category** (`default` | `market` | `photo`) and **slot index** (`screenIndex`). Related `DeviceFunctions` hints: **`screenStyleFunction`**, **`aiDial`**, **`videoDial`**.

**Out of scope (not this issue):** marketplace sync, custom photo dial **file transfer**, video dial assets — vendor APIs exist (`JLWatchFaceManager`, etc.) but are not exposed on `VeepooSDK`.

**Session** eligibility and error mapping follow **CONTEXT.md** and **ADR 0003**. Host apps gate UI with **`readDeviceFunctions()`** and native `isSupportScreenStyle` / capability checks (`CAPABILITY_UNSUPPORTED` when unsupported).

## Acceptance criteria

- [x] Vendor entry points: Android `readScreenStyle` / `settingScreenStyle` (`VpSpGetUtil.isSupportScreenStyle`); iOS `veepooSDKSettingDeviceScreenStyle` (`VPDeviceDialType`).
- [x] Public JS API + Kotlin + Swift: `readWatchFaceStyle`, `setWatchFaceStyle`.
- [x] Types, validators, normalizers, and unit tests.
- [x] `docs/vendor-api/vendor-parity-matrix.md` updated.
- [x] `npm run typecheck` and tests green (CI).

## Blocked by

None — stub; **implementation order** follows **CONTEXT.md** delivery sequence (Group **C** personalization before higher-risk **D** work; Android Bluetooth control last). Coordinate with maintainers before starting if another open issue already owns this slice.
