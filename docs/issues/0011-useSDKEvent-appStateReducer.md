# Issue #11: example: useSDKEvent primitive + appStateReducer + CONTEXT.md Band Discovery

> GitHub: https://github.com/launchbox-tech/expo-veepoo-sdk/issues/11
> Status: closed | Labels: enhancement, needs-triage

## Parent

[refactor(example): extract custom hooks per SDK lifecycle phase](https://github.com/gaozh1024/expo-veepoo-sdk/issues/1)

## What to build

Three foundational pieces that all domain hooks will build on:

1. **`useSDKEvent` primitive** — a single hook in `hooks/useSDKEvent.ts` that owns the only `useEffect` touching the SDK event emitter. Accepts an event name, a stable handler, and an `active` boolean. Subscribes when `active` is true, unsubscribes in cleanup. Zero domain knowledge.

2. **`appStateReducer`** — a pure function with a typed `AppAction` discriminated union (`SDK_READY`, `SCAN_START`, `SCAN_STOP`, `BAND_SELECTED`, `SESSION_READY`, `SESSION_ERROR`, `SESSION_ENDED`, `DISCONNECT`, `RECONNECT`) enforcing all valid `AppState` transitions in one place. Not yet wired into the main component — no behavior change in this slice.

3. **`CONTEXT.md` update** — add **Band Discovery** as a domain term: the phase when the app scans for visible Bands, distinct from Pairing (the moment the user selects one).

## Acceptance criteria

- [ ] `hooks/useSDKEvent.ts` exists and compiles; calling it with `active: false` registers no listener; calling it with `active: true` registers the listener and unregisters it on cleanup
- [ ] `appStateReducer` is a pure function; every valid `(state, action)` pair produces the correct next state; invalid transitions are no-ops
- [ ] `AppAction` is a typed discriminated union covering all 9 action types
- [ ] `CONTEXT.md` defines Band Discovery with a clear distinction from Pairing
- [ ] `tsc --noEmit` passes with zero errors
- [ ] App behaviour is unchanged (reducer not yet wired in)

## Blocked by

None — can start immediately.
