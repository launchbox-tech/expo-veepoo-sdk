# snake_case for all JS-facing types

The public JS/TS API uses snake_case for object property names and string literal union values. A `deepSnakeKeys` transformer runs as a post-step in `normalizeEventPayload` to convert native camelCase keys to snake_case before consumers see them. For the write direction, a `deepCamelKeys` inverse is applied at each capability call site before invoking native. Both utilities are internal and not exported.

Event names (the strings passed to `sdk.on(...)` / `sdk.off(...)`) are **also snake_case** on the JS surface (`device_found`, `heart_rate_test_result`, `bluetooth_state_changed`, …). See the **Revised** section below — this overrides the original "rejected" option for events and supersedes the camelCase-events clause of this ADR.

## Considered Options

- **Keep camelCase throughout** — JS convention, zero transform cost. Rejected: the codebase already mixes camelCase properties with UPPER_CASE constants and the odd `never_ask_again` value; camelCase was never consistent in practice.
- **Type-level `DeepCamelToSnake<T>` utility** — derive snake_case types from existing camelCase types automatically. Rejected: TypeScript's character-by-character string recursion cannot replicate the two-pass regex needed for correct acronym handling (`btSwitchOpen` → `bt_switch_open` at runtime, `bt_switch_open` at the type level — but naively `b_t_switch_open`). Runtime and types would silently diverge on any property with consecutive uppercase letters.
- **Rename event names too** — fully consistent snake_case API including `addEventListener('heart_rate_test_result', ...)`. Originally rejected for the cost of a mapping layer in the event bus — **but this option was later shipped**. See **Revised** below.
- **Rename payload properties only, leave method input types camelCase** — half-scope. Rejected: leaves camelCase in consumer-written code (`is24Hour`, `brightMode`) which is the exact inconsistency the change is meant to eliminate.

## Consequences

- All 7 type definition files are manually renamed (not generated) so acronym handling is exact and readable.
- `deepSnakeKeys` and `deepCamelKeys` are internal utilities; consumers always write snake_case and never interact with the transform layer.
- String literal union values that were camelCase (`'poweredOff'`, `'notDetermined'`, `'fileNotExist'`, etc.) are mapped to snake_case in their respective capability normalizers.
- Test coverage: utility unit tests (including acronym edge cases), normalizer output shape tests, and capability-level round-trip tests with mocked native.

## Revised (2026-05-22)

This ADR originally rejected "rename event names too" on the basis that a `NATIVE_TO_JS` event name mapping layer was added complexity not worth the ergonomic gain. **That option was later shipped.** Event names on the JS surface are snake_case:

```ts
sdk.on('heart_rate_test_result', (payload) => { /* … */ });
sdk.on('bluetooth_state_changed', (payload) => { /* … */ });
```

The mapping layer lives in `src/bridge/veepoo-events-registry.ts` as `NATIVE_TO_JS_EVENT_MAP`, which translates native camelCase event names (e.g. `deviceFound`, `heartRateTestResult`) to their JS snake_case counterparts (`device_found`, `heart_rate_test_result`). `src/bridge/event-bus.ts:27-33` walks `NATIVE_EMITTED_EVENTS` at setup and registers a native listener per event under the JS name.

**Why the reversal:** with the mapping table in place — 53 entries, structurally enforced by a `satisfies Record<(typeof NATIVE_EMITTED_EVENTS)[number], string>` constraint — the runtime cost is one extra lookup per event dispatch, and the maintenance burden is one row per event. The consistency gain across the public surface (every event name is snake_case, matching every payload key and every literal union value) outweighed the original cost estimate.

**Consequence:** `JS_EXPOSED_NATIVE_EVENTS` (derived from the values of `NATIVE_TO_JS_EVENT_MAP`) is the canonical list of native-sourced JS event names. `JS_LOCAL_ONLY_EVENTS` covers JS-side-only events (`sdk_initialized`, `scan_started`, `scan_stopped`, …). Host apps subscribe to either via the same `sdk.on(snake_case_name, …)` interface.
