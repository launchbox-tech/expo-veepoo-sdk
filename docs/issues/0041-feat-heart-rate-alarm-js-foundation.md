# 41 — feat(heart-rate-alarm): JS foundation — type, events, validator, normalizer, tests

## Parent

#40

## What to build

Add all pure-JS plumbing for the heart rate alarm feature end-to-end through the JS layer: the `HeartRateAlarm` type, the `heartRateAlarmData` event wiring, input validation, payload normalisation, and tests. No native bridge changes in this slice.

- Add `HeartRateAlarm` (`enabled: boolean`, `highThreshold: number`, `lowThreshold: number`) to `src/types/device.ts`
- Add `'heartRateAlarmData'` to the `VeepooEvent` union and map `heartRateAlarmData: { deviceId: string; data: HeartRateAlarm }` in `VeepooEventPayload` in `src/types/events.ts`
- Re-export `HeartRateAlarm` from the barrel (`src/index.ts`)
- Add `validateHeartRateAlarm(alarm: HeartRateAlarm): void` to `src/validators/device-settings.ts` — throws `VeepooError(INVALID_ARGUMENT)` if either threshold is outside 1–300 or `highThreshold` is not strictly greater than `lowThreshold`
- Add `normalizeHeartRateAlarm(value: unknown): HeartRateAlarm` to `src/normalizers/device.ts`
- Add a `'heartRateAlarmData'` case to `normalizeEventPayload` that delegates to `normalizeHeartRateAlarm`
- Tests in `src/__tests__/validators/device-settings.test.ts`: all boundary cases for `validateHeartRateAlarm`
- Tests in the normalizers test file: `normalizeEventPayload` with `'heartRateAlarmData'` — boolean coercion for `enabled`, integer coercion for thresholds, missing-field defaults

## Acceptance criteria

- [x] `HeartRateAlarm` type is defined in `src/types/device.ts` with `enabled`, `highThreshold`, and `lowThreshold` fields
- [x] `'heartRateAlarmData'` appears in the `VeepooEvent` union with payload `{ deviceId: string; data: HeartRateAlarm }`
- [x] `HeartRateAlarm` is exported from the public barrel
- [x] `validateHeartRateAlarm` throws `VeepooError(INVALID_ARGUMENT)` for threshold 0, threshold 301, `lowThreshold === highThreshold`, and `lowThreshold > highThreshold`
- [x] `validateHeartRateAlarm` passes for a valid alarm (e.g. `{ enabled: true, highThreshold: 120, lowThreshold: 50 }`)
- [x] `normalizeHeartRateAlarm` coerces `enabled` to boolean and thresholds to integers; missing fields default to `false` / `0`
- [x] `normalizeEventPayload('heartRateAlarmData', ...)` delegates to `normalizeHeartRateAlarm`
- [x] All new code passes TypeScript compilation with no errors
- [x] All new tests pass

## Blocked by

None — can start immediately

## Status

CLOSED — implemented in commit `feat(heart-rate-alarm): JS foundation — type, events, validator, normalizer, tests (Fixes #41)`
