# 84 — feat: Bridge AsyncFunction registry — TypeScript single source of truth (#81)

> GitHub: https://github.com/launchbox-tech/expo-veepoo-sdk/issues/84  
> Status: open | Labels: needs-triage, enhancement

## Parent

#81 — PRD: JavaScript bridge architecture hardening (contract, depth, optional Session recipe)

## What to build

Create a **single source of truth** for **`AsyncFunction`** / bridge method definitions so the **native-shaped** TypeScript surface and the **app-facing** module interface do not drift apart, and Jest **native mocks** stay maintainable. Prove the approach by consolidating definitions (registry, codegen, or equivalent) **without** changing runtime behaviour of **`VeepooSDK`**.

## Acceptance criteria

- [ ] Adding or renaming a bridged method updates **one canonical place** that feeds typings and/or test doubles (document the workflow for contributors).
- [ ] Existing **`VeepooSDK`** public API remains stable; **typecheck** and **tests** pass.
- [ ] Jest native mock setup is **slimmer or generated** compared to hand-duplicated per-method stubs (measurable reduction or clear pattern).
- [ ] No new mandatory runtime npm dependencies unless justified in PR description.

## Blocked by

None — can start immediately (may land in parallel with contract issues; coordinate merge order).

## Type

AFK

## User stories covered (from #81)

5, 6, 17, 21, 25, 33, 35, 45, 46, 50.
