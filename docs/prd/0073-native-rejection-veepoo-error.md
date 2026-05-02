# 73 — PRD: Native rejection normalization to `VeepooError` (JS bridge)

> GitHub: https://github.com/launchbox-tech/expo-veepoo-sdk/issues/73
> Status: open | Labels: needs-triage, enhancement

## Problem Statement

Host applications using `VeepooSDK` need **stable, branchable `VeepooError.code` values** when a native `AsyncFunction` rejects—especially during an active **Session** (e.g. realtime-test **mutex**, **capability unsupported**, **device not ready**). Today, many JavaScript `catch` paths call generic handling that does not consistently **read the native rejection’s code**, so correct native errors are often surfaced as **`UNKNOWN`** or overridden by a **fixed** code that does not match what iOS and Kotlin actually sent. That forces fragile string parsing in app code and undermines the contract documented in **ADR 0003** and **`CONTEXT.md`**.

## Solution

Implement a **single normalization path** for failures originating from **`await` native module methods**: parse the Expo/native rejection shape (code + message), **map** native string codes into **`VeepooErrorCode`** using an explicit **alias table** (hybrid policy: branch-worthy codes stay distinct; opaque failures map to **`OPERATION_FAILED`**), optionally attach **`nativeCode`** when aliasing, then integrate with existing **`handleError`** / `error` event emission. **Validators** and pure TypeScript preflight checks remain **outside** this mapper. Align shipped behaviour with **ADR 0003**.

## User Stories

1. As a host-app developer, I want **promise rejections** from `VeepooSDK` methods to expose **`VeepooError.code`** that reflects **mutex**, **unsupported capability**, and **Session eligibility** when native sent those codes, so that I can branch without parsing free text.
2. As a host-app developer, I want **`REALTIME_TEST_IN_PROGRESS`** from native to appear as **`REALTIME_TEST_IN_PROGRESS`** on the JS error, so that my UI matches native intent.
3. As a host-app developer, I want **`CAPABILITY_UNSUPPORTED`** from native to survive the bridge unchanged when native uses that code, so that I can show modality-specific help.
4. As a host-app developer, I want **`DEVICE_NOT_READY`** and **`DEVICE_NOT_CONNECTED`** from native to map cleanly to **`VeepooError`**, so that I can prompt reconnect or wait-for-ready flows.
5. As a host-app developer, I want **vendor-opaque** failures (e.g. start/stop/read path failures with embedded vendor detail) to map to **`OPERATION_FAILED`** with the **full message** preserved, so that support logs stay useful.
6. As a host-app developer, I want an optional **`nativeCode`** on **`VeepooError`** when the bridge **collapses** a native string into a public bucket, so that Sentry and internal tools retain the original label.
7. As a host-app developer, I want **`nativeCode` omitted** when the public code **equals** the native code, so that I do not see redundant fields.
8. As a host-app developer, I want rejections **without** a parseable native code to use **`UNKNOWN`** with the original message, so that I can still show a fallback string.
9. As a host-app developer, I want the **`error` event** payload to include **`nativeCode`** when set, so that my global error handler can log it.
10. As a host-app developer, I want **iOS and Android** to produce the **same JS behaviour** for the same native code strings after mapping, so that I maintain one integration path.
11. As a support engineer, I want **messages** from native to remain on **`VeepooError.message`**, so that tickets include vendor context.
12. As an SDK maintainer, I want a **single module** (pure function or small file) that owns **code mapping**, so that new native `reject("…")` strings are reviewed in one place.
13. As an SDK maintainer, I want **Jest unit tests** with **fixtures** representing typical Expo error shapes, so that refactors do not regress mapping.
14. As an SDK maintainer, I want **validator-thrown** errors to **bypass** the native mapper, so that **`INVALID_ARGUMENT`** and similar are not double-mapped.
15. As an SDK maintainer, I want **`handleError`** to accept mapped **`VeepooError`** inputs without losing **`nativeCode`**, so that logging and the `error` event stay consistent.
16. As a host-app developer, I want **connect** / **disconnect** failures to use mapped codes when native sends **`CONNECTION_FAILED`**-style labels, so that my retry logic keys off `code`.
17. As a host-app developer, I want **permission** flows to remain correct: if native encodes permission denial in a structured way, it should map to **`PERMISSION_DENIED`** when that is the intended semantic, without blindly forcing **`PERMISSION_DENIED`** on every catch in that method.
18. As a host-app developer, I want **no message substring heuristics** in v1, so that behaviour stays predictable across locales and SDK versions.
19. As a host-app developer, I want **TypeScript** to list **`nativeCode?`** on **`VeepooError`**, so that autocomplete documents the field.
20. As a product owner, I want this work **traceable** to **ADR 0003** and **`CONTEXT.md`**, so that future changes do not re-open closed design decisions.
21. As a host-app developer, I want **documented** which native strings map to **`OPERATION_FAILED`**, so that I know what requires message inspection versus `code` branching.
22. As an SDK maintainer, I want **release notes** for consuming apps describing **`nativeCode`** and mapping behaviour, so upgrades are smooth.
23. As a QA engineer, I want **automated tests** to cover at least one **iOS-shaped** and one **Android-shaped** rejection fixture, so cross-platform parity is guarded.
24. As a host-app developer, I want **Bluetooth / scan** failures to benefit from mapping where native supplies stable codes, so that connectivity UX is consistent.
25. As an SDK maintainer, I want **minimal churn** in native Kotlin/Swift for this PRD—the fix is primarily **JavaScript**, unless discovery shows Expo passes codes only after native changes.
26. As a host-app developer, I want **`deviceId`** on **`VeepooError`** preserved when passed through mapping, so Session-scoped errors remain attributable.
27. As an accessibility-minded developer, I want **stable codes** for screen-reader-friendly error summaries keyed off **`code`**, not vendor prose.
28. As an SDK maintainer, I want the **example app** (optional, small) to log **`nativeCode`** when present in the vitals lab error path, so hardware verification matches production shaping.
29. As a security-conscious reviewer, I want **no new PII** in **`nativeCode`**—only short symbolic labels already emitted by native.
30. As a downstream SDK consumer, I want **semver clarity**: additive **`nativeCode?`** is non-breaking for typed clients.

## Implementation Decisions

- **Normative spec:** Follow **ADR 0003** (authority order: parse native → map → fallback; hybrid public codes; **`nativeCode`** rules; no message heuristics; mapper scope = native **`await` only**).
- **Deep module:** Introduce a **single pure mapping module** at the JavaScript seam that turns **unknown thrown values** from Expo into **`VeepooError`**. Its interface stays small: input = thrown value + optional contextual fallback code / `deviceId`; output = **`VeepooError`**. Alias table lives **inside or beside** this module for **locality**.
- **`VeepooSDK` integration:** Every **`catch`** around **`await this.native…`** should route native failures through the mapper **before** emitting/logging. Method-specific fallbacks apply **only** when the mapper reports no usable native code (per ADR).
- **Types:** Extend **`VeepooError`** with optional **`nativeCode`**. Ensure **`VeepooErrorCode`** covers all **branch-worthy** native strings used today, or explicitly alias into **`OPERATION_FAILED`** / existing codes—avoid unbounded growth by bucketing opaque vendor failures.
- **Validators:** Unchanged contract; throws **`VeepooError`** shapes that bypass the native mapper (detect **`VeepooError`**-shaped objects if needed to avoid re-mapping).
- **Logging:** Existing structured logging should include **`nativeCode`** when present without leaking larger payloads.
- **Documentation:** Update **release notes** and optionally **vendor parity matrix** “Logging & errors” row if it mentions unified errors.
- **Naming:** Public API names remain **`VeepooSDK`**, **`VeepooError`** per ADR 0001 naming discipline.

## Testing Decisions

- **Good tests** assert **observable outputs**: given representative **thrown** objects (Expo/React Native error shapes), the mapper produces the expected **`code`**, **`message`**, and conditional **`nativeCode`**. Tests do **not** assert internal table layout or private function names.
- **Modules under test:** The **pure mapping module** is fully unit-tested; **`handleError`** integration may be covered by focused tests or mapper tests plus manual verification that **`emitLocal('error')`** receives the enriched shape (prior art: existing **`VeepooSDK`** tests where feasible; known RN mock limitations may constrain full-class tests).
- **Prior art:** **`src/__tests__/normalizers.test.ts`** for pure transforms with fixtures; validators tests for **`VeepooError`** shapes.

## Out of Scope

- Changing native **`promise.reject`** strings on iOS/Android unless discovery proves Expo cannot surface codes otherwise.
- Message **locale** detection or **i18n** of vendor strings.
- **Substring heuristics** on error messages (explicitly deferred past v1).
- Automatic retries or Session recovery UX.
- Replacing **`VeepooSDK`** class with multiple facades (separate architecture PRD).

## Further Notes

- Domain language: **Band**, **Session**, **Pairing**, **Band Discovery** per **`AGENTS.md`**.
- Parent context: **`CONTEXT.md`** (Bridge errors), **`docs/adr/0003-native-rejection-to-veepoo-error.md`**.
- **Device tested:** Not required for merge; mapping is JS-only and validated by unit tests; optional manual check with dev build + intentional native rejection.
- **Child issues:** [#74](https://github.com/launchbox-tech/expo-veepoo-sdk/issues/74) → [#75](https://github.com/launchbox-tech/expo-veepoo-sdk/issues/75) → [#76](https://github.com/launchbox-tech/expo-veepoo-sdk/issues/76).
