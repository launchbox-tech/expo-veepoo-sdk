# test: create VeepooSDK test scaffold + constructor injection

**Issue:** #23
**Status:** Closed
**Labels:** enhancement
**Parent:** #22

## What to build

Set up the test infrastructure and introduce a dependency injection seam in `VeepooSDK`. Create `src/__tests__/VeepooSDK.test.ts` with a `makeMockNative()` helper (a `jest.Mocked<NativeVeepooSDKInterface>` extended with an `_emit` test utility). Add an optional `native` constructor parameter to `VeepooSDK` defaulting to the real module.

## Acceptance criteria

- [ ] `VeepooSDK` accepts an optional `native` constructor parameter
- [ ] `makeMockNative()` helper creates a fully-typed mock with `_emit` utility
- [ ] `expo-modules-core` is mocked at file-top so tests run in Node
