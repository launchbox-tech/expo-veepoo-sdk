# refactor(bridge): extract EventBus from VeepooSDKRuntime

**Issue:** #135
**Status:** Open
**Labels:** needs-triage
**Parent:** #130

## What to build

Extract the JS listener `Map`, native subscription list, and event dispatch logic from `VeepooSDKRuntime` into a standalone `EventBus` class. `EventBus` owns `on`, `off`, `once`, `emit`, `removeAllListeners`, native subscription setup (`setupEventListeners`), and teardown (`teardownNativeListeners`). It does not know about state, logging, or error mapping. `VeepooSDKRuntime.emitLocal` becomes a thin call into `EventBus.emit`. Add unit tests for `EventBus` that require no native module.

## Acceptance criteria

- [ ] `EventBus` class exists and owns `on`, `off`, `once`, `emit`, `removeAllListeners`, `setupEventListeners`, and `teardownNativeListeners`
- [ ] `EventBus` can be instantiated without a native module (for JS-only tests)
- [ ] `VeepooSDKRuntime` delegates listener registration and dispatch to `EventBus`; its own listener `Map` and `nativeSubscriptions` array are removed
- [ ] `emitLocal` calls `EventBus.emit` rather than directly iterating an internal listener map
- [ ] Unit test: a listener registered with `on` receives the emitted payload
- [ ] Unit test: `off` prevents the listener from receiving further events
- [ ] Unit test: a listener registered with `once` fires exactly once then is removed
- [ ] Unit test: `removeAllListeners()` with no argument clears all events; with an event argument clears only that event
- [ ] Unit test: a throwing listener does not prevent other listeners on the same event from running
- [ ] All existing integration tests pass unchanged

## Blocked by

#134 — Session state machine transitions (both touch `emitLocal`; land state transitions first)
