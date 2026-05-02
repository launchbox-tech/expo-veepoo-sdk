# 68 — feat(vitals): HRV realtime test JS bridge (iOS + Android)

> GitHub: https://github.com/launchbox-tech/expo-veepoo-sdk/issues/68
> Status: open | Labels: needs-triage

## Parent

[#66 — PRD: Realtime vitals (HRV, ECG, fatigue, breathing) JS parity](https://github.com/launchbox-tech/expo-veepoo-sdk/issues/66)

## What to build

Expose **HRV realtime manual test** end-to-end: `startHrvTest` / `stopHrvTest`, **`hrvTestResult`** events with normalized TypeScript types, iOS + Kotlin vendor wiring, event normalizers, and Jest tests for normalization. Respect **single active test** and stable errors from the mutex foundation issue.

**Docs/example/matrix/release notes** for this feature ship in the **follow-up consolidated docs issue** after all four modalities exist—do not block this issue on example or matrix edits.

## Acceptance criteria

- [ ] Public JS API + native declarations: `startHrvTest`, `stopHrvTest`, `hrvTestResult` per PRD.
- [ ] iOS and Android both implemented; **Partial** only if one vendor SDK lacks API (document in PR description).
- [ ] Unsupported capability and mutex conflicts use stable `VeepooError` codes from foundation work.
- [ ] Normalizers + unit tests for `hrvTestResult` payloads (prior art: other realtime test normalizers).
- [ ] CI green; **Device tested** remains TBD until hardware verification recorded elsewhere.

## Blocked by

- #67
