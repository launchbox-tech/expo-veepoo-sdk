# 66 — PRD: Realtime vitals (HRV, ECG, fatigue, breathing) JS parity

> GitHub: https://github.com/launchbox-tech/expo-veepoo-sdk/issues/66
> Status: open | Labels: needs-triage

## Problem Statement

The companion app cannot drive several realtime health measurements that the vendor Veepoo/HBand SDKs already support on-device. Those capabilities appear in vendor documentation and vendored binaries, but they are listed under **Not exposed in JS** in the vendor parity matrix: **HRV**, **ECG**, **fatigue**, and **breathing** realtime tests. Without JavaScript methods and typed events on `VeepooSDK`, a host app cannot offer guided vitals flows during an active **Session** or interpret results in a consistent, cross-platform way. Apps are forced to fork native code or ship without these features.

## Solution

Add **realtime manual test** APIs on `VeepooSDK` for HRV, ECG, fatigue, and breathing, mirroring the existing pattern used for heart rate, blood pressure, blood oxygen, temperature, stress, and glucose tests: imperative **start** / **stop** calls plus structured **`VeepooEvent`** result payloads. Ship **both iOS and Android** implementations in **one change**, enforce **at most one active realtime test** at a time across **all** test types, surface **stable error codes** when a test cannot start, and use a **two-tier ECG contract** (summary always; waveform only when explicitly requested). Update the **vendor parity matrix**, **release notes**, and the **example app** with minimal controls so maintainers can validate behavior on a physical **Band**.

## User Stories

1. As a host-app developer, I want to **start and stop an HRV realtime test** from JavaScript during a Session, so that my UI can guide the user through an on-demand HRV measurement.
2. As a host-app developer, I want **`hrvTestResult`** (or equivalent) events with a **normalized TypeScript shape**, so that I can display results without platform-specific parsing.
3. As a host-app developer, I want to **start and stop an ECG realtime test**, so that compatible Bands can record an ECG-style measurement from the app.
4. As a host-app developer, I want **ECG results to include a compact summary by default** (e.g. outcome, duration, key metrics the vendor exposes), so that typical wellness UX stays efficient on the bridge.
5. As a host-app developer, I want to **opt in to waveform-level ECG data** via an explicit option (e.g. `includeWaveform`), so that I only pay serialization and memory costs when I need raw samples.
6. As a host-app developer, I want **waveform delivery** to be documented if it is **chunked or batched**, so that I can reassemble or throttle handling on the JS side.
7. As a host-app developer, I want to **start and stop a fatigue realtime test**, so that users with Bands that support fatigue measurements can run them from the app.
8. As a host-app developer, I want to **start and stop a breathing realtime test** (or vendor-equivalent respiratory coaching/measurement flow), so that breathing exercises or measurements are available where supported.
9. As a host-app developer, I want **fatigue** and **breathing** result events that match the same mental model as other realtime tests, so that my state machines stay consistent.
10. As a host-app developer, I want **`start*Test` to reject with stable `VeepooError` codes** when the Band does not support a capability, so that I can show specific UX instead of parsing vendor strings.
11. As a host-app developer, I want **`start*Test` to reject with a stable code** when another realtime test is already running (including HR/BP/SpO₂/stress/glucose), so that double taps and race conditions are handled predictably.
12. As a host-app developer, I want **`start*Test` to fail clearly** when there is no active Session or the Session is not ready for tests, so that I can prompt reconnect or wait for readiness.
13. As a host-app developer, I want **human-readable error messages** alongside codes, with vendor diagnostics preserved where useful, so that logs remain actionable for support.
14. As a host-app developer, I want **the same method names and events on iOS and Android**, so that I write one integration path.
15. As a host-app developer, I want **public names that align with existing capability flags** (e.g. HRV/ECG naming consistent with `hrvFunction` / `ecgFunction`), so that documentation and code read coherently.
16. As a host-app developer, I want **`stop*Test` to be safe to call** when idle or after completion, so that cleanup buttons do not crash or hang.
17. As an end user, I want the app to avoid starting **two measurements at once**, so that the Band is not overloaded or left in an ambiguous state.
18. As an SDK maintainer, I want a **single coordinating implementation** for “one active realtime test” shared across new and existing tests, so that behavior does not diverge per modality.
19. As an SDK maintainer, I want **native handlers** that map vendor callbacks to **typed events** emitted through the existing event pipeline, so that normalization and logging stay centralized.
20. As an SDK maintainer, I want **parity matrix rows** moved from the backlog section into the realtime health tests section with accurate **Status** and **Device tested** fields, so that consumers trust the inventory.
21. As an SDK maintainer, I want a **release notes** entry describing new APIs and any breaking considerations, so that consuming apps can plan upgrades.
22. As an SDK maintainer, I want the **example app** updated with a minimal “lab” area to start/stop each new test and view emitted events and errors, so that hardware verification is straightforward.
23. As a QA engineer, I want **merge criteria** that do not require a Band for every merge: CI and builds green while **Device tested** remains **TBD** until hardware passes, so that integration work is not blocked.
24. As a product owner, I want **optional stricter release gating** (e.g. tag only after on-device sign-off) to remain a **process choice**, not a hard merge blocker, so that velocity and risk management stay balanced.
25. As a host-app developer, I want **capability discovery** via existing **`readDeviceFunctions`** / `deviceFunction` data where applicable, so that I can hide unsupported tests before calling `start`.
26. As an SDK maintainer, I want **Partial** status in the matrix only when one platform’s vendor SDK truly lacks an equivalent API, with that called out in text, so that honesty about gaps is preserved.
27. As a host-app developer, I want **progress or intermediate events** if the vendor emits them for long-running tests, so that UI can show live feedback when available.
28. As a host-app developer, I want **completion and failure** to be distinguishable on each result event, so that I can end spinners and show retry affordances.
29. As an SDK maintainer, I want **logging** to follow existing structured categories for tests, so that diagnostics remain grep-friendly.
30. As a host-app developer, I want **deviceId** on emitted events where consistent with other realtime tests, so that multi-device future-proofing stays aligned.
31. As an SDK maintainer, I want **normalizers** for any nested vendor payloads, so that minor SDK shape differences do not leak to TypeScript consumers.
32. As a security-conscious developer, I want **ECG waveform** to remain **off by default**, so that sensitive data is not accidentally streamed.
33. As a host-app developer, I want **TypeScript types** exported for new options and results, so that autocomplete documents fields.
34. As an SDK maintainer, I want **no new vendor binary drift** unless upgrading SDKs; if binaries change, **vendor manifest** procedures are followed, so that provenance stays traceable.
35. As a documentation reader, I want **upstream wiki links** referenced from the matrix as today, so that deep dives remain one click away.

## Implementation Decisions

### Scope

- **In scope:** Realtime **manual** tests for **HRV**, **ECG**, **fatigue**, and **breathing** only.
- **Explicitly out of this PRD:** Historical or sync **origin HRV** streams and related read pipelines (separate historical-parity work). Other matrix backlog items (**OTA/DFU**, watch faces, server dial transfer, body composition, women’s health, weather push, contacts/SOS, AGPS, music/camera remote, platform extras) remain future verticals.

### Public API contract

- Imperative methods following existing realtime-test conventions: **start** / **stop** pairs with **Promise** semantics aligned with current tests.
- **Naming (camelCase, embedded acronyms):** `startHrvTest` / `stopHrvTest` with **`hrvTestResult`**; `startEcgTest` / `stopEcgTest` with **`ecgTestResult`** and optional arguments for **waveform opt-in**; `startFatigueTest` / `stopFatigueTest` with **`fatigueTestResult`**; `startBreathingTest` / `stopBreathingTest` with **`breathingTestResult`**.
- **ECG:** Always emit **summary-class results** suitable for default UX; include **waveform or rich sample data only when explicitly opted in**, with documented behavior if the vendor streams large payloads (including chunking strategy if needed).

### Session and concurrency

- Only callable when a **Session** exists and the module considers the connection eligible for tests (consistent with existing tests).
- **Globally single active realtime test:** Starting any test while another realtime test (existing or new) is active must fail with the **same stable error code** for “already running,” implemented in the module layer so JS behavior is predictable.

### Errors

- Extend or use **`VeepooError`** (and the **`error` event** path where applicable) with **stable, documented codes** for: unsupported capability, test already running, session not ready / not connected, invalid arguments, and vendor-reported failure where mapped.
- Preserve **vendor detail** in message or structured **details** without forcing apps to parse strings for common branches.

### Platforms

- **iOS and Android** must both expose the same JS surface **before merge**, unless a documented **Partial** exception applies for a missing vendor API on one side.

### Documentation and artifacts

- Update the **vendor parity matrix** to reflect new methods/events and status; keep **Device tested** as **TBD** until verified on hardware.
- Add **release notes** entry per project conventions.
- Update **example app** with minimal UI to exercise each new test and observe events/errors.

### Modular structure

- **JavaScript layer:** Native module interface declarations, public SDK class methods, exported types, and event typing extensions.
- **Event pipeline:** Normalizers map vendor/native shapes to stable TS types before consumers see them.
- **Native modules:** iOS and Kotlin handlers wiring vendor start/stop APIs and delegates/listeners into Expo promises and events.
- **Realtime test coordinator:** A single abstraction (conceptually) for tracking which test is active and translating conflicts into stable errors—implemented consistently on both platforms and mirrored where appropriate in JS to avoid duplicate starts before hitting native code.

Deep-module opportunity: a small **realtime test guard** component that encapsulates mutex rules and error mapping behind a narrow interface; JS-level portions can be unit-tested without hardware.

## Testing Decisions

- **Good tests** assert **observable behavior**: normalized event shapes, error codes on rejected promises, and option handling—**not** internal native call order or private flags.
- **JavaScript:** Unit tests for **normalizers** and any **validation** of start options (prior art: existing normalizer tests for health events). If error-code mapping is centralized in pure functions, test those mappings with representative vendor payloads.
- **Integration:** Native behavior verified via **example app** on a physical **Band**; matrix **Device tested** updated when verification is recorded.
- **Out of Jest scope:** Native Kotlin/Swift integration tests in CI unless the repo already runs such suites for comparable features.

**Recommended test modules:** Event normalizers for the four new result types (and ECG variants with/without waveform); optional pure helpers for mutex/eligibility if extracted from the SDK class.

## Out of Scope

- Origin/sync **HRV history** and listing pipelines not framed as realtime manual tests.
- **OTA/DFU**, dial/watch faces, body composition, women’s health, weather push, contacts/SOS, AGPS, music/camera remote, toggling OS Bluetooth, and other backlog bullets from the parity matrix.
- Automatic reconnection or retries after Session loss (host app owns reconnection per project decisions).
- Changing vendor binaries unless required for these APIs; if binaries change, follow **vendor manifest** maintenance rules.

## Further Notes

- Domain language: use **Band**, **Session**, **Band Discovery**, **Pairing** per project glossary; avoid “watch,” “connection” for Session, etc.
- Naming of `VeepooSDK`, `VeepooDevice`, `VeepooError` remains unchanged per ADR 0001.
- Tracking: **one issue, one delivery unit** for this vertical; optional checklist in the issue body per modality for execution clarity.
- Merge expectation: **green CI** and successful builds including **example**; **Device tested** stays **TBD** until hardware verification; product teams may apply stricter release tagging separately.
