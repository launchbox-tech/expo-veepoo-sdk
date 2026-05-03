# refactor(tests): extract shared mock native factory

**Issue:** #131
**Status:** Open
**Labels:** needs-triage
**Parent:** #130

## What to build

Create a single shared mock native factory at `src/__tests__/helpers/mock-native.ts` that exports `makeMockNative(overrides?)`. The factory iterates `NATIVE_ASYNC_METHOD_NAMES` to build the base mock and merges any caller-supplied overrides. Migrate `VeepooSDK.test.ts` and `session-baseline.test.ts` to import from this helper and delete their duplicated `makeMockNative` implementations.

## Acceptance criteria

- [ ] `src/__tests__/helpers/mock-native.ts` is created and exports `makeMockNative(overrides?)`
- [ ] The factory is driven by `NATIVE_ASYNC_METHOD_NAMES` — iterating the registry, not a hardcoded list
- [ ] Caller-supplied `overrides` are merged on top of defaults
- [ ] `VeepooSDK.test.ts` imports `makeMockNative` from the helper; its local definition is removed
- [ ] `session-baseline.test.ts` imports `makeMockNative` from the helper; its local definition is removed
- [ ] All existing tests pass unchanged after the migration

## Blocked by

None — can start immediately
