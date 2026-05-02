# PRD: refactor(sdk): TDD refactor of VeepooSDK

> GitHub: https://github.com/launchbox-tech/expo-veepoo-sdk/issues/22
> Status: closed | Labels: enhancement

## Problem Statement

As an SDK maintainer, the `VeepooSDK` class is currently impossible to unit test and difficult to read. The `emitLocal()` method contains a 12-level deep nested ternary chain that maps event names to normalizer functions — a block of ~60 lines with no flat structure and no ability to verify individual cases in isolation. The class has zero unit tests. Core responsibilities (payload normalization, state mutation, logging, and event dispatch) are all tangled inside a single method. The native module is bootstrapped directly inside the file, duplicating logic that already lives in `NativeVeepooSDK.ts` and providing no seam for injecting a test double. There is also a pre-existing bug in `once()` that causes it to behave identically to `on()` — the registered wrapper is never removed after the first fire.

## Solution

Refactor `VeepooSDK.ts` using TDD: write a comprehensive test suite first (Red), then refactor the implementation to pass it (Green). The refactor introduces constructor injection for the native module, extracts payload normalization into a standalone exported pure function (`normalizeEventPayload`), pulls state mutations into a private `updateStateFromEvent()` method, simplifies `emitLocal()` to ~25 readable lines, fixes the `once()` bug, converts 3 bare pass-through methods to arrow function class properties, and gates all console output behind `__DEV__` to prevent log noise in production builds.

## User Stories

1. As an SDK maintainer, I want a unit test suite for `VeepooSDK`, so that I can confidently modify the class without introducing regressions.
2. As an SDK maintainer, I want the `emitLocal()` method to be readable at a glance, so that I can reason about the event dispatch flow without decoding a nested ternary.
3. As an SDK maintainer, I want `normalizeEventPayload` to be a standalone pure function with its own tests, so that I can verify each of the 17 event normalization cases independently.
4. As an SDK maintainer, I want the `VeepooSDK` constructor to accept an optional native module parameter, so that tests can inject a mock without touching the module system.
5. As an SDK maintainer, I want state mutations (scanning, connected device, progress tracking) to live in a dedicated private method, so that the event dispatch path is not cluttered with side effects.
6. As an SDK maintainer, I want the `once()` method to fire exactly once and then remove the listener, so that event handlers registered with `once()` do not accumulate indefinitely.
7. As an SDK maintainer, I want the native module bootstrap logic to live in one place (`NativeVeepooSDK.ts`), so that there is no duplicated proxy fallback code in `VeepooSDK.ts`.
8. As an SDK maintainer, I want the `addListener` call in `setupEventListeners()` to use the properly typed `NativeVeepooSDKInterface`, so that there is no `as unknown as` cast in the codebase.
9. As an SDK maintainer, I want the 3 bare pass-through methods (`syncPersonalInfo`, `readDeviceAllData`, `setLanguage`) written as arrow function class properties, so that there are no unnecessary `async`, `return`, and `{}` keywords for one-liner delegations.
10. As an SDK maintainer, I want console log output to be automatically suppressed in production builds, so that verbose debug logs never reach end users.
11. As an SDK maintainer, I want the `__DEV__` gate to be defensive (`typeof __DEV__ === 'undefined' || __DEV__`), so that the SDK does not silently suppress logs in non-React-Native environments such as test runners that do not define `__DEV__`.
12. As an SDK maintainer, I want the custom `logger` callback to remain ungated by `__DEV__`, so that apps wiring up a production-safe remote logger (e.g. crash reporter) are not blocked.
13. As a host app developer, I want SDK console logs to appear in development but not in production, without needing to call any configuration method, so that I get useful debugging output automatically.
14. As a host app developer, I want `once()` to register a handler that fires exactly once, so that I can listen for a single `deviceReady` or `readOriginComplete` event without manually calling `off()`.
15. As a host app developer, I want the SDK's public API (exports from `index.ts`) to remain unchanged after this refactor, so that I do not need to update my integration code.
16. As a host app developer, I want errors thrown inside my event listeners to be caught by the SDK, so that a bug in one listener does not break all other listeners for the same event.
17. As an SDK maintainer, I want a test that sets `__DEV__ = false` and asserts no console output occurs, so that the production log-suppression path is explicitly verified and cannot silently regress.
18. As an SDK maintainer, I want the `readOriginProgress` deduplication logic (suppress exact duplicate values, allow resets, always allow `readState: 'start'`) to be covered by tests, so that the dedup behavior is documented and protected.
19. As an SDK maintainer, I want `normalizeEventPayload` to handle non-object payloads (null, number, string) by returning them unchanged, so that unexpected native payloads do not cause runtime crashes.

## Implementation Decisions

### Modules

**`normalizeEventPayload` (new pure function, exported from `VeepooSDK.ts`)**
- Replaces the 12-level nested ternary in `emitLocal()`
- Switch statement with one case per event type that requires normalization (17 cases + default pass-through)
- Guard: if payload is not an object, return it unchanged
- Exported from `VeepooSDK.ts` for direct test access; not re-exported from `index.ts`
- `bluetoothStateChanged` and `readOriginProgress` pass the full payload to their normalizer; all other 15 cases pass a sub-field (`data` or `result`) and spread the result back

**`VeepooSDK` class (modified)**
- Constructor gains an optional `native: NativeVeepooSDKInterface` parameter defaulting to the `VeepooSDKNativeWrapper` instance exported from `NativeVeepooSDK.ts`
- Duplicate `requireNativeModule` bootstrap removed from this file
- All `NativeModule.x()` calls replaced with `this.native.x()`
- New private method `updateStateFromEvent(event, payload)` encapsulates the 4 state-mutation blocks previously inline in `emitLocal()`
- `emitLocal()` reduced to: normalize → progress dedup → log → update state → dispatch to listeners
- `setupEventListeners()` uses `this.native.addListener(event, listener)` directly, removing the `as unknown as` cast
- `once()` fixed: the wrapper function deletes itself from the listeners Set before calling the original listener, using `let wrapper!: EventListener` to satisfy TypeScript strict mode
- Console output in `log()` gated with `this.logEnabled && (typeof __DEV__ === 'undefined' || __DEV__)`; custom `logger` callback is not gated
- 3 bare pass-throughs converted to arrow function class properties: `syncPersonalInfo`, `readDeviceAllData`, `setLanguage`
- 12 start/stop test methods retain their `async` form and `this.log()` call
- The singleton export (`const sdk = new VeepooSDK()`) at the bottom of the file is unchanged
- `src/index.ts` requires no changes

**Test suite (`src/__tests__/VeepooSDK.test.ts`)**
- New file — prior art is `src/normalizers.test.ts`
- Uses constructor injection; does not rely on Jest module mocking for `VeepooSDK` behavior
- `expo-modules-core` mocked at the top of the file to prevent `requireNativeModule` from throwing during module load
- `makeMockNative()` helper returns a `jest.Mocked<NativeVeepooSDKInterface>` extended with an `_emit(event, payload)` test helper that dispatches directly to registered listeners

### Architectural decisions

- `normalizeEventPayload` is exported from `VeepooSDK.ts` for testability but intentionally omitted from `index.ts` — it is an internal utility, not a public API contract
- `updateStateFromEvent()` is `private` and tested only via event emission (not directly); coverage tools count its lines when exercised through `_emit`
- `__DEV__` is read as a global (it is a standard React Native runtime global, used directly by `expo-modules-core`); no explicit import or host configuration is required
- The `once()` fix is bundled in this refactor because the TDD test for it (`'fires exactly once'`) will be Red on the current code and Green only after the fix — separating them would require shipping a failing test

## Testing Decisions

### What makes a good test here

A good test asserts observable behavior through the SDK's public interface — return values, emitted events, state accessor results, and calls to `native.*` methods. It does not assert on private method calls, internal state fields, or implementation structure. The test suite should remain valid if the internals are rearranged without changing behavior.

### Modules with tests

**`normalizeEventPayload`** (direct unit tests)
- All 17 normalization cases with realistic payloads
- Pass-through for events not in the switch (`deviceFound`, `deviceConnected`, etc.)
- Non-object payload guard (null, number, string)

**`VeepooSDK` class** (behavioral tests via constructor injection)
- State accessors before and after lifecycle events
- `init()` idempotence
- `destroy()` cleanup
- Scan start/stop idempotence and error recovery
- Connect/disconnect with and without explicit device ID
- Full event system: `on`, `off`, `once` (regression for the bug), `removeAllListeners`
- State mutations triggered by native events: bluetooth state, device connected/disconnected, connection status
- `readOriginProgress` deduplication: suppress exact duplicate, allow backward reset, always allow `readState: 'start'`
- Error handling: `checkBluetoothStatus` and `requestPermissions` catch and surface errors
- Logging: `setLogEnabled`, `setLogger`, console invocation, `__DEV__ = false` production suppression
- Arrow pass-through delegation: `syncPersonalInfo`, `readDeviceAllData`, `setLanguage`
- Representative data methods: `readBattery`, `readSleepData`, `readOriginData`, `startHeartRateTest`, `stopHeartRateTest`

### Prior art

`src/normalizers.test.ts` — the only existing test file in this project. Uses bare Jest imports (no `.js` extension), plain `describe`/`it` blocks, no module mocking. The new test file follows the same conventions. Test runner is `expo-module test` (Jest via `expo-module-scripts`), which sets `roots: ['<rootDir>/src']` and supports both co-located and `__tests__/` subfolder placement.

## Out of Scope

- Adding `try/catch` error handling to pass-through methods (`syncPersonalInfo`, `readDeviceAllData`, `setLanguage`) — these are intentionally bare
- Adding or removing logging calls to the 12 start/stop test methods
- Changes to `src/normalizers.ts` — normalizer functions are reused as-is
- Changes to `src/NativeVeepooSDK.ts`, `src/types.ts`, or `src/index.ts`
- Behavioral changes to any public API method beyond fixing `once()`
- Adding a `setDebugMode(flag)` or init-time `debug` parameter — `__DEV__` is auto-detected from the global

## Further Notes

The `once()` defect has been present since the event system was introduced. Any caller currently relying on `sdk.once()` to receive exactly one event will have been receiving all subsequent events too — silently. After this fix, `once()` will correctly unregister after the first fire. This is a behavior change but a correct one; no migration path is needed for a private package.

The `__DEV__` gate applies only to console output inside the SDK's `log()` method. Errors logged via `console.error` inside event listener catch blocks (`Error in event listener for ${event}:`) are intentionally not gated — those represent bugs in the host app's listener code and should surface in all environments.
