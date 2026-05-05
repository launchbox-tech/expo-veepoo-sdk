# PRD #166 — feat(react): VeepooSDKProvider + reactive state bridge (useSyncExternalStore)

**Status:** Closed
**Labels:** enhancement

## Problem Statement

Consumers of expo-veepoo-sdk must hand-wire every React integration themselves. The SDK exports a raw event-emitter + Promise API with no React primitives. To build a working app, a developer must:

- Manually call `sdk.init()` and `sdk.destroy()` inside a `useEffect`
- Register every event listener individually with `sdk.on(event, handler)` and manage cleanup
- Duplicate SDK internal state (connection status, scan status, initialization) across multiple local `useState` calls
- Prop-drill that duplicated state through the component tree (the reference example passes 179 props to a single screen component)
- Accept stale-closure and cleanup-ordering bugs as an inherent cost of the pattern

There is no shared context, no provider hierarchy, and no subscription to SDK state changes — React has no reactive path to the SDK's internal state.

## Solution

Ship a React-first integration layer as part of the main package. A `<VeepooSDKProvider>` at the app root owns the SDK lifecycle and exposes shared state via React Context. An observable `VeepooSDKStateStore` bridges the SDK's internal event bus to React's `useSyncExternalStore`, making connection/scan/session status reactive without any manual `setState` calls. A `useVeepooSDK()` hook gives any component in the tree access to the SDK instance, current status, and init error. A `useSDKState(selector)` hook allows fine-grained subscriptions that only re-render when the selected slice changes. Thin convenience hooks wrap the most common selectors.

## User Stories

1. As a React Native developer, I want to wrap my app in `<VeepooSDKProvider>` so that SDK initialisation and teardown are handled automatically without writing any `useEffect` boilerplate.
2. As a React Native developer, I want `VeepooSDKProvider` to call `sdk.init()` on mount and `sdk.destroy()` on unmount automatically, so that the SDK lifecycle is tied to the component tree.
3. As a React Native developer, I want to pass optional `logLevel` and `logger` props to `VeepooSDKProvider`, so that I can configure SDK logging without accessing the instance directly.
4. As a React Native developer, I want `VeepooSDKProvider` to expose an `error` value in context when `sdk.init()` fails, so that I can render an appropriate error UI without try/catch boilerplate in every consumer.
5. As a React Native developer, I want to call `useVeepooSDK()` in any component inside the provider tree, so that I can access the SDK instance, current status, and init error from a single hook.
6. As a React Native developer, I want `useVeepooSDK()` to return a stable `sdk` reference, so that I can call capability methods (`sdk.battery.readBattery()`, `sdk.session.connect()`) without registering separate event listeners.
7. As a React Native developer, I want `status.isConnected` to reflect whether a BLE link is currently established, so that I can show connection-level UI (e.g. "connecting…") accurately.
8. As a React Native developer, I want `status.isReady` to reflect whether a full Session is active (BLE link + password verified), so that I can gate health-data operations on the correct state.
9. As a React Native developer, I want `status.isScanning` to reflect live Band Discovery state, so that I can drive scan UI (spinner, stop button) without subscribing to scan events manually.
10. As a React Native developer, I want `status.connectedDeviceId` to reactively update when a Band connects or disconnects, so that I can display the paired device identity without a separate event listener.
11. As a React Native developer, I want `status.initialized` to reflect whether the SDK has completed initialisation, so that I can gate the entire app UI on readiness.
12. As a React Native developer, I want a `useSDKState(selector)` hook that accepts a selector function over the state snapshot, so that I can subscribe to only the slice I need and avoid unnecessary re-renders.
13. As a React Native developer, I want `useSDKState` to use `Object.is` comparison on the selected value, so that primitive selectors (`s => s.isConnected`, `s => s.connectedDeviceId`) never cause spurious re-renders.
14. As a React Native developer, I want a `useIsConnected()` convenience hook, so that I can read BLE connection state in a single line without writing a selector.
15. As a React Native developer, I want a `useIsSessionReady()` convenience hook, so that I can read Session readiness in a single line without writing a selector.
16. As a React Native developer, I want a `useIsScanning()` convenience hook, so that I can read Band Discovery state in a single line without writing a selector.
17. As a React Native developer, I want a `useConnectedDeviceId()` convenience hook, so that I can read the connected Band's identifier in a single line without writing a selector.
18. As a React Native developer, I want a `useSDKInitialized()` convenience hook, so that I can read SDK initialisation status in a single line.
19. As a React Native developer, I want all provider and hook exports available from the main `expo-veepoo-sdk` import, so that I do not need to use a sub-path import for React integration.
20. As a React Native developer, I want calling `useVeepooSDK()` outside of a `VeepooSDKProvider` to throw a descriptive error, so that misconfiguration is caught at runtime with a clear message rather than a cryptic undefined-access.
21. As a React Native developer, I want the example app's seven custom hooks replaced with thin consumers of `useVeepooSDK()` and `useSDKState()`, so that I can see a real-world usage pattern without 179-prop drilling.
22. As a React Native developer, I want the `VeepooSDKStateStore` to clean up all SDK event subscriptions when the Provider unmounts, so that there are no listener leaks after navigation away from an SDK-dependent screen.
23. As a React Native developer, I want the `VeepooSDKStateStore` to derive its initial snapshot from the SDK's existing state getters at construction time, so that if the SDK was already initialised before the Provider mounts, the snapshot is accurate immediately.

## Implementation Decisions

### Modules

**VeepooSDKStateStore**
- A pure observable class with no React dependency
- Constructor accepts a `VeepooSDK` instance and subscribes to lifecycle events: `initialized`, `deviceConnected`, `deviceDisconnected`, `deviceReady`, `scanStarted`, `scanStopped`
- Exposes `subscribe(listener: () => void): () => void` and `getSnapshot(): SDKStateSnapshot`
- `SDKStateSnapshot` is a plain frozen object with five fields: `initialized: boolean`, `isConnected: boolean`, `isReady: boolean`, `isScanning: boolean`, `connectedDeviceId: string | null`
- Each state-changing event creates a new snapshot object (immutable update pattern) to satisfy `useSyncExternalStore`'s reference-equality contract
- Derives its initial snapshot from the SDK's existing state getters at construction time (handles pre-existing connection state)
- Exposes a `destroy()` method that unsubscribes all listeners

**VeepooSDKContext (internal)**
- React Context holding `{ sdk: VeepooSDK, store: VeepooSDKStateStore, error: VeepooError | null }`
- Not exported — consumers use `useVeepooSDK()` and `useSDKState()`

**VeepooSDKProvider**
- Creates a single `VeepooSDK` instance in a stable ref (not state — avoids re-renders on init)
- Applies `logLevel` and `logger` props before calling `init()`
- Calls `sdk.init()` inside a `useEffect` on mount; catches errors into local state as `error: VeepooError | null`
- Calls `sdk.destroy()` and `store.destroy()` in the effect's cleanup
- Creates `VeepooSDKStateStore` once alongside the SDK instance
- Provider props: `children: React.ReactNode`, `logLevel?: LogLevel`, `logger?: LogListener`

**useVeepooSDK()**
- Reads `VeepooSDKContext`; throws a descriptive error if called outside the Provider
- Returns `{ sdk: VeepooSDK, status: SDKStateSnapshot, error: VeepooError | null }`
- `status` is derived via `useSyncExternalStore` against the store in context

**useSDKState(selector)**
- Signature: `useSDKState<T>(selector: (state: SDKStateSnapshot) => T): T`
- Implemented with `useSyncExternalStore(store.subscribe, () => selector(store.getSnapshot()))`
- Selector stability is the caller's responsibility; primitives work without `useCallback`

**Convenience hooks**
- `useIsConnected(): boolean`
- `useIsSessionReady(): boolean`
- `useIsScanning(): boolean`
- `useConnectedDeviceId(): string | null`
- `useSDKInitialized(): boolean`
- Each is a one-liner delegating to `useSDKState`

### State mapping

| SDK event | Snapshot field(s) updated |
|---|---|
| `initialized` | `initialized → true` |
| `deviceConnected` | `isConnected → true`, `connectedDeviceId → deviceId` |
| `deviceReady` | `isReady → true` |
| `deviceDisconnected` | `isConnected → false`, `isReady → false`, `connectedDeviceId → null` |
| `scanStarted` | `isScanning → true` |
| `scanStopped` | `isScanning → false` |

### Export surface
All new symbols exported from the main package entry point alongside existing exports. No new sub-path required.

### Example app migration
The seven example hooks (`useSDKInit`, `useBandScan`, `useBandSession`, `useHealthTests`, `useDataSync`, `useSDKEvent`, `usePassiveEvents`) are refactored to consume `useVeepooSDK()` and `useSDKState()` internally, eliminating all manual `sdk.on/off` boilerplate and the 179-prop `ReadyScreen`.

## Testing Decisions

Good tests for this feature verify externally observable behaviour — what state the store holds after events fire, what values hooks return after Provider renders — not internal implementation choices like which private fields exist or how listeners are stored.

**VeepooSDKStateStore** (unit tests, no React)
- Construct with a mock SDK; assert initial snapshot matches SDK state getters
- Emit each lifecycle event; assert the snapshot fields update correctly
- Emit `deviceDisconnected` after a connection; assert `isConnected`, `isReady`, and `connectedDeviceId` all clear
- Subscribe → emit event → assert listener was called exactly once
- Call `destroy()`; assert no further listener calls after subsequent emits

**useSDKState / useVeepooSDK** (hook tests with `renderHook` + mock Provider)
- Render hook inside a Provider backed by a mock SDK; assert initial status values
- Simulate SDK events via mock; assert hook return values update
- Render hook outside Provider; assert descriptive error is thrown

**Prior art in codebase:** `src/__tests__/` — existing tests for event contracts and native rejection mapping establish the mock-SDK pattern to follow.

## Out of Scope

- Candidate 3 (capability hooks: `useBattery()`, `useHealthTests()`, etc.) — covered separately
- Candidate 4 (Session status machine replacing `appStateReducer`) — covered separately
- Candidate 5 (per-event hooks with auto-lifecycle) — covered separately
- Server-side rendering support
- React Native Web support
- Multiple simultaneous Provider instances

## Further Notes

- `useSyncExternalStore` requires React 18+. The SDK's `peerDependencies` already list `react >= 18` via Expo SDK 52, so no peer dependency change is needed.
- `isConnected` and `isReady` are distinct states matching the domain glossary: a Session (`isReady`) requires a BLE link (`isConnected`) plus password verification. Callers guarding health-data operations should check `isReady`, not `isConnected`.
- The `VeepooSDKStateStore` class has no React import and can be unit-tested in a plain Node environment, making it the most isolated and testable seam in the new architecture.
