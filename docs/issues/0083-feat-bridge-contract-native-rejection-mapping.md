# 83 — feat: Native rejection / VeepooError mapping contract + CI (#81)

> GitHub: https://github.com/launchbox-tech/expo-veepoo-sdk/issues/83  
> Status: open | Labels: needs-triage, enhancement

## Parent

#81 — PRD: JavaScript bridge architecture hardening (contract, depth, optional Session recipe)

## What to build

Extend bridge contract tooling so **native `reject` string codes** (and/or the **`mapNativeRejection`** alias keys that must stay in sync with native) are **enumerated and checked**—guarding **Session** eligibility, realtime-test **mutex**, and other branch-worthy **`VeepooError.code`** paths per **ADR 0003** and **`CONTEXT.md`**. Deliver CI coverage that fails on drift between Kotlin/Swift reject strings and the TypeScript mapper expectations **without** adding message substring heuristics.

## Acceptance criteria

- [x] Contract covers native **`.reject("CODE")`** surface + **`mapNativeRejection`** mapping in **`bridge-contract/native-rejection-codes.json`** (including **`OPERATION_FAILED`** / **`INVALID_ARGUMENT`** collapse rows).
- [x] `npm run check:native-rejection` and Jest contract test fail on extract ↔ allowed list drift; add hosted CI when a workflow exists.
- [x] Jest: contract integration test + **`CONTEXT_ERROR`** Android-style mapping in **`map-native-rejection.test.ts`**.
- [x] **`isVeepooErrorShape`** / validator pass-through unchanged (**ADR 0003**).

## Blocked by

- #82 (reuse contract/CI harness from VeepooEvent work)

## Type

AFK

## User stories covered (from #81)

2, 13, 14, 23, 28, 39, 42, 45, 50.
