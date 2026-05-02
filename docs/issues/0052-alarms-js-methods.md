---
number: 52
title: "feat(alarms): JS methods readAlarms, setAlarm, deleteAlarm"
state: open
parent: 37
---

## What to build

Add `readAlarms`, `setAlarm`, and `deleteAlarm` to `NativeVeepooSDKInterface` and `VeepooSDKModuleInterface`. Implement all three in the `VeepooSDK` class: validate before bridging, resolve via `alarmData` event for reads, resolve `OperationStatus` for writes. Verify `DeviceAlarm` is exported from `src/index.ts`.

## Acceptance criteria

- [ ] `NativeVeepooSDKInterface` declares all three methods
- [ ] `VeepooSDKModuleInterface` declares all three methods with correct return types
- [ ] `readAlarms()` calls native and returns `DeviceAlarm[]`
- [ ] `setAlarm(alarm)` validates via `validateAlarm` before calling native
- [ ] `deleteAlarm(alarmId)` validates via `validateDeleteAlarm` before calling native
- [ ] Invalid arguments throw `VeepooError(INVALID_ARGUMENT)` without reaching native
- [ ] `DeviceAlarm` exported from `src/index.ts`
- [ ] `tsc --noEmit` passes

## Blocked by

- #50 feat(alarms): update DeviceAlarm type and complete validateAlarm
- #51 feat(alarms): normalizeAlarmList and alarmData event wiring
