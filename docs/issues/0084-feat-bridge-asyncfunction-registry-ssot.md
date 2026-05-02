# 84 — feat: Bridge AsyncFunction registry — TypeScript single source of truth (#81)

> GitHub: https://github.com/launchbox-tech/expo-veepoo-sdk/issues/84  
> Status: open | Labels: needs-triage, enhancement

## Parent

#81 — PRD: JavaScript bridge architecture hardening (contract, depth, optional Session recipe)

## What to build

Create a **single source of truth** for **`AsyncFunction`** / bridge method definitions so the **native-shaped** TypeScript surface and the **app-facing** module interface do not drift apart, and Jest **native mocks** stay maintainable. Prove the approach by consolidating definitions (registry, codegen, or equivalent) **without** changing runtime behaviour of **`VeepooSDK`**.

## Acceptance criteria

- [x] **`NATIVE_ASYNC_METHOD_NAMES`** in **`src/bridge-contract/async-native-method-registry.ts`** is the canonical list; **`satisfies`** + **`NATIVE_ASYNC_REGISTRY_INTEGRITY`** fail compile if it drifts from **`NativeVeepooSDKInterface`** async keys.
- [x] **`VeepooSDK`** public API unchanged; **typecheck** + **tests** pass.
- [x] **`makeMockNative`** builds async stubs by iterating the registry + **`NATIVE_ASYNC_MOCK_RESOLVES`** overrides (no duplicated method-name list in the mock).
- [x] No new runtime dependencies.

## Blocked by

None — can start immediately (may land in parallel with contract issues; coordinate merge order).

## Type

AFK

## User stories covered (from #81)

5, 6, 17, 21, 25, 33, 35, 45, 46, 50.
