# 67 — feat(tests): realtime test mutex + stable VeepooError for conflicting starts

> GitHub: https://github.com/launchbox-tech/expo-veepoo-sdk/issues/67
> Status: open | Labels: needs-triage

## Parent

[#66 — PRD: Realtime vitals (HRV, ECG, fatigue, breathing) JS parity](https://github.com/launchbox-tech/expo-veepoo-sdk/issues/66)

## What to build

Enforce **at most one active realtime health test** across **all** existing and future modalities (heart rate, blood pressure, blood oxygen, temperature, stress, glucose, plus upcoming HRV/ECG/fatigue/breathing). When a second `start*Test` runs while another test is active, reject with a **stable `VeepooError` code** (and readable message; preserve vendor detail in message/details). Apply the same rules when **no Session** or the Session is **not eligible** for tests, aligned with existing patterns.

Implement coordination **consistently on iOS and Kotlin** (and mirror in JS where it prevents pointless native calls). **Do not** add the four new vitals modalities here—only shared mutex + error plumbing that later issues depend on.

## Acceptance criteria

- [ ] Starting any realtime test while another is active fails with the **documented** “already running” (or equivalent) **error code**, not an opaque vendor string-only failure.
- [ ] Same stable failure semantics when Session missing / not ready for tests (aligned with existing tests).
- [ ] Existing realtime tests (HR, BP, SpO₂, temp, stress, glucose) participate in the single-test rule—verified conceptually and via example if applicable.
- [ ] Error codes and messages are suitable for host-app branching; vendor diagnostics remain available for logs.
- [ ] CI green; no requirement to change vendor parity matrix rows for HRV/ECG/etc. (those land in follow-up issues).

## Blocked by

None — can start immediately.
