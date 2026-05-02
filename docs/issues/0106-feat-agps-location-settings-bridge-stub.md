# 106 — feat(settings): AGPS / location settings — bridge stub (#95)

> GitHub: https://github.com/launchbox-tech/expo-veepoo-sdk/issues/106
> Status: open | Labels: needs-triage

## Parent

[#95 — PRD: Pre-feature checklist closure](https://github.com/launchbox-tech/expo-veepoo-sdk/issues/95) · [#59 — Vendor upstream tracking & parity](https://github.com/launchbox-tech/expo-veepoo-sdk/issues/59)

## What to build

**Stub issue** — vertical slice to be detailed after triage (`docs/checklist.md` §7 Group C/D). Target capability area: **AGPS / location aid: settings or sync the vendor expects for assisted GPS when `agpsFunction` is set.**. Related `DeviceFunctions` / capability hints (from checklist): **agpsFunction**.

End state: full tracer bullet per `docs/templates/feature-issue.md` — Kotlin + Swift + TypeScript public API + validators + normalizers + events (if any) + Jest tests + minimal safe `example/` demo (OTA exempt from real flash). **Session** eligibility and error mapping follow **CONTEXT.md** and **ADR 0003**. Host apps gate UI with **`readDeviceFunctions()`**.

## Acceptance criteria

- [ ] Stub replaced or supplemented with vendor research notes (wiki/SDK symbols, iOS vs Android entry points) in a PR or issue comment before merge of implementation PR.
- [ ] Public JS API + native implementations (or documented **Partial** with `CAPABILITY_UNSUPPORTED` on the gap platform).
- [ ] Types, validators, normalizers, and unit tests for new payloads / methods.
- [ ] `docs/vendor-api/vendor-parity-matrix.md` updated for this capability row.
- [ ] `npm run typecheck` (or project equivalent) and tests green.

## Blocked by

None — stub; **implementation order** follows **CONTEXT.md** delivery sequence (Group **C** personalization before higher-risk **D** work; Android Bluetooth control last). Coordinate with maintainers before starting if another open issue already owns this slice.
