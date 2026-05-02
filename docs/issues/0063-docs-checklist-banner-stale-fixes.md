# 63 — docs(checklist): banner + fix stale §2 (originSpo2Data)

> Status: closed | Labels: enhancement

## Parent

#59

## What to build

Update **`docs/checklist.md`**: add a **banner** at the top linking to **`docs/vendor-api/vendor-parity-matrix.md`**; fix **§2** so it no longer claims `originSpo2Data` is missing from TS (parity with current code). Trim or annotate other stale rows so maintainers are not misled.

## Acceptance criteria

- [ ] Banner points to the parity matrix doc
- [ ] §2 event parity table matches current `VeepooEvent` / listeners / normalizers for `originSpo2Data`
- [ ] Historical refactor notes retained where still useful; contradictions removed or marked stale

## Blocked by

- #62 (parity matrix file must exist so the banner target is valid)
