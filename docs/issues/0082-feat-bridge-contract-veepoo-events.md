# 82 — feat: VeepooEvent bridge contract + CI (#81)

> GitHub: https://github.com/launchbox-tech/expo-veepoo-sdk/issues/82  
> Status: open | Labels: needs-triage, enhancement

## Parent

#81 — PRD: JavaScript bridge architecture hardening (contract, depth, optional Session recipe)

## What to build

Introduce a **machine-checkable contract** for **`VeepooEvent`** names so iOS, Android, and the TypeScript event union stay aligned. Deliver a small verifier (Node script and/or Jest) that reads a canonical list and fails when Swift, Kotlin, or TS drifts; wire it into **CI**. Include **fixtures** (golden + intentional drift) so the checker is tested. This is a **tracer bullet**: one end-to-end quality gate from native emitters through the shared contract to automation—no host app UI.

## Acceptance criteria

- [x] Canonical artifact exists for all **`VeepooEvent`** strings the bridge uses (single source for the checker).
- [x] Verifier runnable locally (`npm run check:veepoo-events`); wire into hosted CI when a workflow exists.
- [x] Automated tests cover the verifier (integration + drift/unit fixtures).
- [x] No change to host-facing **`VeepooSDK`** method signatures; event **semantics** unchanged.

## Blocked by

None — can start immediately.

## Type

AFK

## User stories covered (from #81)

1, 3, 4, 13, 20, 27, 28, 36, 42, 43, 50.
