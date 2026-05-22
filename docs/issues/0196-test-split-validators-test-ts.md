# test: split validators.test.ts before 1k-line threshold

**Issue:** #196
**Status:** Open
**Labels:** enhancement

## What to build

[`src/__tests__/validators/validators.test.ts`](../../src/__tests__/validators/validators.test.ts) (~957 lines) approaches the 1k-line maintainability threshold. Split by capability domain or validator module matching `src/` layout; preserve coverage.

## Acceptance criteria

- No single validators test file over **800 lines** after split (stretch: under 500 per file).
- Full test suite green; no dropped cases.
