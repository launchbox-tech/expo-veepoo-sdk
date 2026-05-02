# 82 — feat: VeepooEvent bridge contract + CI (#81)

> GitHub: https://github.com/launchbox-tech/expo-veepoo-sdk/issues/82  
> Status: open | Labels: needs-triage, enhancement

## Parent

#81 — PRD: JavaScript bridge architecture hardening (contract, depth, optional Session recipe)

## What to build

Introduce a **machine-checkable contract** for **`VeepooEvent`** names so iOS, Android, and the TypeScript event union stay aligned. Deliver a small verifier (Node script and/or Jest) that reads a canonical list and fails when Swift, Kotlin, or TS drifts; wire it into **CI**. Include **fixtures** (golden + intentional drift) so the checker is tested. This is a **tracer bullet**: one end-to-end quality gate from native emitters through the shared contract to automation—no host app UI.

## Acceptance criteria

- [ ] Canonical artifact exists for all **`VeepooEvent`** strings the bridge uses (single source for the checker).
- [ ] Verifier fails CI when iOS, Kotlin, or TypeScript is out of sync with that artifact (or documented equivalent extraction).
- [ ] Automated tests cover the verifier (pass + controlled failure cases).
- [ ] No change to host-facing **`VeepooSDK`** method signatures; event **semantics** for **`deviceReady`**, **`deviceDisconnected`**, and discovery events remain as today unless a mismatch is **fixed** as part of alignment.

## Blocked by

None — can start immediately.

## Type

AFK

## User stories covered (from #81)

1, 3, 4, 13, 20, 27, 28, 36, 42, 43, 50.
