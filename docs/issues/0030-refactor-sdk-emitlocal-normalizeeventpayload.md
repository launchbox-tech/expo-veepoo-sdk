# 30 — refactor(sdk): replace emitLocal ternary with normalizeEventPayload call

Part of #29.

## What to build

In `src/VeepooSDK.ts`, delete the `const normalizedPayload = ...` ternary block (lines 255–315) and replace with:

```ts
const normalizedPayload = normalizeEventPayload(event, payload);
```

`normalizeEventPayload` is defined in the same file (lines 56–104) — no import changes needed.

## Acceptance criteria

- [ ] `emitLocal()` contains no nested ternary expression for payload normalization
- [ ] `emitLocal()` delegates to `normalizeEventPayload(event, payload)` for all events
- [ ] `npx tsc --noEmit` passes with no type errors
- [ ] All existing tests pass (`yarn test`)
- [ ] No other logic in `emitLocal()` is changed (progress dedup, logging, state mutation, listener dispatch remain intact)
