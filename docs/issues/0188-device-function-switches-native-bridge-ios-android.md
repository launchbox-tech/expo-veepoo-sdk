# 0188 — feat: device function switches — native bridge (iOS + Android)

> GitHub: https://github.com/launchbox-tech/expo-veepoo-sdk/issues/188
> Labels: enhancement, needs-triage, ready-for-human
> Status: OPEN

## Parent

#180

## What to build

Wire `readDeviceSwitches` and `setDeviceSwitch` on both platforms. iOS uses `veepooSDKSettingBaseFunctionType:settingState:completeBlock:` per switch type; Android uses `readCustomSetting` / `changeCustomSetting` with a compound model. This is the largest native surface in this PRD — requires careful mapping of each `DeviceSwitchType` to its vendor-SDK constant on both platforms.

## Acceptance criteria

- [ ] Android: `readCustomSetting` result decoded into `DeviceSwitches` record; `changeCustomSetting` called with correct field set per `DeviceSwitchType`
- [ ] iOS: each `DeviceSwitchType` mapped to its `VPSettingBaseFunctionSwitchType` constant; read path uses the corresponding query API
- [ ] `device_switches_data` native event (if one exists) wired; if the Band pushes switch state proactively, it routes through the existing event normalizer
- [ ] All `DeviceSwitchType` values exercised in at least a manual smoke test on a physical Band
- [ ] `wrist_flip` (raise-to-wake) confirmed NOT duplicated — its existing native paths remain unchanged

## Blocked by

#182
