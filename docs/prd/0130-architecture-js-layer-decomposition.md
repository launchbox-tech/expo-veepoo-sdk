# Architecture: JS layer decomposition — EventBus, typed event normalizers, Session state machine, test helpers

**Issue:** #130
**Status:** Closed
**Labels:** (none)

## Problem Statement

The JS bridge layer has accrued structural friction that slows every new feature. `VeepooSDKRuntime` mixes five distinct concerns (event subscription management, state mutation, event dispatch, logging, and error handling) in a single class, so all six subsystems carry a dependency on the whole runtime object even when they need only one concern. The `emitLocal` method embeds `readOriginProgress` deduplication logic (a domain concern) inside the event dispatch path (an infrastructure concern), making both independently invisible. The event normalizer erases TypeScript's type information by returning `unknown`, so incorrect payload shapes surface at the subscriber rather than at the seam. Session state transitions are implicit — three different event names trigger the same `setConnectedDeviceId(null)` mutation through `if (event === ...)` blocks inside the dispatch loop. Test mock factories are duplicated across test files, meaning every new native method requires updates in multiple places. Together, these issues make each new capability addition touch more files than necessary, and make existing behaviour harder to test in isolation.

## Solution

Decompose the JS bridge layer into focused, independently-testable modules:

1. Extract an `EventBus` module responsible only for typed event subscription and dispatch.
2. Replace the untyped `normalizeEventPayload` function with a typed normalizer dispatch table keyed on `VeepooEvent`.
3. Extract `readOriginProgress` deduplication into a named pure module (`OriginReadProgressFilter`).
4. Give `VeepooSdkState` explicit Session transition methods so state changes are named and testable without emitting events.
5. Extract a shared mock native factory for tests, driven by the existing async method registry.
6. Introduce per-subsystem TypeScript interfaces so the facade is typed as a composition of subsystem interfaces.

## User Stories

1. As an SDK maintainer, I want event dispatch and event subscription concerns separated from state management, so that I can test each in isolation without wiring up the full runtime.
2. As an SDK maintainer, I want `readOriginProgress` deduplication logic extracted from the event dispatch path, so that I can reason about and test the deduplication behaviour independently.
3. As an SDK maintainer, I want the event normalizer to return `VeepooEventPayload[K]` for each event key, so that TypeScript rejects an incorrectly shaped normalizer return value at the seam rather than at the subscriber.
4. As an SDK maintainer, I want every event in `VeepooEvent` to have a corresponding entry in the typed normalizer table, so that a missing normalizer is a compile error rather than a silent runtime gap.
5. As an SDK maintainer, I want Session state transitions (`onDeviceConnected`, `onDeviceDisconnected`, `onConnectionStatusChanged`) as explicit named methods on the state module, so that all logic for "what clears connectedDeviceId" lives in one place.
6. As an SDK maintainer, I want a single shared mock native factory exported from a test helper, so that adding a new async method to the native interface requires updating only one place.
7. As an SDK maintainer, I want the mock factory to accept per-test overrides, so that each test can pin exactly the values it cares about without duplicating the full default table.
8. As an SDK maintainer, I want the mock factory to be driven by `NATIVE_ASYNC_METHOD_NAMES`, so that the registry remains the source of truth for method existence.
9. As an SDK maintainer, I want each subsystem to declare its own TypeScript interface (`BandDiscoveryInterface`, `SessionInterface`, `HealthDataInterface`, `DeviceSettingsInterface`, `RealtimeTestsInterface`, `SdkLifecycleInterface`), so that the facade can be typed as a composition of those interfaces.
10. As an SDK maintainer, I want `VeepooSDKModuleInterface` to be derivable from the subsystem interfaces, so that adding a method to a subsystem automatically propagates to the facade's expected surface.
11. As an SDK maintainer, I want subsystems to declare a dependency on the smallest interface they actually need (event bus, state, logger, error handler), so that tests for a subsystem can mock only the slice they use.
12. As an SDK maintainer, I want the `emitLocal` function to delegate to named transition methods rather than `if (event === ...)` blocks, so that adding a new event that drives a state change is a one-line addition to a dispatch table.
13. As an SDK maintainer, I want `readOriginProgress` deduplication testable by calling a pure function with progress values, so that I can verify "skip equal progress" and "reset on start" rules without emitting native events.
14. As an SDK maintainer, I want each typed normalizer entry tested against a representative raw fixture, so that a change to the Band's BLE payload format causes a test failure at the normalizer seam.
15. As an SDK maintainer, I want the `EventBus` instantiable without a native module, so that JS-only tests can verify event routing end-to-end.

## Implementation Decisions

### Modules built or modified

**`EventBus` (new)**
Encapsulates `on`, `off`, `once`, `emit`, and `removeAllListeners`. Holds the JS listener map and native subscription list. Does not know about state, logging, or error mapping. Receives a typed payload for each event.

**Typed normalizer registry (modify normalizers/events)**
Replace the `(event: VeepooEvent, payload: unknown): unknown` signature with a `Record<VeepooEvent, (raw: unknown) => VeepooEventPayload[VeepooEvent]>` dispatch table. Each entry is a function whose return type matches the corresponding `VeepooEventPayload` slot. The existing normalizer functions become the values; the table structure enforces completeness.

**`OriginReadProgressFilter` (new)**
A pure module holding the `lastProgress` map per device, exposing `shouldEmit(deviceId, state, progress): boolean`. Currently embedded in `emitLocal`; extracted so it can be unit-tested with direct calls.

**Session transitions on `VeepooSdkState` (modify)**
Add `onDeviceConnected(deviceId: string)`, `onDeviceDisconnected(deviceId: string | undefined)`, and `onConnectionStatusChanged(deviceId: string | undefined, status: ConnectionStatus)` methods. The `emitLocal` state-mutation blocks become three named calls. Transition logic (what to clear, when) moves into the state module.

**`VeepooSDKRuntime` (modify)**
Becomes a wiring point: instantiates `EventBus`, delegates state mutations to named methods, owns logging. No longer contains inline `if (event === ...)` state mutation blocks or deduplication logic.

**Per-subsystem interfaces (new)**
`BandDiscoveryInterface`, `SessionInterface`, `HealthDataInterface`, `DeviceSettingsInterface`, `RealtimeTestsInterface`, `SdkLifecycleInterface`. `VeepooSDKModuleInterface` is composed as an intersection of these.

**Shared test mock factory (new test helper)**
Exports `makeMockNative(overrides?)`. Iterates `NATIVE_ASYNC_METHOD_NAMES` to build the base mock; applies overrides. Existing test files import from this helper. Duplicated `makeMockNative` implementations are removed.

### Architectural decisions

- `VeepooSDKRuntime` is not deleted — it remains the wiring class that owns the `native` reference, the `EventBus`, the `VeepooSdkState`, and log dispatch. The decomposition extracts behaviour out of it, not its existence.
- Subsystem interfaces are introduced at the TypeScript level only. No new runtime abstractions — subsystems remain concrete classes injected at construction time.
- The `readOriginProgress` filter is the only domain-specific logic currently in `emitLocal`. All other state-mutation blocks factor into `VeepooSdkState` transitions.
- The typed normalizer table keeps existing normalizer function implementations; it adds a structural wrapper that enforces completeness and return types.
- `VeepooSDK` (the facade class) and the singleton default export are unchanged. The public `VeepooSDKModuleInterface` as seen by host apps is unchanged.

### Suggested delivery sequence

1. Shared mock factory (test helper) — zero runtime impact, immediately reduces test maintenance burden.
2. `OriginReadProgressFilter` extraction + typed normalizer table — independent of runtime restructuring.
3. Session transition methods on `VeepooSdkState`.
4. `EventBus` extraction and `emitLocal` refactor.
5. Per-subsystem interfaces.

## Testing Decisions

**What makes a good test here:**
Test external behaviour through the module's interface, not implementation details. For `EventBus`, test that a listener registered with `on` receives the emitted payload — not that a specific internal map was modified. For state transitions, test that `getConnectedDeviceId()` returns the expected value after calling a transition method — not that `setConnectedDeviceId` was called internally.

**Modules to test:**

- `EventBus`: subscription/dispatch lifecycle (`on`, `off`, `once`, `removeAllListeners`), listener error isolation, multiple listeners for the same event.
- `OriginReadProgressFilter`: equal progress is suppressed; decreasing progress passes; `state === "start"` resets; increasing progress passes.
- `VeepooSdkState` transitions: `onDeviceConnected` sets the id; `onDeviceDisconnected` clears it when matching; `onConnectionStatusChanged` clears on `"disconnected"` only.
- Typed normalizer registry: each slot receives a representative raw fixture and returns the expected typed value.
- Shared mock factory: builds successfully from the full `NATIVE_ASYNC_METHOD_NAMES` list; overrides are applied correctly.

**Prior art:** `src/__tests__/normalizers.test.ts`, `src/__tests__/VeepooSDK.test.ts`, `src/__tests__/session-baseline.test.ts`.

## Out of Scope

- Changes to native (Kotlin/Swift) code.
- Changes to the public `VeepooSDKModuleInterface` as seen by host apps — method signatures and event types remain unchanged.
- Removing the `VeepooSDK` class or the singleton default export.
- Moving responsibility for reconnection, retry, or stored `deviceId` into the module.
- New Band capabilities or health test modalities.

## Further Notes

The five deepening candidates share a common seam: `VeepooSDKRuntime.emitLocal`. Extracting `EventBus` and `OriginReadProgressFilter` first unblocks the state transition refactor; the typed normalizer table and subsystem interfaces can land independently. The shared mock factory can be extracted in a preparatory commit before any structural changes.
