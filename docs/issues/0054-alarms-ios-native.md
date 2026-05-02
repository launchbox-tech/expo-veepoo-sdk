---
number: 54
title: "feat(alarms): iOS native implementation (VPDeviceNewAlarmModel/VPDeviceTextAlarmModel)"
state: open
parent: 37
---

## What to build

Implement `readAlarms`, `setAlarm`, `deleteAlarm` on iOS wired to `VPDeviceNewAlarmModel` / `VPDeviceTextAlarmModel`. Emit `alarmData` event after reads. Encode repeat as 7-bit binary string. Gate text content on `textAlarm` device flag.

## Acceptance criteria

- [ ] `readAlarms` emits `alarmData` with the current alarm list
- [ ] `setAlarm` stores/updates by `id`; resolves `"success"` on native success
- [ ] `setAlarm` uses `VPDeviceTextAlarmModel` when `textAlarm` flag is set and `text` is provided
- [ ] `deleteAlarm` removes by `id`; resolves `"success"` on native success
- [ ] Repeat encoding: `[1,2]` → `"0000011"`, `[]` → `"0000000"`
- [ ] `scene` passed to `VPDeviceNewAlarmModel` when present and 0–20
- [ ] `xcodebuild` passes

## Blocked by

- #52 feat(alarms): JS methods readAlarms, setAlarm, deleteAlarm
