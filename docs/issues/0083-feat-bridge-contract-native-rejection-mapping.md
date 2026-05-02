# 83 — feat: Native rejection / VeepooError mapping contract + CI (#81)

> GitHub: https://github.com/launchbox-tech/expo-veepoo-sdk/issues/83  
> Status: open | Labels: needs-triage, enhancement

## Parent

#81 — PRD: JavaScript bridge architecture hardening (contract, depth, optional Session recipe)

## What to build

Extend bridge contract tooling so **native `reject` string codes** (and/or the **`mapNativeRejection`** alias keys that must stay in sync with native) are **enumerated and checked**—guarding **Session** eligibility, realtime-test **mutex**, and other branch-worthy **`VeepooError.code`** paths per **ADR 0003** and **`CONTEXT.md`**. Deliver CI coverage that fails on drift between Kotlin/Swift reject strings and the TypeScript mapper expectations **without** adding message substring heuristics.

## Acceptance criteria

- [ ] Contract or checklist covers branch-worthy native codes relevant to **`mapNativeRejection`** (and documents **`OPERATION_FAILED`** bucket policy where applicable).
- [ ] CI fails when native emitters or the TS mapper drifts from the contract in an unreviewed way.
- [ ] Tests include representative **fixtures** (iOS- and Android-shaped rejections) tied to the contract.
- [ ] **Validators** and pure TS **`VeepooError`** construction remain **outside** the mapper scope per **ADR 0003**.

## Blocked by

- #82 (reuse contract/CI harness from VeepooEvent work)

## Type

AFK

## User stories covered (from #81)

2, 13, 14, 23, 28, 39, 42, 45, 50.
