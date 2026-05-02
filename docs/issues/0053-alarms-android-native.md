---
number: 53
title: "feat(alarms): Android native implementation (Alarm2/TextAlarm2Setting)"
state: open
parent: 37
---

## What to build

Implement `readAlarms`, `setAlarm`, `deleteAlarm` on Android wired to Alarm2/TextAlarm2Setting APIs. Emit `alarmData` event after reads. Encode repeat as 7-bit binary string. Gate text content on `textAlarm` device flag.

## Acceptance criteria

- [ ] `readAlarms` emits `alarmData` with the current alarm list
- [ ] `setAlarm` stores/updates by `id`; resolves `"success"` on native success
- [ ] `setAlarm` uses `TextAlarm2Setting` when `textAlarm` flag is set and `text` is provided
- [ ] `deleteAlarm` removes by `id`; resolves `"success"` on native success
- [ ] Repeat encoding: `[1,2]` → `"0000011"`, `[]` → `"0000000"`
- [ ] `scene` passed to `Alarm2Setting` when present and 0–20
- [ ] `./gradlew assembleDebug` passes

## Blocked by

- #52 feat(alarms): JS methods readAlarms, setAlarm, deleteAlarm
