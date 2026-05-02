---
number: 50
title: "feat(alarms): update DeviceAlarm type and complete validateAlarm"
state: closed
parent: 37
---

## What to build

Add `scene?: number` to `DeviceAlarm`. Expand `validateAlarm` in `validators/device-settings.ts` to cover `id` (1–20), each `repeat` element (1–7), `scene` (0–20 if present), and `text` (≤60 bytes if present). Add `validateDeleteAlarm(alarmId: number)` checking range 1–20. Expand boundary tests in `src/__tests__/validators/validators.test.ts`.

## Acceptance criteria

- [ ] `DeviceAlarm` has `scene?: number` (valid range 0–20)
- [ ] `validateAlarm` throws `INVALID_ARGUMENT` when `id` is outside 1–20
- [ ] `validateAlarm` throws for each `repeat` element outside 1–7; empty array is valid
- [ ] `validateAlarm` throws when `scene` is present and outside 0–20
- [ ] `validateAlarm` throws when `text` is present and exceeds 60 bytes
- [ ] `validateAlarm` still throws for `hour` outside 0–23 and `minute` outside 0–59
- [ ] `validateDeleteAlarm(alarmId)` throws `INVALID_ARGUMENT` when `alarmId` is outside 1–20
- [ ] Boundary tests: `id=0`, `id=21`, `hour=-1`, `hour=24`, `minute=60`, `scene=21`, text 60 bytes (pass), text 61 bytes (throw), empty `repeat` (pass), `repeat` containing `0` (throw), `repeat` containing `8` (throw)
- [ ] All existing validator tests pass

## Blocked by

None — can start immediately
