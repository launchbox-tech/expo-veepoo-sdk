# 31 — test(sdk): add normalizeEventPayload event-routing unit tests

Part of #29.

## What to build

Add direct unit tests for `normalizeEventPayload` in `src/__tests__/VeepooSDK.test.ts` (or a co-located `normalizeEventPayload.test.ts`).

Import the function directly:

```ts
import { normalizeEventPayload } from '../VeepooSDK';
```

## Coverage required

For each of the 17 normalization cases, assert the output shape with a realistic input payload:

- `bluetoothStateChanged` — numeric `state`/`authorization` fields converted to strings
- `readOriginProgress` — fractional `progress` value converted to integer percentage
- `deviceFunction` — `data` and `functions` fields both normalized
- `deviceVersion` — `version` field normalized
- `passwordData` — `data` field normalized
- `socialMsgData` — `data` field normalized
- `originFiveMinuteData` — single item extracted from list and normalized
- `originHalfHourData` — `data` field normalized
- `sleepData` — single item extracted from list and normalized
- `sportStepData` — `data` field normalized
- `heartRateTestResult` — `result` field normalized
- `bloodPressureTestResult` — `result` field normalized
- `bloodOxygenTestResult` — `result` field normalized
- `temperatureTestResult` — `result` field normalized
- `stressData` — `data` field normalized
- `bloodGlucoseData` — `data` field normalized
- `batteryData` — `data` field normalized

Plus:
- Pass-through for events not in the switch: `deviceFound`, `deviceConnected`, `deviceReady`, `readOriginComplete`, `error`
- Non-object guard: `null`, `42`, `"hello"` → returned unchanged

## Acceptance criteria

- [ ] All 17 event normalization cases have at least one test assertion
- [ ] At least 3 pass-through events are tested
- [ ] Non-object guard is tested for `null`, a number, and a string
- [ ] `yarn test` passes with no failures
- [ ] Tests follow the conventions in `src/__tests__/normalizers.test.ts` (plain `describe`/`it`, no `.js` extensions in imports)
