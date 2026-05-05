# feat(react): VeepooSDKStateStore — pure observable bridge

**Issue:** #167
**Status:** Closed
**Labels:** enhancement
**Parent:** #166

## What to build

A pure TypeScript class (`VeepooSDKStateStore`) that bridges the SDK's event bus to React's `useSyncExternalStore` contract. Accepts a `VeepooSDK` instance, subscribes to six lifecycle events, and maintains an immutable `SDKStateSnapshot`.

## Acceptance criteria

- [ ] Class has no React import; unit-testable in plain Node
- [ ] Constructor subscribes to `sdkInitialized`, `deviceConnected`, `deviceReady`, `deviceDisconnected`, `scanStarted`, `scanStopped`
- [ ] `getSnapshot()` returns a new reference on every state change
- [ ] `destroy()` unsubscribes all SDK event listeners
- [ ] Initial snapshot derived from SDK state getters at construction time
