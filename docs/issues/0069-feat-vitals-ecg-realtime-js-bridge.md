# 69 — feat(vitals): ECG realtime test JS bridge (iOS + Android)

> GitHub: https://github.com/launchbox-tech/expo-veepoo-sdk/issues/69
> Status: open | Labels: needs-triage

## Parent

[#66 — PRD: Realtime vitals (HRV, ECG, fatigue, breathing) JS parity](https://github.com/launchbox-tech/expo-veepoo-sdk/issues/66)

## What to build

Expose **ECG realtime manual test** end-to-end: `startEcgTest` / `stopEcgTest` with optional **`includeWaveform`** (or equivalent), **`ecgTestResult`** with **summary always** and **waveform only when opted in**, iOS + Kotlin vendor wiring, normalizers, Jest tests. Document chunking/batching in PR if waveform crosses the bridge in segments.

Respect mutex + stable errors from foundation. **No** example app, parity matrix rows, or release notes in this issue—those ship in the **consolidated docs issue** after all modalities.

## Acceptance criteria

- [ ] Two-tier ECG contract: default summary path; waveform only when explicitly requested.
- [ ] Both platforms implemented unless **Partial** with justification.
- [ ] Normalizers + tests for summary and waveform shapes (as applicable).
- [ ] Stable errors for unsupported / mutex / Session eligibility.
- [ ] CI green.

## Blocked by

- #67
