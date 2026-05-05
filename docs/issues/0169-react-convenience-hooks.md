# feat(react): convenience hooks

**Issue:** #169
**Status:** Closed
**Labels:** enhancement
**Parent:** #166

## What to build

Five thin convenience hooks, each a one-liner over `useSDKState`:

- `useIsConnected(): boolean`
- `useIsSessionReady(): boolean`
- `useIsScanning(): boolean`
- `useConnectedDeviceId(): string | null`
- `useSDKInitialized(): boolean`

## Acceptance criteria

- [ ] Each hook is a single `useSDKState` call with the appropriate selector
- [ ] All five exported from the main package entry point
- [ ] Primitive selectors never cause spurious re-renders (Object.is equality guaranteed by `useSyncExternalStore`)
