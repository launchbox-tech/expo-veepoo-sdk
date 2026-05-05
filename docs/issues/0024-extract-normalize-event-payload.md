# refactor: extract normalizeEventPayload + fix setupEventListeners cast

**Issue:** #24
**Status:** Closed
**Labels:** enhancement
**Parent:** #22

## What to build

Extract the 12-level nested ternary from `emitLocal()` into an exported pure function `normalizeEventPayload(event, payload)`. Wire it into `emitLocal()`. Fix the `as unknown as` cast in `setupEventListeners()`.

## Acceptance criteria

- [ ] `normalizeEventPayload(event, payload)` exported; covers all 17 event types that require normalization
- [ ] `emitLocal()` calls the pure function instead of inline ternary
- [ ] `setupEventListeners()` cast fixed; direct unit tests for the pure function added
