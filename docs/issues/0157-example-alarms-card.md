# feat(example): AlarmsCard — alarm CRUD + heart-rate alarm

**Issue:** #157
**Status:** Closed
**Labels:** enhancement, ready-for-agent
**Parent:** #154

## What to build

New `AlarmsCard` component covering all five alarm-related SDK methods and both alarm events.

## Acceptance criteria

- [ ] "Read alarms" → `readAlarms()`, displays list as JSON
- [ ] "Set alarm" → `setAlarm({id:1, hour:7, minute:0, isOpen:true, cycle:0b1111110})`, shows operation status
- [ ] "Delete alarm" → `deleteAlarm(1)`, shows operation status
- [ ] "Read HR alarm" → `readHeartRateAlarm()`, displays result
- [ ] "Set HR alarm" → `setHeartRateAlarm({min:50,max:140})`, shows operation status
- [ ] Subscribes to `alarmData` and `heartRateAlarmData` events and shows the last payload
