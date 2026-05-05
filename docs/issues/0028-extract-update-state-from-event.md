# refactor: extract updateStateFromEvent() + add state mutation and progress dedup tests

**Issue:** #28
**Status:** Closed
**Labels:** enhancement
**Parent:** #22

## What to build

Extract the 4 state-mutation blocks from `emitLocal()` into a private `updateStateFromEvent(event, payload)` method, leaving `emitLocal()` at ~25 lines total. Add tests covering all state mutations and `readOriginProgress` deduplication logic.

## Acceptance criteria

- [ ] `updateStateFromEvent` is private; `emitLocal()` calls it after normalization and before listener dispatch
- [ ] `emitLocal()` ≤ 25 lines
- [ ] State-mutation tests cover all event→state transitions
- [ ] `readOriginProgress` deduplication tested
