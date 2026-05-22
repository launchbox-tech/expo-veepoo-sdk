# Event-to-state dispatch lives inside `VeepooSdkState`

## Status

Accepted

## Context

`VeepooSdkState` (`src/sdk/veepoo-sdk-state.ts`) holds the SDK's mutable Session / scan / init fields. Native events fold into that state on `VeepooSDKRuntime.emitLocal`. There used to be a separate `src/sdk/sdk-state-reducer.ts` module exporting `applyStateEvent(event, payload, ctx)`, with `ctx = { state, originReadPipeline }`. The reducer was extracted for testability: it could be tested without spinning up an `EventBus`, native module, or logger. The transitions themselves (`onDeviceConnected`, `onDeviceDisconnected`, `onConnectionStatusChanged`) lived as public methods on `VeepooSdkState`, and both modules had their own test files (`veepoo-sdk-state.test.ts`, `sdk-state-reducer.test.ts`) covering overlapping behaviour.

This was the canonical extracted-for-testability anti-pattern: the same transition rules were stated twice (once as state methods, once as reducer branches), the reducer's public interface existed only so isolated tests could call it, and pipeline cleanup on disconnect leaked through the reducer into a "state" module.

## Decision

Event-to-state dispatch lives **inside** `VeepooSdkState`, as a public `applyEvent<K>(event: K, payload: VeepooEventPayload[K])` method. The per-event branches are an **internal** seam (a `switch` in the method body), invisible to callers. The previous public transition methods (`onDeviceConnected`, `onDeviceDisconnected`, `onConnectionStatusChanged`) are private helpers. The standalone reducer module and its test file are deleted.

The bridge-level side-effect that disconnect clears the per-device entry in `OriginReadPipeline` lives explicitly in `VeepooSDKRuntime.emitLocal`, not in the state module. State knows about Session/scan/init fields only.

Test surface:
- `veepoo-sdk-state.test.ts` drives `applyEvent` + the public setters. The internal `on*` helpers are not tested directly — the interface is the test surface.
- `veepoo-sdk.test.ts` covers the pipeline-clear-on-disconnect behaviour as a runtime-level assertion.

## Consequences

- One module owns Session/scan/init state and its event-driven transitions. One source of drift, one place to extend when a new event affects state.
- Future architecture reviews seeing the `switch` table inside `applyEvent` and suggesting "extract a reducer for testability" should treat this ADR as the answer: we tried that shape and it duplicated rules across two modules without buying isolation that the public interface didn't already provide.
- Tests must drive `applyEvent` rather than calling transition methods directly. This is the point — the interface is the test surface.

## Links

- Architecture review (2026-05-22): `/improve-codebase-architecture` candidate #1
- State module: [`src/sdk/veepoo-sdk-state.ts`](../../src/sdk/veepoo-sdk-state.ts)
- Runtime emit path: [`src/sdk/veepoo-sdk-runtime.ts`](../../src/sdk/veepoo-sdk-runtime.ts)
- Related: [`ADR 0005`](0005-facade-interface-composition-by-construction.md) — capability classes are their own interface; this ADR applies the same "interface by construction, not separate type" idea to state dispatch.
