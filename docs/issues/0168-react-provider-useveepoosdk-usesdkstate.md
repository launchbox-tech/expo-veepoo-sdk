# feat(react): VeepooSDKProvider + useVeepooSDK + useSDKState

**Issue:** #168
**Status:** Closed
**Labels:** enhancement
**Parent:** #166

## What to build

The React integration layer on top of `VeepooSDKStateStore`: `VeepooSDKProvider`, `useVeepooSDK()`, and `useSDKState()`.

## Acceptance criteria

- [ ] `VeepooSDKProvider` creates SDK + store in stable refs; calls `sdk.init()` on mount, `sdk.destroy()` + `store.destroy()` on unmount
- [ ] Init failure captured as `error: VeepooError | null` in context
- [ ] `useVeepooSDK()` returns `{ sdk, status, error }`; throws descriptive error outside Provider
- [ ] `useSDKState(selector)` uses `useSyncExternalStore`; Object.is comparison on selected value
