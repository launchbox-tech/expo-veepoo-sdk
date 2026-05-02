# 75 — feat(errors): VeepooSDK native catches use mapNativeRejection (PRD #73)

> GitHub: https://github.com/launchbox-tech/expo-veepoo-sdk/issues/75
> Status: open | Labels: needs-triage

## Parent

[#73 — PRD: Native rejection normalization to VeepooError (JS bridge)](https://github.com/launchbox-tech/expo-veepoo-sdk/issues/73)

## What to build

Route **every** **`catch`** around **`await this.native.<method>(…)`** in **`VeepooSDK`** through **`mapNativeRejection`** (from #74), then **`handleError`** / rethrow so **`error` events** and thrown **`VeepooError`** include correct **`code`**, **`message`**, and optional **`nativeCode`**. Apply **method-level fallback** only when the mapper reports no usable native code (per ADR 0003). **Validators** stay on the direct **`VeepooError`** path without mapper.

## Acceptance criteria

- [ ] All native **`await`** failure paths in **`VeepooSDK`** use the mapper; no silent **`UNKNOWN`** where native supplied a mappable code.
- [ ] **`handleError`** (or call sites) preserves **`nativeCode`** on emitted **`error`** payloads.
- [ ] `npm run typecheck` and `npm run build` green; **`npm test`** green to the extent existing suite allows (known **`VeepooSDK.test.ts`** RN limitation may remain).
- [ ] No Kotlin/Swift changes unless discovery proves Expo cannot surface codes (document in PR if so).

## Blocked by

- #74

## Type

AFK

## User stories covered (from #73)

1–17, 19–20, 24–27, 30.
