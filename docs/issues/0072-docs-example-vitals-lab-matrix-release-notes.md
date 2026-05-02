# 72 — docs(example): vitals lab, parity matrix, release notes (#66 modalities)

> GitHub: https://github.com/launchbox-tech/expo-veepoo-sdk/issues/72
> Status: open | Labels: needs-triage

## Parent

[#66 — PRD: Realtime vitals (HRV, ECG, fatigue, breathing) JS parity](https://github.com/launchbox-tech/expo-veepoo-sdk/issues/66)

## What to build

After **HRV, ECG, fatigue, and breathing** bridges exist: update **`docs/vendor-parity-matrix.md`** (move items out of backlog into realtime health tests; accurate **Status** / **Device tested**); add **`docs/release-notes/`** entry for consuming apps; update **`example/`** with a minimal **vitals lab** (start/stop all four + log events/errors). Ensures one coherent UX for exercising the vertical on hardware.

## Acceptance criteria

- [ ] Parity matrix reflects all four modalities + mutex/error behavior as shipped; backlog bullets removed or narrowed per truth.
- [ ] Release notes entry describes new APIs and upgrade notes.
- [ ] Example app can trigger each new test and observe results/errors (minimal UI acceptable).
- [ ] Where **#67–#71** PRs documented **research notes**, link or summarize non-obvious behavior in the matrix **Further notes** and/or release notes so consumers inherit the same traceability.
- [ ] CI / example build green.

## Blocked by

- #68
- #69
- #70
- #71
