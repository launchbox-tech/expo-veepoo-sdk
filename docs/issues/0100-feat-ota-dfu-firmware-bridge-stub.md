# 100 — feat(device): OTA / DFU firmware upgrade — bridge stub (#95)

> GitHub: https://github.com/launchbox-tech/expo-veepoo-sdk/issues/100
> Status: open | Labels: (update when #100 closed on GitHub)

## Parent

[#95 — PRD: Pre-feature checklist closure](https://github.com/launchbox-tech/expo-veepoo-sdk/issues/95) · [#59 — Vendor upstream tracking & parity](https://github.com/launchbox-tech/expo-veepoo-sdk/issues/59)

## What to build

**Stub issue** — vertical slice to be detailed after triage (`docs/checklist.md` §7 Group C/D). Target capability area: **OTA / DFU: safe firmware update path using vendored DFU libraries; Session/non-standard mode documented in implementing PRD; example app must not perform real flash (dry-run or disabled control per CONTEXT).**. Related `DeviceFunctions` / capability hints (from checklist): **libdfu, libfastdfu AARs**.

End state: full tracer bullet per `docs/templates/feature-issue.md` — Kotlin + Swift + TypeScript public API + validators + normalizers + events (if any) + Jest tests + minimal safe `example/` demo (OTA exempt from real flash). **Session** eligibility and error mapping follow **CONTEXT.md** and **ADR 0003**. Host apps gate UI with **`readDeviceFunctions()`**.

## Acceptance criteria

- [x] Stub replaced or supplemented with vendor research notes (wiki/SDK symbols, iOS vs Android entry points) in a PR or issue comment before merge of implementation PR.
- [x] Public JS API + native implementations (or documented **Partial** with `CAPABILITY_UNSUPPORTED` on the gap platform).
- [x] Types, validators, normalizers, and unit tests for new payloads / methods.
- [x] `docs/vendor-api/vendor-parity-matrix.md` updated for this capability row.
- [x] `npm run typecheck` (or project equivalent) and tests green.

## Shipped API (local file only)

- `startLocalFirmwareDfu(filePath)` — promise settles on success/failure; progress on `firmwareDfuProgress`
- **Android:** JL / `isJLDevice` only; others get `CAPABILITY_UNSUPPORTED`
- **iOS Simulator:** `CAPABILITY_UNSUPPORTED` (no flash in sim)
- Example app: **no** DFU invocation (CONTEXT)

## Blocked by

None — stub; **implementation order** follows **CONTEXT.md** delivery sequence (Group **C** personalization before higher-risk **D** work; Android Bluetooth control last). Coordinate with maintainers before starting if another open issue already owns this slice.
