# refactor(example): migrate 7 custom hooks to useVeepooSDK + useSDKState

**Issue:** #170
**Status:** Closed
**Labels:** enhancement
**Parent:** #166

## What to build

Refactor the example app to consume the React integration layer instead of hand-wiring every SDK interaction. The seven hooks (`useSDKInit`, `useBandScan`, `useBandSession`, `useHealthTests`, `useDataSync`, `useSDKEvent`, `usePassiveEvents`) become thin consumers of `useVeepooSDK()` and `useSDKState()`. The 179-prop `ReadyScreen` is eliminated.

## Acceptance criteria

- [ ] All seven hooks use `useVeepooSDK()` / `useSDKState()` internally
- [ ] No manual `sdk.on/off` boilerplate (via `useSDKEvent` wrapper)
- [ ] `ReadyScreen` no longer receives 179 props — session state read from context
- [ ] `useAppState` derives all state from `useSDKState` selectors
