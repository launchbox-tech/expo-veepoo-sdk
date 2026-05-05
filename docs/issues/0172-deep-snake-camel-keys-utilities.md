# feat(normalizers): deepSnakeKeys + deepCamelKeys utilities + unit tests

**Issue:** #172
**Status:** Open
**Labels:** enhancement, needs-triage
**Parent:** #171

## What to build

Add two internal pure-function utilities: `deepSnakeKeys` and `deepCamelKeys`. Both live in `src/normalizers/` and are not exported from the public API.

`deepSnakeKeys` recursively converts all object keys from camelCase to snake_case. `deepCamelKeys` does the inverse. Both handle nested objects, arrays, `null`, `undefined`, and primitives (passed through unchanged).

The key conversion must use a two-pass regex algorithm — not a single-pass character scan — so that acronym sequences are handled correctly: `btSwitchOpen` → `bt_switch_open`, `isOadModel` → `is_oad_model`, `spo2Value` → `spo2_value`, `is24Hour` → `is_24_hour`. A naive single-pass approach produces wrong output (e.g. `b_t_switch_open`) and must not be used.

## Acceptance criteria

- [ ] `deepSnakeKeys` converts flat object keys from camelCase to snake_case
- [ ] `deepSnakeKeys` recursively converts nested object keys
- [ ] `deepSnakeKeys` converts keys inside arrays of objects
- [ ] `deepSnakeKeys` passes `null`, `undefined`, numbers, strings, and booleans through unchanged
- [ ] `deepSnakeKeys` correctly handles acronym sequences: `btSwitchOpen` → `bt_switch_open`, `isOadModel` → `is_oad_model`, `spo2Value` → `spo2_value`, `is24Hour` → `is_24_hour`
- [ ] `deepCamelKeys` is the exact inverse of `deepSnakeKeys` for all the above cases
- [ ] Neither utility is exported from `src/index.ts`
- [ ] All behaviour is covered by tests in a new `src/__tests__/deep-keys.test.ts` following the pattern in `src/__tests__/normalizers.test.ts`

## Blocked by

None — can start immediately
