# 86 — refactor: Native invoke pipeline — health data reads (#81)

> GitHub: https://github.com/launchbox-tech/expo-veepoo-sdk/issues/86  
> Status: open | Labels: needs-triage, enhancement

## Parent

#81 — PRD: JavaScript bridge architecture hardening (contract, depth, optional Session recipe)

## What to build

Migrate **health data read** **`AsyncFunction`**s through the same **native invoke pipeline**: **battery**, **device version**, **`syncPersonalInfo`**, **historical** reads (**sleep**, **sport steps**, **origin**, **day summary**), **device functions**, **social read**, **read device all data**, **start read origin data**, and related normalizers. Deliver **regression tests** per method group on the injected native mock.

## Acceptance criteria

- [ ] Each migrated method uses the shared pipeline for native failures and existing normalizers for success paths.
- [ ] **Origin read progress** / caching behaviour (if any) remains correct; bugs stay localized to this slice’s diff.
- [ ] Tests cover at least one representative read per category and a **normalized** shape assertion.
- [ ] No host-facing API changes.

## Blocked by

- #85 (pipeline + connectivity path merged first)

## Type

AFK

## User stories covered (from #81)

7, 8, 16, 31, 32, 38, 40, 48, 50.
