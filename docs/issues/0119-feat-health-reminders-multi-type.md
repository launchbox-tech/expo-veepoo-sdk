# 0119 — feat: health reminders (multi-type)

> GitHub: https://github.com/launchbox-tech/expo-veepoo-sdk/issues/119
> Labels: needs-triage
> Status: open

## Parent

#118

## What to build

Extend the health reminder bridge to cover all 8 vendor-defined reminder types: sedentary (already exists as a standalone method), drink water, look far away, sport, take medicine, read, trip, and wash hands.

Introduce `readHealthReminder(type: HealthReminderType)` and `setHealthReminder(reminder: HealthReminder)` as the canonical multi-type API. The existing `readSedentaryReminder` / `setSedentaryReminder` methods stay for backwards compatibility but are superseded. A `healthRemindData` event fires both on read responses and when the Band proactively pushes a reminder state change.

## Acceptance criteria

- [ ] `HealthReminderType` union type covers all 8 types: `sedentary` `drinkWater` `lookFarAway` `sport` `takeMedicine` `read` `trip` `washHands`
- [ ] `HealthReminder` interface: `{ type, startHour, startMinute, endHour, endMinute, interval, enabled }`
- [ ] `readHealthReminder(type)` resolves with `HealthReminder` on success; rejects `CAPABILITY_UNSUPPORTED` when device lacks the feature
- [ ] `setHealthReminder(reminder)` resolves on success; rejects `CAPABILITY_UNSUPPORTED` when unsupported
- [ ] `healthRemindData` event emitted on both read response and Band-initiated proactive report (Android `onHealthRemindReport`, iOS `deviceInfoDidChangeBlock`) — same event, not two different events
- [ ] Android: both read and set paths implemented; `onHealthRemindReadFailed` / `onHealthRemindSettingFailed` reject with `OPERATION_FAILED`
- [ ] iOS: opCode 2 = read, opCode 1 = set; failure path rejects with `OPERATION_FAILED`
- [ ] Normalizer unit-tested: each of the 8 `HealthReminderType` values round-trips correctly
- [ ] Method names added to async-native-method registry; `healthRemindData` added to event contract
- [ ] Parity matrix row added under "Device information & settings"

## Blocked by

None — can start immediately
