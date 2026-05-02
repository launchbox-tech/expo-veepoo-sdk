# 78 — feat(ios): HRV realtime — vendor research & go/no-go (#77)

**Status:** open (sync from GitHub)  
**Labels:** needs-triage

> https://github.com/launchbox-tech/expo-veepoo-sdk/issues/78

## Parent

[#77 — PRD: iOS HRV realtime manual test parity with Android](https://github.com/launchbox-tech/expo-veepoo-sdk/issues/77)

## What to build

End-to-end **research slice** only: inventory **VeepooBleSDK** (headers, **VPPeripheralManage** or equivalent) and vendor wiki for a **realtime HRV manual test** API compatible with existing **`startHrvTest` / `stopHrvTest`** and **`hrvTestResult`** expectations. Deliver a **go/no-go** outcome: either a concrete binding plan (selectors, callback types, terminal states, mutex interaction) or a documented **no suitable API** conclusion with proposed **matrix Further notes** / optional **ADR** text so we do not leave an indefinite **`CAPABILITY_UNSUPPORTED`** stub without explanation.

## Acceptance criteria

- [ ] Written finding posted on **#77** or this issue (symbols, links to wiki/header sections, iOS vs Android delta).
- [ ] Explicit **go** (implementation can proceed) or **no-go** (documentation/ADR path) with rationale tied to vendored framework version.
- [ ] If **no-go**: draft bullet list for **vendor-parity-matrix.md** and PRD **Further notes** (historical HRV / Android-only test, etc.).

## Blocked by

None - can start immediately
