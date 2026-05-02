# Vendor API parity matrix

Canonical inventory of **vendor Veepoo/HBand capability areas** versus **`VeepooSDK` JavaScript API** in this package. Use this before assuming a wiki-only API exists on the bridge.

**Upstream docs:** [Android wiki](https://github.com/HBandSDK/Android_Ble_SDK/wiki/VeepooSDK-Android-API-Document) · [iOS wiki](https://github.com/HBandSDK/iOS_Ble_SDK/wiki/VeepooSDK-iOS-API-Document) · Offline snapshots: [`veepoo-sdk-android-api.md`](veepoo-sdk-android-api.md), [`veepoo-sdk-ios-api.md`](veepoo-sdk-ios-api.md).

**Vendored binaries & drift checks:** [`vendor-manifest.json`](../vendor-manifest.json) · `npm run vendor:check`.

**Maintenance:** When you ship or change a feature, update the row here and release notes. Device-tested values are **TBD** until explicitly verified on hardware.

---

## Legend

| Column | Meaning |
|--------|---------|
| **JS methods / events** | Public TypeScript surface (`VeepooSDK` / `VeepooEvent`). |
| **Status** | **Shipped** — implemented end-to-end · **Partial** — types/events only or native incomplete · **Not in JS** — not exposed · **TBD** — needs classification. |
| **Device tested** | **yes** / **no** / **TBD** — physical Band verification. |

Domain language follows **AGENTS.md** (**Band**, **Session**, **Band Discovery**, **Pairing**).

---

## Session lifecycle & Pairing

| Vendor area (summary) | JS methods / events | Status | Device tested |
|----------------------|---------------------|--------|---------------|
| SDK init, BLE state | `init`, `checkBluetoothStatus`, `requestPermissions`; `bluetoothStateChanged` | Shipped | TBD |
| Band Discovery (scan) | `startScan`, `stopScan`, `isScanningActive`; `deviceFound` | Shipped | TBD |
| Connect / disconnect Session | `connect`, `disconnect`, `getConnectionStatus`, `getConnectedDeviceId`; `deviceConnected`, `deviceDisconnected`, `deviceConnectStatus`, `connectionStatusChanged`, `deviceReady` | Shipped | TBD |
| Password verification | `verifyPassword`; `passwordData` | Shipped | TBD |
| Personal info sync | `syncPersonalInfo` | Shipped | TBD |

---

## Device information & settings

| Vendor area (summary) | JS methods / events | Status | Device tested |
|----------------------|---------------------|--------|---------------|
| Battery | `readBattery`; `batteryData` | Shipped | TBD |
| Firmware / device version | `readDeviceVersion`; `deviceVersion` | Shipped | TBD |
| Capability flags | `readDeviceFunctions`; `deviceFunction` | Shipped | TBD |
| Language | `setLanguage` | Shipped | TBD |
| Notification prefs (social) | `readSocialMsgData`, `writeSocialMsgData`; `socialMsgData` | Shipped | TBD |
| Auto measurement windows | `readAutoMeasureSetting`, `modifyAutoMeasureSetting` | Shipped | TBD |
| Clock / device time | `setDeviceTime` | Shipped | TBD |
| Alarms | `readAlarms`, `setAlarm`, `deleteAlarm`; `alarmData` | Shipped | TBD |
| Heart rate alarm thresholds | `readHeartRateAlarm`, `setHeartRateAlarm`; `heartRateAlarmData` | Shipped | TBD |
| Find Band (phone → Band) | `startFindDevice`, `stopFindDevice`; `findDeviceState` | Shipped | TBD |
| Screen brightness & on-time | `readScreenLightSettings`, `setScreenLightSettings`, `readScreenLightDuration`, `setScreenLightDuration` | Shipped | TBD |
| Sedentary (long-sit) reminder | `readSedentaryReminder`, `setSedentaryReminder` | Shipped | TBD |
| Wrist-flip / raise-to-wake | `readWristFlipWakeSettings`, `setWristFlipWakeSettings` | Shipped | TBD |
| Watch face / screen style (dial slot) | `readWatchFaceStyle`, `setWatchFaceStyle` | Shipped | TBD |
| Local firmware DFU (OTA file on disk) | `startLocalFirmwareDfu`; `firmwareDfuProgress` | Partial | TBD |

**Find device:** Gate with `readDeviceFunctions().findDeviceByPhoneFunction`. **Android** uses `startFindDeviceByPhone` / `stopFindDeviceByPhone` (`IFindDevicelistener`). **iOS** uses `veepooSDK_searchDeviceFuntionWithState` + `peripheralModel.searchDeviceFunction`; callback states map to `searching` / `stopped` / `timeout` (no separate `found` phase on iOS — see `rawState`).

**Screen light:** Gate with `readDeviceFunctions().screenLight` / `screenLightTime` where applicable. **Android:** `readScreenLight` / `settingScreenLight` (`ScreenSetting`), `readScreenLightTime` / `setScreenLightTime` (seconds); `VpSpGetUtil.isSupportScreenlight` / `isSupportScreenlightTime`. **iOS:** `veepooSDKSettingBrightWithBrightModel` (mode 2 read / 1 set), `veepooSDKSettingScreenDuration` (mode 2 read / 1 set); duration requires `peripheralModel.screenDurationType == 1`.

**Sedentary reminder:** Gate with `readDeviceFunctions().sedentaryRemind`. **Android:** `readLongSeat` / `settingLongSeat` (`LongSeatSetting`); `VpSpGetUtil.isSupportLongseat`. **iOS:** `veepooSDKSettingDeviceLongSeatWithLongSeatModel` (read `settingMode` 2, on `1` / off `0`); threshold (gate) 30–240 minutes per vendor model.

**Wrist-flip wake:** Gate with `readDeviceFunctions().nightTurnSetting` / `isOpenNightTurnWrist`. **Android:** `readNightTurnWriste` / `settingNightTurnWriste` (`NightTurnWristSetting`, `TimeData` window, sensitivity 1–10); `VpSpGetUtil.isSupportNightturnSetting`. **iOS:** `veepooSDKSettingRaiseHandWithRaiseHandModel` (read mode 2, on 1 / off 0); `VPDeviceRaiseHandModel` (`sensitive` / `defaultSensitive`).

**Watch face / screen style:** Gate with `readDeviceFunctions().screenStyleFunction` (and related `aiDial` / `videoDial` hints where applicable). **Android:** `readScreenStyle` / `settingScreenStyle` (`ScreenStyleData`, `EScreenStyle`); `VpSpGetUtil.isSupportScreenStyle`. **iOS:** `veepooSDKSettingDeviceScreenStyle` (read `settingMode` 2 / set 1, `VPDeviceDialType`). **Partial scope:** this bridge exposes **read/set of the active dial category + slot index** only — custom image transfer, marketplace sync, and video dials are **not** implemented here.

**Local firmware DFU:** High-risk — host apps must gate UX (e.g. battery > 30%). **iOS:** `VPDFUOperation` `veepooSDKStartDfuWithFilePath` (+ `DeviceDFUState` in `firmwareDfuProgress`). **Android:** `VPOperateManager.startJLDeviceOTAUpgrade` when `isJLDevice` (Jerry / JL path only). Remote `checkDeviceOTAInfo` / `getOadVersion` and non-JL DFU are **not** in this bridge yet.

---

## Historical & periodic data

| Vendor area (summary) | JS methods / events | Status | Device tested |
|----------------------|---------------------|--------|---------------|
| Read-all / sync pipeline | `startReadOriginData`, `readOriginComplete`, `readOriginProgress`, `readDeviceAllData` | Shipped | TBD |
| Five-minute origin | `readOriginData`; `originFiveMinuteData` | Shipped | TBD |
| Half-hour summaries | `readDaySummaryData`; `originHalfHourData` | Shipped | TBD |
| SpO2 origin stream | `originSpo2Data` | Shipped | TBD |
| Sleep | `readSleepData`; `sleepData` | Shipped | TBD |
| Steps / sport | `readSportStepData`; `sportStepData` | Shipped | TBD |

---

## Real-time health tests

| Vendor area (summary) | JS methods / events | Status | Device tested |
|----------------------|---------------------|--------|---------------|
| Heart rate | `startHeartRateTest`, `stopHeartRateTest`; `heartRateTestResult` | Shipped | TBD |
| Blood pressure | `startBloodPressureTest`, `stopBloodPressureTest`; `bloodPressureTestResult` | Shipped | TBD |
| Blood oxygen | `startBloodOxygenTest`, `stopBloodOxygenTest`; `bloodOxygenTestResult` | Shipped | TBD |
| Temperature | `startTemperatureTest`, `stopTemperatureTest`; `temperatureTestResult` | Shipped | TBD |
| Stress | `startStressTest`, `stopStressTest`; `stressData` | Shipped | TBD |
| Blood glucose | `startBloodGlucoseTest`, `stopBloodGlucoseTest`; `bloodGlucoseData` | Shipped | TBD |
| HRV (manual realtime) | `startHrvTest`, `stopHrvTest`; `hrvTestResult` | Partial — Android shipped; **iOS** `CAPABILITY_UNSUPPORTED` (no matching vendor API in pinned framework; see notes) | TBD |
| ECG (manual realtime) | `startEcgTest`, `stopEcgTest`; `ecgTestResult` (optional `includeWaveform`) | Shipped | TBD |
| Fatigue (manual realtime) | `startFatigueTest`, `stopFatigueTest`; `fatigueTestResult` | Shipped | TBD |
| Breathing rate (manual realtime) | `startBreathingTest`, `stopBreathingTest`; `breathingTestResult` | Shipped | TBD |

### Further notes (realtime vitals, PRD #66)

- **Single active realtime test:** Starting any supported `start*Test` while another realtime test is active rejects with **`REALTIME_TEST_IN_PROGRESS`** ([issue #67](https://github.com/launchbox-tech/expo-veepoo-sdk/issues/67)). Eligibility errors may use **`DEVICE_NOT_READY`**, **`DEVICE_NOT_CONNECTED`**, or **`CAPABILITY_UNSUPPORTED`** ([`VeepooErrorCode`](../src/types/errors.ts) in source).
- **HRV:** **Android** uses `readDeviceManualData` + `DeviceManualDataType.HRV` with `IDeviceManualDetectDataListener.onHrvManualDataChange` (polling loop in `VeepooSDKModuleHelpers.kt`). **iOS** (`VPPeripheralBaseManage.h`): `VPManualTestDataType` defines only blood pressure and heart rate bits—no HRV; `readManualTestDataWithTimestamp` returns `VPManualTestDataModel` (manual BP). Historical HRV uses `veepooSdkStartReadDeviceHrvData` / DB helpers, not an app-driven manual realtime test. There is no `veepooSDKTestHrvStart`-style entry point alongside stress/temperature/ECG. **`startHrvTest`** therefore rejects with **`CAPABILITY_UNSUPPORTED`** with a message pointing here; use **historical HRV** or **Android** for this modality until the vendor ships a documented iOS equivalent.
- **ECG:** Summary-style fields are always emitted on `ecgTestResult`. **`startEcgTest({ includeWaveform: true })`** may populate `result.waveform` when the Band and native stack support it; payloads can be large.
- **Breathing:** **iOS** uses `veepooSDKTestBreathingRateStart`; **Android** uses `startDetectBreath` / `stopDetectBreath` with `BreathData` (maps `deviceState` / progress / value into the same `breathingTestResult` shape as iOS).

---

## Logging & errors

| Vendor area (summary) | JS methods / events | Status | Device tested |
|----------------------|---------------------|--------|---------------|
| Structured logs | `setLogEnabled`, `isLogEnabled`, `setLogger` | Shipped | TBD |
| Unified errors | `error` event / `VeepooError` (native rejects mapped per ADR 0003; optional `nativeCode` when collapsed) | Shipped | TBD |

---

## Not exposed in JS (representative backlog)

Aligned with maintainer backlog — vendor wiki may document these while this package does **not** yet expose them on `VeepooSDK`:

- Remote OTA metadata / download (`checkDeviceOTAInfo`, `getOadVersion`, `veepooSDKStartDfu` server path) and non-JL Android DFU  
- Server / marketplace dial transfer, custom photo push pipelines, video dials (beyond slot read/set)  
- Body composition, women’s health, weather push, contacts/SOS, AGPS, music/camera remote  
- Platform-specific extras (e.g. toggling OS Bluetooth from SDK)

Treat gaps as **Not in JS** until a PR adds methods **and** updates this matrix.

---

## Incremental updates

After merging a feature:

1. Edit the relevant row(s) in this file (**Status**, **Device tested** when known).  
2. Bump **`vendor-manifest.json`** if vendored files changed.  
3. Add **`docs/release-notes/`** entry for consuming apps.
