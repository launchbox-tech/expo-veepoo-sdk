# 0183 — feat: SpO₂ alarm — JS layer

> GitHub: https://github.com/launchbox-tech/expo-veepoo-sdk/issues/183
> Labels: enhancement, needs-triage
> Status: OPEN

## Parent

#180

## What to build

Extend the existing `AlarmsCapability` with SpO₂ low-level alarm read and write. This is distinct from the apnea-remind feature (which detects apnea events) — it is a simple threshold alert that fires when continuous overnight SpO₂ monitoring drops below a configured percentage. Follows the existing `readHeartRateAlarm` / `setHeartRateAlarm` pattern exactly. No native bridge code in this slice.

## Acceptance criteria

- [ ] `Spo2Alarm` type added: `{ enabled: boolean; low_threshold: number }` (threshold is 0–100 integer percentage)
- [ ] `readSpo2Alarm(): Promise<Spo2Alarm>` added to `AlarmsCapability`
- [ ] `setSpo2Alarm(alarm: Spo2Alarm): Promise<OperationStatus>` added to `AlarmsCapability`; validates `low_threshold` in range 1–99
- [ ] `spo2_alarm_data` event added to `VeepooEventPayload` with payload `{ device_id: string; data: Spo2Alarm }`; registered in event registry and normalizer dispatch table
- [ ] Both `readSpo2Alarm` and `setSpo2Alarm` emit `spo2_alarm_data` via `emitLocal` with the confirmed alarm state
- [ ] Native method names added to `async-native-method-registry.ts`; `spo2_alarm_data` added to bridge-contract event registry
- [ ] Wired into `VeepooSDK` facade and `VeepooSDKModuleInterface`
- [ ] Unit tests: normalizes enabled + threshold, validates threshold range, `spo2_alarm_data` fires via `emitLocal` — following `alarm-settings.test.ts` prior art

## Blocked by

None — can start immediately
