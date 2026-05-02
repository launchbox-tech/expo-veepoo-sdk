# 71 — feat(vitals): breathing realtime test JS bridge (iOS + Android)

> GitHub: https://github.com/launchbox-tech/expo-veepoo-sdk/issues/71
> Status: open | Labels: needs-triage

## Parent

[#66 — PRD: Realtime vitals (HRV, ECG, fatigue, breathing) JS parity](https://github.com/launchbox-tech/expo-veepoo-sdk/issues/66)

## What to build

Expose **breathing realtime manual test** end-to-end (vendor-equivalent breathing/coaching/measurement flow): `startBreathingTest` / `stopBreathingTest`, **`breathingTestResult`** events, types, iOS + Kotlin bridges, normalizers, Jest tests. Respect mutex + stable errors from foundation.

**Docs/example/matrix/release notes** deferred to **consolidated docs issue** after all four modalities.

## Acceptance criteria

- [ ] Public API matches PRD naming; both native platforms unless **Partial** with justification.
- [ ] Normalizers + unit tests for breathing result payloads.
- [ ] Stable errors for unsupported / mutex / Session eligibility.
- [ ] **Research notes (AFK):** Document vendor wiki/SDK symbols, start/stop entry points, listener/delegate names, representative payload shapes, and **iOS vs Android** deltas in the **PR description or an issue comment** before merge (capture any naming ambiguity—e.g. training vs measurement—so AFK agents pick the right vendor API).
- [ ] CI green.

## Blocked by

- #67
