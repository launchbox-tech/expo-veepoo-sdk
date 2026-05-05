# refactor(types): rename all JS-facing type properties and string values to snake_case + wire transform layer

**Issue:** #173
**Status:** Open
**Labels:** enhancement, needs-triage
**Parent:** #171

## What to build

Rename every camelCase property name and string literal union value in the SDK's JS/TS public API to snake_case, and wire the transform layer so the bridge boundary handles camelCase ↔ snake_case conversion transparently.

This slice touches three things atomically — they cannot be split because the type files are shared between the read and write paths:

**1. Type definitions (7 files)**
Rename all ~477 camelCase property names across `connection.ts`, `device.ts`, `errors.ts`, `events.ts`, `health-data.ts`, `health-tests.ts`, and `settings.ts` to snake_case. Also rename camelCase string literal union values: `BluetoothState` (`poweredOff` → `powered_off`, `poweredOn` → `powered_on`), `BluetoothAuthorization` (`notDetermined` → `not_determined`, `allowedAlways` → `allowed_always`), `FirmwareDfuState` (`fileNotExist` → `file_not_exist`, `dfuLangConnectSuccess` → `dfu_lang_connect_success`, `dfuLangConnectFailed` → `dfu_lang_connect_failed`), and any other camelCase string values found. Event names (keys of `VeepooEventPayload`) are unchanged — they are native bridge contracts.

**2. Read-path: event normalizer**
Apply `deepSnakeKeys` (from #172) as a final post-step inside `normalizeEventPayload`, after the per-event structural normalizer runs. The `EVENT_NORMALIZERS` dispatch table entries themselves are unchanged. Add string value maps in the affected capability normalizers (`session`, `dfu`) so camelCase values from native are converted before `deepSnakeKeys` runs on keys.

**3. Write-path: capability call sites**
At every capability `index.ts` that passes a typed input object to a native method, wrap the argument with `deepCamelKeys` (from #172) at the `invoke` call site. The `native.ts` interface signatures do not change.

At the end of this slice the SDK compiles cleanly, all existing tests pass, and new tests are green.

## Acceptance criteria

- [ ] All ~477 camelCase property names in the 7 type files are renamed to snake_case
- [ ] `BluetoothState`, `BluetoothAuthorization`, and `FirmwareDfuState` string literal values are renamed to snake_case; any other camelCase string union values in the type files are renamed too
- [ ] Event names (keys of `VeepooEventPayload`) are unchanged
- [ ] `normalizeEventPayload` applies `deepSnakeKeys` as a post-step; a pass-through event (e.g. `deviceFound`) called with camelCase raw input produces snake_case output
- [ ] An actively-normalised event (e.g. `heartRateTestResult`) also produces snake_case output
- [ ] `bluetoothStateChanged` normalisation converts `'poweredOff'` → `'powered_off'` and `'notDetermined'` → `'not_determined'`
- [ ] Every capability write call site wraps its input with `deepCamelKeys` before passing to native
- [ ] A mocked-native round-trip test for a settings write (e.g. `setAlarm`) confirms the mock receives camelCase keys when the caller passes snake_case input
- [ ] A mocked-native round-trip test for a settings read (e.g. `readAlarms`) confirms the result has snake_case keys when native returns camelCase data
- [ ] `tsc --noEmit` passes on the SDK package
- [ ] All existing tests continue to pass

## Blocked by

#172 — `deepSnakeKeys` / `deepCamelKeys` utilities must exist before this slice can be wired
