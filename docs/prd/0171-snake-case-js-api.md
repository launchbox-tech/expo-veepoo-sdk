# PRD: Rename all JS-facing types and string values to snake_case

**Issue:** #171
**Status:** Open
**Labels:** enhancement, needs-triage

## Problem Statement

The JS/TS public API of the SDK uses camelCase property names and string literal values (e.g. `deviceId`, `heartValue`, `poweredOff`, `notDetermined`). This is inconsistent in practice — some unions already use `never_ask_again` and `powered_off`, constants use `UPPER_CASE`, and the overall casing has drifted with no single convention. Developers reading or writing code against the SDK must constantly context-switch between casing styles.

## Solution

Rename all JS-facing object property names and string literal union values to snake_case. Event names (the strings passed to `addEventListener`, e.g. `'heartRateTestResult'`) stay camelCase — they are native bridge contracts that cannot be changed without a coordinated native release. Method names stay camelCase — they are verbs and snake_case verbs are unconventional in JS/TS. A transform layer at the bridge boundary handles the camelCase ↔ snake_case conversion transparently so consumers never interact with native naming.

## User Stories

1. As a companion app developer, I want all event payload properties to use snake_case (e.g. `device_id`, `heart_value`, `read_state`), so that I write consistent code without remembering which properties are camelCase.
2. As a companion app developer, I want all method input type properties to use snake_case (e.g. `is_24_hour`, `bright_mode`), so that the objects I construct match the same convention as the data I receive.
3. As a companion app developer, I want all string literal union values to use snake_case (e.g. `'powered_off'`, `'not_determined'`, `'file_not_exist'`), so that I can write `status === 'powered_off'` without looking up which casing the SDK uses.
4. As a companion app developer, I want the `addEventListener` call signatures to remain unchanged (e.g. `'heartRateTestResult'`), so that existing event subscriptions do not break.
5. As a companion app developer, I want method names to remain unchanged (e.g. `startScan()`, `connect()`, `setAlarm()`), so that call sites do not need to be updated.
6. As a companion app developer, I want TypeScript to surface a compile error if I pass a camelCase property to a method that expects snake_case, so that I catch mistakes at build time not runtime.
7. As a companion app developer, I want the SDK to transparently convert my snake_case method inputs to the camelCase format native expects, so that I never have to think about native naming conventions.
8. As a companion app developer, I want Band event payloads to arrive with snake_case keys regardless of what the native layer emits, so that I read `payload.device_id` consistently across all 53 events.
9. As a companion app developer, I want BluetoothState values like `'powered_off'` and `'powered_on'` instead of `'poweredOff'` and `'poweredOn'`, so that the string I compare against matches the SDK's own snake_case convention.
10. As a companion app developer, I want BluetoothAuthorization values like `'not_determined'` and `'allowed_always'` instead of `'notDetermined'` and `'allowedAlways'`, so that all permission-related string values use the same casing.
11. As a companion app developer, I want FirmwareDfuState values like `'file_not_exist'`, `'dfu_lang_connect_success'`, and `'dfu_lang_connect_failed'` instead of their camelCase equivalents, so that DFU state comparisons are consistent with the rest of the API.
12. As a SDK maintainer, I want the type definitions to be manually authored in snake_case (not derived from a type-level utility), so that acronym handling is exact and readable without risk of type-level divergence from runtime behaviour.
13. As a SDK maintainer, I want the `deepSnakeKeys` and `deepCamelKeys` utilities to be internal and not exported, so that consumers never interact with the transform layer directly.
14. As a SDK maintainer, I want the `deepSnakeKeys` converter applied as a single post-step in `normalizeEventPayload`, so that every event — pass-through and actively normalised alike — produces snake_case output without per-event boilerplate.
15. As a SDK maintainer, I want `deepCamelKeys` applied at each capability write call site before invoking native, so that the inverse transform is explicit and local to the point where native is called.
16. As a SDK maintainer, I want the two-pass regex algorithm used for camelCase→snake_case conversion, so that acronyms like `btSwitchOpen` correctly produce `bt_switch_open` rather than `b_t_switch_open`.
17. As a SDK maintainer, I want `deepSnakeKeys` and `deepCamelKeys` to handle nested objects, arrays, `null`, `undefined`, and primitive values correctly, so that no payload shape causes a runtime error in the transform layer.
18. As a SDK maintainer, I want string value maps for camelCase union values to live in each capability's existing normalizer, so that the mapping is co-located with the data that produced the value.
19. As a SDK maintainer, I want the example app updated to use all renamed properties and values, so that it continues to compile and run correctly against the refactored SDK.
20. As a SDK maintainer, I want the ADR for this decision recorded at `docs/adr/0004-snake-case-js-api.md`, so that future contributors understand why the JS API uses snake_case and do not attempt to revert it.

## Implementation Decisions

### New module: deep-keys utility
- A single new file in `src/normalizers/` exporting `deepSnakeKeys(value: unknown): unknown` and `deepCamelKeys(value: unknown): unknown`.
- Uses a two-pass regex algorithm: first collapses consecutive uppercase sequences (e.g. `BT` before a capitalised word), then inserts underscores before remaining uppercase letters, then lowercases. This correctly handles `btSwitchOpen` → `bt_switch_open`, `isOadModel` → `is_oad_model`, `spo2Value` → `spo2_value`.
- Recursively processes nested objects and arrays. Passes `null`, `undefined`, and non-object primitives through unchanged.
- Internal only — not exported from `src/index.ts`.

### Modified module: event normalizer
- `normalizeEventPayload` applies `deepSnakeKeys` as a final post-step after the per-event structural normalizer runs.
- No changes to the `EVENT_NORMALIZERS` dispatch table entries themselves — structural normalisation (key aliasing, value coercion) remains per-event; key conversion is now handled once at the boundary.

### Modified module: capability normalizers (string value maps)
- Capability normalizers that currently produce camelCase string union values add explicit value maps.
- Affected capabilities: `session` (BluetoothState, BluetoothAuthorization), `dfu` (FirmwareDfuState). Any other capability normalizers producing camelCase string values are updated similarly.

### Modified module: capability write-path call sites
- Every capability `index.ts` that passes a typed input object to a native method wraps the argument with `deepCamelKeys` at the `invoke` call site.
- The native method interface signatures in `native.ts` files do not change — they remain typed to the camelCase shapes the native layer expects.

### Modified module: type definitions (7 files)
- All ~477 camelCase property names across `connection.ts`, `device.ts`, `errors.ts`, `events.ts`, `health-data.ts`, `health-tests.ts`, and `settings.ts` are renamed to snake_case.
- All camelCase string literal union values are renamed to snake_case.
- Event names (keys of `VeepooEventPayload`) are unchanged.
- No type-level utility is used — renames are manual to ensure acronym correctness.

### Modified module: example app
- All property accesses and object constructions in `example/src/` are updated to use snake_case names and values.

## Testing Decisions

A good test for this refactor verifies the observable output or behaviour of a module, not the implementation path. Tests should not assert which internal functions are called — they should assert what the consumer receives.

### `deep-keys` utility (new `src/__tests__/deep-keys.test.ts`)
- Verify `deepSnakeKeys` correctly converts flat objects, nested objects, and arrays of objects.
- Verify `deepSnakeKeys` passes through `null`, `undefined`, numbers, strings, and booleans unchanged.
- Verify acronym edge cases: `btSwitchOpen` → `bt_switch_open`, `isOadModel` → `is_oad_model`, `spo2Value` → `spo2_value`, `is24Hour` → `is_24_hour`.
- Mirror tests for `deepCamelKeys`: `bt_switch_open` → `btSwitchOpen`, `is_24_hour` → `is24Hour`.
- Prior art: `src/__tests__/normalizers.test.ts` — pure function unit test pattern.

### Event normalizer output shape (additions to `src/__tests__/normalizers.test.ts`)
- For a representative pass-through event (e.g. `deviceFound`), call `normalizeEventPayload` with a camelCase raw payload and assert the output has snake_case keys.
- For a representative actively-normalised event (e.g. `heartRateTestResult`), verify the same.
- For an event with a string value map (e.g. `bluetoothStateChanged`), verify `'poweredOff'` input produces `'powered_off'` in output.
- Prior art: existing `normalizeEventPayload` tests in `normalizers.test.ts`.

### Capability round-trip tests (additions to `src/__tests__/VeepooSDK.test.ts`)
- For a settings write capability (e.g. `setAlarm`), mock the native module, call the method with a snake_case input, and assert the mock was called with the camelCase equivalent.
- For a settings read capability (e.g. `readAlarms`), mock the native module returning camelCase data, and assert the result has snake_case keys.
- One test per category (settings write, settings read, connection) is sufficient — not one per method.
- Prior art: existing mocked-native tests in `VeepooSDK.test.ts`.

## Out of Scope

- Renaming event names (keys of `VeepooEventPayload` / strings passed to `addEventListener`). These are native bridge contracts.
- Renaming SDK method names (`startScan`, `connect`, `setAlarm`, etc.).
- Exporting `deepSnakeKeys` or `deepCamelKeys` as part of the public API.
- Changes to the native iOS or Android bridge code.
- Versioning or backwards-compatibility shims — this is a private package with a single consumer.

## Further Notes

- ADR recorded at `docs/adr/0004-snake-case-js-api.md`. Consult it for the rationale behind keeping event names camelCase and rejecting the type-level utility approach.
- The two-pass regex is the critical implementation detail for `deepSnakeKeys` / `deepCamelKeys`. A naive single-pass approach produces wrong output for acronym sequences and must not be used.
- The `native.ts` interface files in each capability are typed to camelCase (matching native expectations) and must not be renamed — they are internal and not part of the public API surface.
