# 78 — feat(ios): HRV realtime — vendor research & go/no-go (#77)

**Status:** closed (sync from GitHub)  
**Labels:** _(none)_

> https://github.com/launchbox-tech/expo-veepoo-sdk/issues/78

## Parent

[#77 — PRD: iOS HRV realtime manual test parity with Android](https://github.com/launchbox-tech/expo-veepoo-sdk/issues/77)

## What to build

End-to-end **research slice** only: inventory **VeepooBleSDK** (headers, **VPPeripheralManage** or equivalent) and vendor wiki for a **realtime HRV manual test** API compatible with existing **`startHrvTest` / `stopHrvTest`** and **`hrvTestResult`** expectations. Deliver a **go/no-go** outcome: either a concrete binding plan (selectors, callback types, terminal states, mutex interaction) or a documented **no suitable API** conclusion with proposed **matrix Further notes** / optional **ADR** text so we do not leave an indefinite **`CAPABILITY_UNSUPPORTED`** stub without explanation.

## Acceptance criteria

- [x] Written finding posted on **#77** or this issue (symbols, links to wiki/header sections, iOS vs Android delta).
- [x] Explicit **go** (implementation can proceed) or **no-go** (documentation/ADR path) with rationale tied to vendored framework version.
- [x] If **no-go**: draft bullet list for **vendor-parity-matrix.md** and PRD **Further notes** (historical HRV / Android-only test, etc.).

## Research outcome — **no-go** (2026-05-02)

**Android (reference):** `VeepooSDKModuleHelpers.startHrvManualReadLoop` → `VPOperateManager.readDeviceManualData` with `DeviceManualDataType.HRV`, `onHrvManualDataChange`, reschedule on `onReadComplete` / `onReadFail`.

**iOS (vendored `VeepooBleSDK.framework` headers in-repo):**

| Area | Finding |
|------|--------|
| Manual test data enum | `VPPublicDefine.h` — `VPManualTestDataType`: `BloodPressure`, `HeartRate`, `All` only; **no HRV bit**. |
| Manual read API | `VPPeripheralBaseManage.readManualTestDataWithTimestamp:dataType:result:` → `VPManualTestDataModel` (BP array in header). Not analogous to Android HRV stream. |
| HRV-specific APIs | `veepooSdkStartReadDeviceHrvData`, `veepooSDK_readHrvDataWithDayNumber` (commented 不可用) — **historical / sync**, not app-started realtime manual test. |
| Other vitals pattern | Explicit `*TestStart` exists for stress, temperature, heart, SpO₂, ECG, fatigue, breathing, etc.; **no `TestHrv` / `hrvTestStart`**. |
| Micro-test | `veepooSDKMicroTestOpenState` / `veepooSDKMicroTestManualMeasurement` expose multi-vital micro checkup models with an `hrv` field; **not** a documented substitute for Android’s dedicated manual HRV detect loop and would change device UX semantics. |

**Conclusion:** Issue **#79** (native iOS bridge for parity) is **blocked** until the vendor documents an iOS API equivalent to `readDeviceManualData(HRV)` or this repo upgrades to a framework version that adds one. Maintainer-facing detail lives in **`docs/vendor-parity-matrix.md`** (HRV Further notes) and **`docs/prd/0077-...md`** (Research outcome).

## Blocked by

None - can start immediately
