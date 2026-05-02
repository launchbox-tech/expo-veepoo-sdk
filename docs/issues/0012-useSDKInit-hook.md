# Issue #12: example: extract useSDKInit hook

> GitHub: https://github.com/launchbox-tech/expo-veepoo-sdk/issues/12
> Status: closed | Labels: enhancement

## Parent

[refactor(example): extract custom hooks per SDK lifecycle phase](https://github.com/gaozh1024/expo-veepoo-sdk/issues/1)

## What to build

Move SDK initialization and permissions into `hooks/useSDKInit.ts`. The hook runs a one-time async setup (`sdk.init()` + `sdk.requestPermissions()`), owns the `permissions` state, and dispatches `SDK_READY` to transition `appState` from `initializing` to `idle`.

The main component replaces its `useState('initializing')` + init `useEffect` with `useReducer(appStateReducer, 'initializing')` + a call to `useSDKInit(dispatch)`. This is the first slice that wires `appStateReducer` into the component.

React Compiler is in use — no `useCallback` wrappers.

## Acceptance criteria

- [ ] `hooks/useSDKInit.ts` exists; owns `permissions` state; dispatches `SDK_READY` on completion
- [ ] Main component uses `useReducer` for `appState` (no `useState` for `appState`)
- [ ] Main component's init `useEffect` is removed
- [ ] App still initializes correctly: loading spinner shows, permissions dialog appears, idle state reached
- [ ] `tsc --noEmit` passes with zero errors

## Blocked by

- [#11](https://github.com/launchbox-tech/expo-veepoo-sdk/issues/11)
