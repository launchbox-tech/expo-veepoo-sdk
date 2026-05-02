# 79 — feat(ios): HRV realtime — native bridge, tests, matrix, release (#77)

**Status:** closed — not planned (vendor API; sync from GitHub)  
**Labels:** _(none)_

> https://github.com/launchbox-tech/expo-veepoo-sdk/issues/79

## Parent

[#77 — PRD: iOS HRV realtime manual test parity with Android](https://github.com/launchbox-tech/expo-veepoo-sdk/issues/77)

## What to build

**Only if research (#78) is go:** implement **iOS** native **HRV manual realtime test** so **`startHrvTest` / `stopHrvTest`** run without **`CAPABILITY_UNSUPPORTED`**, emit **`hrvTestResult`** payloads that pass **`normalizeEventPayload('hrvTestResult')`** aligned with Android semantics (**state**, **progress**, **value** / aliases), participate in the global realtime-test mutex as **`hrv`**, and surface rejects per **ADR 0003**. Add **Jest** coverage only if new raw shapes appear. Update **`docs/vendor-parity-matrix.md`** (HRV row **Shipped** + **Further notes**), **`docs/release-notes/`**, and version metadata. PR description must reference research notes.

If **#78** is **no-go**, close this issue as **not planned** or replace with documentation-only work per maintainer decision.

## Acceptance criteria

- [ ] **iOS** **`startHrvTest` / `stopHrvTest`** succeed when Session/Band eligible (no spurious **`CAPABILITY_UNSUPPORTED`** when API exists).
- [ ] **`hrvTestResult`** events match **`HrvTestResult`** after normalization; extend unit tests if needed.
- [ ] Mutex / **`REALTIME_TEST_IN_PROGRESS`** behavior matches **#67** contract.
- [ ] Matrix + release notes + version bump shipped with the PR.
- [ ] **`npm run typecheck`**, **`npm run build`**, tests green.

## Blocked by

- #78 — **2026-05-02:** research **no-go** (no iOS vendor API equivalent to Android `readDeviceManualData(HRV)` in pinned `VeepooBleSDK`). Keep issue **open** for tracking or close **not planned** on GitHub per maintainer; no implementation until vendor/framework upgrade.
