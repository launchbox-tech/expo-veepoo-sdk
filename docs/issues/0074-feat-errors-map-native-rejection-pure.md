# 74 — feat(errors): mapNativeRejection pure module + Jest (PRD #73)

> GitHub: https://github.com/launchbox-tech/expo-veepoo-sdk/issues/74
> Status: open | Labels: needs-triage

## Parent

[#73 — PRD: Native rejection normalization to VeepooError (JS bridge)](https://github.com/launchbox-tech/expo-veepoo-sdk/issues/73)

## What to build

Implement **`VeepooError.nativeCode?`** and a **pure** **`mapNativeRejection`** (name per ADR 0003 / `CONTEXT.md`) that converts typical Expo / React Native thrown values into **`VeepooError`**: parse native **code** + **message**, apply the **hybrid** alias table (**branch-worthy** codes vs **`OPERATION_FAILED`** bucket), set **`nativeCode`** only when aliasing/collapsing, use **`UNKNOWN`** when no parseable code (**no** message heuristics). **Do not** change **`VeepooSDK`** call sites in this slice—only types, the mapper module, exports as needed, and **Jest** coverage with fixtures.

## Acceptance criteria

- [ ] **`VeepooError`** includes optional **`nativeCode`**; **`VeepooErrorCode`** updated per alias policy (expand or bucket per PRD #73).
- [ ] Pure mapper module with unit tests covering: mutex, capability unsupported, device not ready/connected, SDK not initialized, operational collapse (**`START_FAILED`** → **`OPERATION_FAILED`** with **`nativeCode`**), identical code omits **`nativeCode`**, missing code → **`UNKNOWN`**, representative Expo-like error shapes.
- [ ] Validators / pre-thrown **`VeepooError`** objects are **not** passed through mapper (documented test or helper guard).
- [ ] `npm run typecheck` and **`npm test`** (mapper tests) green; no native or **`VeepooSDK`** behaviour change yet.

## Blocked by

None — can start immediately.

## Type

AFK

## User stories covered (from #73)

1–6, 8–15, 18, 21, 23, 26, 29–30 (mapping contract); partial 17 (mapper design only).
