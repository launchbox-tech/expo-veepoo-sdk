# 102 — feat(health): Body composition — bridge (#95)

> GitHub: https://github.com/launchbox-tech/expo-veepoo-sdk/issues/102
> Status: open | Labels: ready-for-human (device verify)

## Parent

[#95 — PRD: Pre-feature checklist closure](https://github.com/launchbox-tech/expo-veepoo-sdk/issues/95) · [#59 — Vendor upstream tracking & parity](https://github.com/launchbox-tech/expo-veepoo-sdk/issues/59)

## What to build

**Manual body-composition test** on the Band: **`startBodyCompositionTest` / `stopBodyCompositionTest`** with progress and results on **`bodyCompositionTestResult`**. Gate with **`readDeviceFunctions().bodyComponent`** (and native support checks).

**Android:** `VPOperateManager.startDetectBodyComponent` / `stopDetectBodyComponent`; `VpSpGetUtil.isSupportBodyComponent`.

**iOS:** `veepooSDKTestBodyCompositionStart` / stop via `start(false,…)`; `peripheralModel.bodyCompositionType`.

**Out of scope:** Android `readBodyComponentData` / ID list, iOS `veepooSDKGetDeviceOffStoreBodyCompositionWithDate`, marketplace / private-mode extras.

## Acceptance criteria

- [x] Vendor entry points documented in parity matrix.
- [x] Public JS API + Kotlin + Swift for start/stop + event.
- [x] Types, normalizers, unit tests, `bridge-contract/veepoo-events.json` updated.
- [x] Minimal `example/` HealthTest card.
- [x] `npm run typecheck` and tests green.

## Blocked by

None.
