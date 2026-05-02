# 62 — docs(vendor): vendor-parity-matrix.md v1

## Parent

#59

## What to build

Create **`docs/vendor-parity-matrix.md`** (canonical, versioned): maps major **vendor API / capability areas** to **`VeepooSDK` JS surface** (methods, events) and **device-tested** status (TBD / yes / no). First version may leave gaps explicit — goal is an honest inventory aligned with PRD #59 User Stories 4, 6, 19.

## Acceptance criteria

- [ ] Matrix markdown exists under `docs/` and is suitable for linking from GitHub epic #59
- [ ] Rows distinguish shipped JS API vs native-only vs not bridged
- [ ] Session-scoped language consistent with AGENTS (Band, Session, Pairing)
- [ ] Incremental update process noted (refresh row when a feature ships)

## Blocked by

None — can start immediately.
