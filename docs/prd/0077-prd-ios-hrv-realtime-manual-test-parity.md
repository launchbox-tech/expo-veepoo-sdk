# 77 — PRD: iOS HRV realtime manual test parity with Android

**GitHub:** https://github.com/launchbox-tech/expo-veepoo-sdk/issues/77  
**Status:** open  
**Labels:** needs-triage (sync from GitHub)

## Problem Statement

Host apps that ship a single cross-platform **Session** experience cannot offer one consistent **HRV manual realtime test** flow: **Android** already drives the vendor path and emits **`hrvTestResult`**, while **iOS** rejects **`startHrvTest`** with **`CAPABILITY_UNSUPPORTED`** because this bridge does not bind a matching realtime API in the current Veepoo iOS bundle. Product teams either fork native code, ship Android-only HRV tests, or duplicate UX branches—none of which matches the **vendor parity matrix** goal of aligned **`VeepooSDK`** behavior across platforms.

## Solution

Deliver **iOS native bindings** for the realtime HRV manual test (or an explicitly documented, reviewed alternative) so that **`startHrvTest` / `stopHrvTest`** succeed when the **Band** and **vendored VeepooBleSDK** support the modality, emitting **`hrvTestResult`** payloads that match the existing TypeScript contract and normalizers. Where the upstream SDK truly exposes no compatible entry point, produce a **maintainer decision** captured in the PRD outcome (close as wont-fix with matrix justification) rather than leaving an indefinite **`CAPABILITY_UNSUPPORTED`** stub.

## User Stories

1. As a host-app developer, I want **`sdk.startHrvTest()`** on **iOS** to start the vendor HRV manual test when the **Band** supports it, so that I do not maintain platform-specific code paths for the same button.
2. As a host-app developer, I want **`sdk.stopHrvTest()`** on **iOS** to stop the test and release the realtime mutex, so that **Pairing** / **Session** flows match Android behavior.
3. As a host-app developer, I want **`hrvTestResult`** events on **iOS** to include **`state`**, **`progress`**, and **`value`** (and optional aliases) consistent with **Android**, so that my UI state machine stays one implementation.
4. As a host-app developer, I want failures to surface as **`VeepooError`** codes (**`CAPABILITY_UNSUPPORTED`**, **`DEVICE_NOT_CONNECTED`**, **`REALTIME_TEST_IN_PROGRESS`**, etc.) per **ADR 0003**, so that error UX matches other realtime tests.
5. As a host-app developer, I want the **example app** Vitals lab to run HRV on **iOS** without special-casing, so that smoke-testing mirrors production apps.
6. As an SDK maintainer, I want **`docs/vendor-parity-matrix.md`** updated so the HRV row moves from **Partial** to **Shipped** for both platforms when iOS is implemented, so that consumers trust the matrix.
7. As an SDK maintainer, I want **`docs/release-notes/`** and version metadata bumped for consuming apps that install from GitHub.
8. As an SDK maintainer, I want research notes (vendor symbols, delegate/listener names, payload shapes) recorded in the issue or PR description, so AFK agents and future maintainers know which APIs were bound.
9. As a tester, I want a physical **Band** verification checklist for **iOS** HRV (start, progress, stop, mutex conflict), so regressions are caught before merge.
10. As a product owner, I want explicit **out-of-scope** boundaries if iOS cannot support realtime HRV (e.g. recommend historical sync only), so expectations are clear in the matrix **Further notes**.

## Implementation Decisions

- **Modules:** Extend the **iOS Expo native module** that already owns vitals (**mutex**, **`hrvTestResult`** registration, **`startHrvTest` AsyncFunction**). Reuse the shared **JavaScript** **`VeepooSDK`** surface—no public API renames.
- **Contracts:** **`HrvTestResult`** and **`normalizeEventPayload('hrvTestResult')`** remain authoritative; iOS emissions must normalize cleanly without one-off JS forks.
- **Mutex:** Reuse the same **single active realtime test** policy as **PRD #66** / issue **#67** — kind **`hrv`** must participate identically on iOS and Android.
- **Errors:** Native rejects flow through **`mapNativeRejection`** / **`VeepooError`** policy (**ADR 0003**); preserve **`CAPABILITY_UNSUPPORTED`** only when the **Band** or SDK genuinely cannot perform the test.
- **Vendor discovery:** Phase 0 is **research** against **VeepooBleSDK** headers and iOS wiki: identify **`VPPeripheralManage`** (or equivalent) selectors for HRV manual test, callback types, and terminal conditions—mirror the Android loop semantics where possible.
- **Deep module:** Keep **payload normalization** in the existing **pure TypeScript normalizer**; keep **native** thin (events + start/stop only).

## Testing Decisions

- **Good tests** assert **observable contracts**: event payload shapes after **`normalizeEventPayload`**, **`VeepooError.code`** on rejection paths, and **mutex** behavior via existing **VeepooSDK** patterns—not internal Swift selector names.
- **Unit tests:** Extend **normalizers** / existing **Jest** fixtures if new raw payload variants appear from iOS.
- **Integration:** **Physical Band** on **iOS** required before marking **Device tested** in the matrix; document pass/fail in the PR.
- **Prior art:** **`hrvTestResult`** normalizer tests; Android HRV loop in **Kotlin** vitals helpers; **iOS** patterns from **ECG / fatigue / breathing** vitals handlers.

## Out of Scope

- Changing **Android** HRV implementation unless required for payload alignment.
- **Historical HRV** sync / origin data pipelines (unless needed only as documented fallback when realtime is impossible).
- **OTA / DFU**, watch faces, or other **Not in JS** backlog items from the matrix.
- Renaming public **`VeepooSDK`** methods or events.

## Further Notes

- **Domain language:** Use **Band**, **Session**, **Band Discovery**, **Pairing** per **AGENTS.md**; avoid “watch” / “peripheral” in user-facing copy.
- **Matrix maintenance:** After merge, update **`docs/vendor-parity-matrix.md`** HRV row and **Further notes** (remove or narrow the iOS-only unsupported bullet).
- If research proves no suitable iOS API in the pinned framework version, the outcome should be an explicit **ADR or matrix decision** rather than an eternal stub.

## Research outcome (issue #78)

**Decision:** **No-go** for iOS realtime HRV manual test parity with the current pinned **VeepooBleSDK** headers: there is no public API mirroring Android `readDeviceManualData` + `DeviceManualDataType.HRV`. Historical HRV remains available via native sync/read paths; **`startHrvTest`** on **iOS** (device) continues to reject **`CAPABILITY_UNSUPPORTED`** with a message that points consumers to **`docs/vendor-parity-matrix.md`**. Full symbol inventory and Android delta are recorded in **`docs/issues/0078-feat-ios-hrv-realtime-vendor-research-go-no-go.md`** and the matrix **Further notes**.
