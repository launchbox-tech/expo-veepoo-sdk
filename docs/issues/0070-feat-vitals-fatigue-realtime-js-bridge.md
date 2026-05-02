# 70 — feat(vitals): fatigue realtime test JS bridge (iOS + Android)

> GitHub: https://github.com/launchbox-tech/expo-veepoo-sdk/issues/70
> Status: open | Labels: needs-triage

## Parent

[#66 — PRD: Realtime vitals (HRV, ECG, fatigue, breathing) JS parity](https://github.com/launchbox-tech/expo-veepoo-sdk/issues/66)

## What to build

Expose **fatigue realtime manual test** end-to-end: `startFatigueTest` / `stopFatigueTest`, **`fatigueTestResult`** events, types, iOS + Kotlin bridges, normalizers, Jest tests. Respect mutex + stable errors from foundation.

**Docs/example/matrix/release notes** deferred to **consolidated docs issue** after all four modalities.

## Acceptance criteria

- [ ] Public API matches PRD naming; both native platforms unless **Partial** with justification.
- [ ] Normalizers + unit tests for fatigue result payloads.
- [ ] Stable errors for unsupported / mutex / Session eligibility.
- [ ] CI green.

## Blocked by

- #67
