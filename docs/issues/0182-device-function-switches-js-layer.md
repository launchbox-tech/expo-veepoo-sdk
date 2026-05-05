# 0182 — feat: device function switches — JS layer

> GitHub: https://github.com/launchbox-tech/expo-veepoo-sdk/issues/182
> Labels: enhancement, needs-triage
> Status: OPEN

## Parent

#180

## What to build

Add a `DeviceSwitchesCapability` that reads and writes the Band's individual boolean feature switches — continuous auto-monitoring (HR, BP, SpO₂, temperature, HRV, blood glucose, PPG), device behaviour (wear detection, disconnect alarm, SOS remind, auto-answer, exercise detection), and feature enables (accurate sleep, ECG-always-on, MET, stress, music control). No native bridge code in this slice.

## Acceptance criteria

- [ ] `DeviceSwitchType` string-union type covering all named switches: `auto_hr`, `auto_bp`, `auto_spo2`, `auto_temperature`, `auto_hrv`, `auto_blood_glucose`, `auto_ppg`, `wear_detection`, `disconnect_remind`, `sos_remind`, `auto_answer`, `exercise_detection`, `accurate_sleep`, `ecg_normally_open`, `met`, `stress`, `music_control` (and any additional switches confirmed in the vendor SDK docs)
- [ ] `DeviceSwitches` type: `Record<DeviceSwitchType, boolean>`
- [ ] `DeviceSwitchesCapability` with `readDeviceSwitches(): Promise<DeviceSwitches>` and `setDeviceSwitch(type: DeviceSwitchType, enabled: boolean): Promise<OperationStatus>`
- [ ] `device_switches_data` event added to `VeepooEventPayload` with payload `{ device_id: string; switches: DeviceSwitches }`; registered in event registry and normalizer dispatch table
- [ ] `readDeviceSwitches` emits `device_switches_data` via `emitLocal` after normalizing the response
- [ ] `wrist_flip` capability not duplicated — raise-to-wake remains in its own capability
- [ ] Native method names added to `async-native-method-registry.ts`; `device_switches_data` added to bridge-contract event registry
- [ ] Capability wired into `VeepooSDK` facade and `VeepooSDKModuleInterface`
- [ ] Unit tests: `readDeviceSwitches` returns full `DeviceSwitches` record, `setDeviceSwitch` sends correct type+enabled pair, `device_switches_data` fires via `emitLocal`, unknown switch type rejects with `INVALID_ARGUMENT`

## Blocked by

None — can start immediately
