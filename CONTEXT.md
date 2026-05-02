# Domain context (expo-veepoo-sdk)

Vocabulary for **Band**, **Session**, **Band Discovery**, and **Pairing** follows **`AGENTS.md`** / **`CLAUDE.md`**.

**ADR:** Native rejection → `VeepooError` policy is recorded in **[`docs/adr/0003-native-rejection-to-veepoo-error.md`](docs/adr/0003-native-rejection-to-veepoo-error.md)**.

## Bridge errors

**Normalized rejection:** When a native `AsyncFunction` rejects, the JavaScript layer treats the native-provided error code (when present and parseable) as **authoritative**: it is mapped into `VeepooErrorCode` (or an explicit alias) before falling back to method-level defaults such as `UNKNOWN`. Host apps should rely on `VeepooError.code` after this normalization.

**Public error code surface (hybrid):** Only codes that host apps are expected to **branch on** in UX (Session eligibility, realtime-test mutex, capability gaps, etc.) stay as distinct `VeepooErrorCode` values. Vendor-opaque or rare native strings (e.g. start/stop/read failures with vendor detail) map to **`OPERATION_FAILED`** (or another single bucket), with the original native code and message preserved for logs.

**`nativeCode`:** `VeepooError` may include an optional **`nativeCode`** string: the raw code from the native/Expo rejection when the bridge **maps** that value into a public `VeepooError.code` (especially when collapsing to **`OPERATION_FAILED`**). Optional so callers that only branch on `code` stay simple; support tooling can read `nativeCode`.

**When to set `nativeCode`:** Omit it when the normalized public `code` is **the same string** as the native rejection code (after trim / case normalization). Set it when the bridge **aliases or collapses** (e.g. `START_FAILED` → `OPERATION_FAILED`).

**No usable native code:** If the thrown value has no parseable native `code`, emit **`UNKNOWN`** with the original message preserved. **Do not** use message substring heuristics in v1 (avoids brittle vendor/locale coupling).

**Mapper scope:** **`mapNativeRejection`** (working name) applies only to failures from **`await` native module methods** (`NativeVeepooSDK` / Expo `AsyncFunction` rejections). **Validators** and other pure TypeScript preflight checks continue to construct **`VeepooError`** directly and **do not** pass through the native mapper.

## Bridge capability scope

**Vendor parity:** The module targets **full coverage** of vendor-exposed Band capabilities for device personalization and advanced features (settings-style APIs, OTA/DFU, dial management, etc.), not a permanently capped subset. Individual capabilities remain **optional per Band model**: host apps should use **`readDeviceFunctions()`** (and related device metadata) to decide what to show; unsupported capabilities should fail with clear, documented errors rather than silent no-ops.

**Delivery sequence (C / D):** Capabilities ship in a **fixed order** that combines **lower blast radius first** with **dependency order**: Group **C** settings-style APIs (find Band, screen, sedentary, wrist-flip) before medium-integration features (weather, women’s health, AGPS, music/camera), then higher-risk work (**OTA/DFU**, **dial management**, **contacts/SOS**, **body composition**), with **Android-only** controls (e.g. Bluetooth power) **last**.

_(Grill-with-docs #4 — Q1–Q6.)_
