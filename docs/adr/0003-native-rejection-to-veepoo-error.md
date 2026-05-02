# Native rejection normalization (`VeepooError`)

## Status

Accepted

## Context

iOS and Android `AsyncFunction` handlers reject Expo promises with **string codes** (`promise.reject("REALTIME_TEST_IN_PROGRESS", "…")`, `START_FAILED`, `SDK_NOT_AVAILABLE`, etc.). The TypeScript union **`VeepooErrorCode`** is smaller and oriented toward **host-app branching** (Session, mutex, capability gaps).

Today, **`VeepooSDK`** `catch` paths often call **`handleError(error, "UNKNOWN")`** or a **fixed** code without consistently reading the native rejection shape, so correct native codes (e.g. mutex) can be **lost** on the JS surface.

Separately, validators and other **pure TypeScript** checks already construct **`VeepooError`** directly; those paths must not be conflated with native rejections.

Product glossary (**Band**, **Session**, etc.) stays in **AGENTS.md**. **`CONTEXT.md`** holds a concise summary of this bridge contract; this ADR is the durable decision record.

## Decision

1. **Authority:** When a failure comes from **`await` a native module method**, the bridge **parses** the Expo/native rejection (code + message when present), **maps** the native code to **`VeepooErrorCode`** (including explicit aliases), then applies a **method-level fallback** only if no usable native code exists.
2. **Hybrid public surface:** Keep **distinct** `VeepooErrorCode` values for outcomes host apps are expected to **branch on** (Session eligibility, realtime-test mutex, capability unsupported, device not ready, etc.). **Vendor-opaque** or rare native strings (e.g. start/stop/read failures with embedded vendor detail) map to **`OPERATION_FAILED`**, preserving the full native **message** for logs and support.
3. **`nativeCode`:** Extend **`VeepooError`** with an optional **`nativeCode?: string`**. Set it when the bridge **aliases or collapses** a native code into a public code. **Omit** it when the public `code` equals the native code after **trim / case normalization** (avoid redundancy).
4. **Missing code:** If no parseable native code is present, use **`UNKNOWN`** with the original message. **No** message substring heuristics in v1.
5. **Scope:** A dedicated **`mapNativeRejection`** (name may vary) applies **only** to native `await` failures. **Validators** and TS preflight logic continue to throw or return **`VeepooError`** without passing through this mapper.

## Consequences

- **Positive:** Stable **`VeepooError.code`** for mutex/capability/Session UX; traceability via **`nativeCode`** when mapped; single place to adjust aliases when iOS/Android strings diverge.
- **Negative:** Requires maintaining an **alias table** in code and **Jest fixtures** for representative Expo error shapes; new native `reject` strings need review to decide branch-worthy vs **`OPERATION_FAILED`** bucket.

## Links

- Summary: [`CONTEXT.md`](../../CONTEXT.md) (Bridge errors)
- Types: [`src/types/errors.ts`](../../src/types/errors.ts)
