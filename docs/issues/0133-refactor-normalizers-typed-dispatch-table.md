# refactor(normalizers): replace normalizeEventPayload with typed dispatch table

**Issue:** #133
**Status:** Open
**Labels:** needs-triage
**Parent:** #130

## What to build

Replace the `normalizeEventPayload(event: VeepooEvent, payload: unknown): unknown` function with a typed dispatch table keyed on every `VeepooEvent`. Each entry is a function whose return type matches the corresponding `VeepooEventPayload[K]` slot, making a missing or incorrectly typed normalizer a compile error. The existing normalizer functions become the values in the table; their implementations do not change. Update `emitLocal` to use the table. Expand normalizer tests so each slot is covered by a raw-fixture → expected-value assertion.

## Acceptance criteria

- [ ] The dispatch table covers every key in `VeepooEvent` — a missing entry is a TypeScript compile error
- [ ] Each table entry has a return type that matches `VeepooEventPayload[K]` for that event key — an incorrect return type is a TypeScript compile error
- [ ] `emitLocal` uses the table instead of the old `normalizeEventPayload` call
- [ ] The manual casts of `normalizedPayload` inside `emitLocal` (e.g. `as { isScanning?: boolean }`) are removed or reduced — the typed table provides the shape
- [ ] Every event key has at least one raw-fixture → expected-value test in the normalizer test suite
- [ ] All existing tests pass unchanged

## Blocked by

None — can start immediately
