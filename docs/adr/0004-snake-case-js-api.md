# snake_case for all JS-facing types

The public JS/TS API uses snake_case for object property names and string literal union values. Event names (the strings passed to `addEventListener`) stay camelCase because they are native bridge contracts — iOS and Android emit them and we cannot rename them without a native change. A `deepSnakeKeys` transformer runs as a post-step in `normalizeEventPayload` to convert native camelCase keys to snake_case before consumers see them. For the write direction, a `deepCamelKeys` inverse is applied at each capability call site before invoking native. Both utilities are internal and not exported.

## Considered Options

- **Keep camelCase throughout** — JS convention, zero transform cost. Rejected: the codebase already mixes camelCase properties with UPPER_CASE constants and the odd `never_ask_again` value; camelCase was never consistent in practice.
- **Type-level `DeepCamelToSnake<T>` utility** — derive snake_case types from existing camelCase types automatically. Rejected: TypeScript's character-by-character string recursion cannot replicate the two-pass regex needed for correct acronym handling (`btSwitchOpen` → `bt_switch_open` at runtime, `bt_switch_open` at the type level — but naively `b_t_switch_open`). Runtime and types would silently diverge on any property with consecutive uppercase letters.
- **Rename event names too** — fully consistent snake_case API including `addEventListener('heart_rate_test_result', ...)`. Rejected: requires a `NATIVE_TO_JS` event name mapping layer in the event bus for all 53 native events. Event names are opaque string tokens; the ergonomic gain of snake_casing them does not justify the added complexity.
- **Rename payload properties only, leave method input types camelCase** — half-scope. Rejected: leaves camelCase in consumer-written code (`is24Hour`, `brightMode`) which is the exact inconsistency the change is meant to eliminate.

## Consequences

- All 7 type definition files are manually renamed (not generated) so acronym handling is exact and readable.
- `deepSnakeKeys` and `deepCamelKeys` are internal utilities; consumers always write snake_case and never interact with the transform layer.
- String literal union values that were camelCase (`'poweredOff'`, `'notDetermined'`, `'fileNotExist'`, etc.) are mapped to snake_case in their respective capability normalizers.
- Test coverage: utility unit tests (including acronym edge cases), normalizer output shape tests, and capability-level round-trip tests with mocked native.
