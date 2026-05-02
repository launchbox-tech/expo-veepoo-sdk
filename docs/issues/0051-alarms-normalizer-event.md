---
number: 51
title: "feat(alarms): normalizeAlarmList and alarmData event wiring"
state: open
parent: 37
---

## What to build

Add `normalizeAlarmList(value: unknown): DeviceAlarm[]` to `normalizers/device.ts`. Convert 7-bit binary repeat string to ISO weekday array and back. Add `'alarmData'` to `VeepooEvent`. Wire it in `normalizeEventPayload`. Add normalizer tests.

## Acceptance criteria

- [ ] `'alarmData'` added to `VeepooEvent` type
- [ ] `"0000011"` → `[1, 2]`, `"0000000"` → `[]`, `"1111111"` → `[1,2,3,4,5,6,7]`
- [ ] `scene` and `text` pass through unchanged when present; default to `undefined` when absent
- [ ] `normalizeEventPayload` routes `'alarmData'` through `normalizeAlarmList`
- [ ] All new cases covered by tests; all existing normalizer tests pass

## Blocked by

- #50 feat(alarms): update DeviceAlarm type and complete validateAlarm
