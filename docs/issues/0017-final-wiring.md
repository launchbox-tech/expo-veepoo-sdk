# Issue #17: example: final wiring — stale-state derivation + drop useCallback

> GitHub: https://github.com/launchbox-tech/expo-veepoo-sdk/issues/17
> Status: closed | Labels: enhancement

## Parent

[refactor(example): extract custom hooks per SDK lifecycle phase](https://github.com/gaozh1024/expo-veepoo-sdk/issues/1)

## What to build

Complete the main component cleanup now that all domain hooks are extracted:

1. **Stale-state derivation** — health test results and sync data are derived at render time rather than explicitly reset on disconnect. Values are masked when `appState !== 'ready'` (e.g. `const hrResult = appState === 'ready' ? healthTests.hrResult : null`). No reset effects needed.

2. **Drop all `useCallback` wrappers** — React Compiler handles memoization. Remove every remaining `useCallback` from the main component and from all hook files. Plain `async function` declarations replace them.

3. **Verify the main component is a thin orchestrator** — `index.tsx` should contain: one `useReducer`, five hook calls, stale-state derivations, and JSX only. Zero `useState`, zero `useEffect`, zero `useCallback`.

## Acceptance criteria

- [ ] Main component contains no `useState`, `useEffect`, or `useCallback` calls
- [ ] Stale health test results are not shown when `appState !== 'ready'`
- [ ] Stale sync data is not shown when `appState !== 'ready'`
- [ ] No `useCallback` in any hook file
- [ ] Full app flow verified: init → scan → connect → health tests → sync → disconnect → reconnect
- [ ] Disconnect (manual and unexpected) leaves no stale state visible in the UI
- [ ] `tsc --noEmit` passes with zero errors

## Blocked by

- [#15](https://github.com/launchbox-tech/expo-veepoo-sdk/issues/15)
- [#16](https://github.com/launchbox-tech/expo-veepoo-sdk/issues/16)
