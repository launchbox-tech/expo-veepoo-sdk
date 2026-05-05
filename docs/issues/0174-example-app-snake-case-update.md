# refactor(example): update example app to snake_case SDK API

**Issue:** #174
**Status:** Open
**Labels:** enhancement, needs-triage
**Parent:** #171

## What to build

Update all property accesses, object constructions, and string value comparisons in `example/src/` to use the snake_case names introduced in #173. This is a mechanical update — every camelCase property access on SDK data or input object is renamed to its snake_case equivalent. No logic changes.

## Acceptance criteria

- [ ] All SDK type property accesses in `example/src/` use snake_case (e.g. `device.device_id`, `payload.heart_rate`)
- [ ] All SDK input objects constructed in `example/src/` use snake_case property names (e.g. `{ is_24_hour: true }`)
- [ ] All string literal comparisons against SDK union values use snake_case (e.g. `status === 'powered_off'`)
- [ ] `tsc --noEmit` passes in the example app
- [ ] The example app builds and runs without runtime errors

## Blocked by

#173 — type definitions and transform layer must be in place first
