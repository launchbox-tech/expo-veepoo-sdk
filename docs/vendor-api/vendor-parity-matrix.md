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
| Women's health (cycle / maternity modes) | `readWomenHealthSettings`, `setWomenHealthSettings` | Shipped | TBD |
| Weather push | `readWeatherSettings`, `setWeatherSettings`, `pushWeatherData` | Shipped | TBD |
| Watch face / screen style (dial slot) | `readWatchFaceStyle`, `setWatchFaceStyle` | Shipped | TBD |
| Contacts (emergency contact list) | `readContacts`, `addContact`, `deleteContact`, `setContactSosState`; `contactsData` | Shipped | TBD |
| SOS call times | `readSosCallTimes`, `setSosCallTimes`; `sosCallTimesData` | Shipped | TBD |
| Camera remote (Band shutter trigger) | `enterCameraMode`, `exitCameraMode`; `cameraShutter` | Shipped | TBD |
| Music control toggle & metadata push | `setMusicControlEnabled`, `pushMusicData`; `musicRemoteCommand` | Shipped — `pushMusicData` Android-only (`CAPABILITY_UNSUPPORTED` on iOS); `musicRemoteCommand` Android-only | TBD |
| Local firmware DFU (OTA file on disk) | `startLocalFirmwareDfu`; `firmwareDfuProgress` | Partial | TBD |

**Find device:** Gate with `readDeviceFunctions().findDeviceByPhoneFunction`. **Android** uses `startFindDeviceByPhone` / `stopFindDeviceByPhone` (`IFindDevicelistener`). **iOS** uses `veepooSDK_searchDeviceFuntionWithState` + `peripheralModel.searchDeviceFunction`; callback states map to `searching` / `stopped` / `timeout` (no separate `found` phase on iOS — see `rawState`).

**Screen light:** Gate with `readDeviceFunctions().screenLight` / `screenLightTime` where applicable. **Android:** `readScreenLight` / `settingScreenLight` (`ScreenSetting`), `readScreenLightTime` / `setScreenLightTime` (seconds); `VpSpGetUtil.isSupportScreenlight` / `isSupportScreenlightTime`. **iOS:** `veepooSDKSettingBrightWithBrightModel` (mode 2 read / 1 set), `veepooSDKSettingScreenDuration` (mode 2 read / 1 set); duration requires `peripheralModel.screenDurationType == 1`.

**Sedentary reminder:** Gate with `readDeviceFunctions().sedentaryRemind`. **Android:** `readLongSeat` / `settingLongSeat` (`LongSeatSetting`); `VpSpGetUtil.isSupportLongseat`. **iOS:** `veepooSDKSettingDeviceLongSeatWithLongSeatModel` (read `settingMode` 2, on `1` / off `0`); threshold (gate) 30–240 minutes per vendor model.

**Wrist-flip wake:** Gate with `readDeviceFunctions().nightTurnSetting` / `isOpenNightTurnWrist`. **Android:** `readNightTurnWriste` / `settingNightTurnWriste` (`NightTurnWristSetting`, `TimeData` window, sensitivity 1–10); `VpSpGetUtil.isSupportNightturnSetting`. **iOS:** `veepooSDKSettingRaiseHandWithRaiseHandModel` (read mode 2, on 1 / off 0); `VPDeviceRaiseHandModel` (`sensitive` / `defaultSensitive`).

**Weather push:** Gate with `readDeviceFunctions().weatherFunction` / `weatherStyle`. **Android:** `settingWeatherData` (`WeatherData`, `IWeatherStatusDataListener`) for push; `settingWeatherStatusInfo` (`WeatherStatusSetting`) for switch/unit; read state from `VpSpGetUtil` cache (Android SDK does not expose a standalone read method — state is populated post-connect). **iOS:** `VPWeatherHandle.share()` — `readWeatherInfo`, `settingWeatherInfo` (`VPWeatherConfigModel`), `syncWeatherDataToDevice` (`VPWeatherServerModel` with hourly `VPWeatherServerHourlyModel` + daily `VPWeatherServerForecastModel`). **Visibility:** iOS model uses km; JS API normalizes all visibility to metres (`visibilityM`). **Temperature:** iOS `VPWeatherServerHourlyModel.temp` is °F only; Android accepts both C and F.

**Women's health:** Gate with `readDeviceFunctions().woman`. **Android:** `readWomenState` / `settingWomenState` (`WomenSetting`, `IWomenDataListener`, `WomenData`); `VpSpGetUtil.isSupportWomenSetting`. **iOS:** `veepooSDKSettingDeviceFemaleWithFemaleModel` (read `settingMode` 2 / set 1, `VPDeviceFemaleModel`). Dates are `yyyy-MM-dd` strings on iOS; Android uses `TimeData` internally.

**Watch face / screen style:** Gate with `readDeviceFunctions().screenStyleFunction` (and related `aiDial` / `videoDial` hints where applicable). **Android:** `readScreenStyle` / `settingScreenStyle` (`ScreenStyleData`, `EScreenStyle`); `VpSpGetUtil.isSupportScreenStyle`. **iOS:** `veepooSDKSettingDeviceScreenStyle` (read `settingMode` 2 / set 1, `VPDeviceDialType`). **Partial scope:** this bridge exposes **read/set of the active dial category + slot index** only — custom image transfer, marketplace sync, and video dials are **not** implemented here.

**Contacts & SOS:** Gate with `readDeviceFunctions().package3.contactFunction` (`"support"` or better). SOS-specific operations (`setContactSosState`, `readSosCallTimes`, `setSosCallTimes`) additionally require `contactType >= 2`; both reject with `CAPABILITY_UNSUPPORTED` otherwise. **Android:** `VPOperateManager` — `readContact(crc, IContactOptListener, IBleWriteResponse)` (CRC optimization: `onContactReadASSameCRC` returns empty list when device CRC matches), `addContact`, `deleteContact`, `setContactSOSState` (`IContactOptListener`); SOS call times via `readSOSCallTimes` / `setSOSCallTimes` (`ISOSCallTimesListener`). **iOS:** single entry point `veepooSDKSettingDeviceContactsWithOpCode:opModel:toID:resultBlock:` with `VPDeviceContactsOpCode` enum (`.read`, `.add`, `.delete`, `.edit`); SOS call times via `veepooSDKSettingDeviceContactsSOSInfoWithOpCode:times:resultBlock:` (`VPSOSOperationType.read` / `.setting`). **Contact model:** `name` (Android) / `nickName` (iOS) ≤ 20 bytes UTF-8; `phoneNumber` ≤ 20 chars; `isSOS` / `isSettingSOS` flag. **Not bridged:** `moveContact` / `VPDeviceContactsOpCodeMove` (reorder), device-initiated SOS command callback (`ReceiveDeviceSOSCommand`).

**Camera remote:** Gate with `readDeviceFunctions().camera` (non-zero). **Android:** `VPOperateManager.startCamera` / `exitCamera` + `ICameraDataListener`; `TAKEPHOTO_CAN` → `canTake`, `TAKEPHOTO_CAN_NOT` → `cannotTake`. **iOS:** `veepooSDKSettingCameraType` (`.enter` / `.exit` / `.photo`); `VPCameraType`. `cameraShutter` emits only while in camera mode (`.photo` callback).

**Music control:** Gate with `readDeviceFunctions().musicFunction`. **iOS:** `setMusicControlEnabled` uses `veepooSDKSettingBaseFunctionType(.musicControl, settingState:)` (on/off toggle). **Android:** no documented setter — `setMusicControlEnabled` resolves immediately as no-op. `pushMusicData` is Android-only (`settingMusicData` + `IMusicControlListener`; emits `musicRemoteCommand` for next/previous/pausePlay). `pushMusicData` on iOS rejects with `CAPABILITY_UNSUPPORTED`.

**GPS / AGPS:** Gate with `readDeviceFunctions().package3.agpsFunction`. `setDeviceGPSAndTimezone` pushes lat/lon/altitude/timezone to the Band. **iOS:** `veepooSDK_setDeviceGPSAndTimezoneWithModel:result:` (result 0=unsupported, 1=success, 2=failed). **Android:** no documented GPS data-transfer API — rejects with `CAPABILITY_UNSUPPORTED`. **Not bridged:** AGPS ephemeris transfer (`veepooSDK_AGPSTransformWithFileUrl`), device-initiated live GPS feed (`veepooSDK_sendGPSDataToDeviceWithBlock`), KAABA direction APIs.

**Band Bluetooth toggle:** Controls the Band's **classic BT radio** (for phone-call audio forwarding), not the phone's BLE adapter. `readDeviceBTStatus` returns `DeviceBTStatus`; `setDeviceBTSwitch(open)` toggles the radio; `deviceBTStateChanged` event fires on state changes. **Android:** full API — `readBTInfo` / `setBTSwitchStatus` / `IDeviceBTInfoListener` (supports both open and close). **iOS:** `veepooSDK_openDeviceBTSwitch` (open only); `VPBTConnectStateChangeBlock` for events. Gate: `CPUType == 1` (Jerry series). `setDeviceBTSwitch(false)` on iOS rejects with `CAPABILITY_UNSUPPORTED` (no vendor close API). **Not bridged:** advanced `setBTStatus` (auto-reconnect, audio routing, clear pairing), manual `connectBT`/`disconnectBT`.

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
| Body composition (manual realtime) | `startBodyCompositionTest`, `stopBodyCompositionTest`; `bodyCompositionTestResult` | Shipped | TBD |

### Further notes (realtime vitals, PRD #66)

- **Single active realtime test:** Starting any supported `start*Test` while another realtime test is active rejects with **`REALTIME_TEST_IN_PROGRESS`** ([issue #67](https://github.com/launchbox-tech/expo-veepoo-sdk/issues/67)). Eligibility errors may use **`DEVICE_NOT_READY`**, **`DEVICE_NOT_CONNECTED`**, or **`CAPABILITY_UNSUPPORTED`** ([`VeepooErrorCode`](../src/types/errors.ts) in source).
- **HRV:** **Android** uses `readDeviceManualData` + `DeviceManualDataType.HRV` with `IDeviceManualDetectDataListener.onHrvManualDataChange` (polling loop in `VeepooSDKModuleHelpers.kt`). **iOS** (`VPPeripheralBaseManage.h`): `VPManualTestDataType` defines only blood pressure and heart rate bits—no HRV; `readManualTestDataWithTimestamp` returns `VPManualTestDataModel` (manual BP). Historical HRV uses `veepooSdkStartReadDeviceHrvData` / DB helpers, not an app-driven manual realtime test. There is no `veepooSDKTestHrvStart`-style entry point alongside stress/temperature/ECG. **`startHrvTest`** therefore rejects with **`CAPABILITY_UNSUPPORTED`** with a message pointing here; use **historical HRV** or **Android** for this modality until the vendor ships a documented iOS equivalent.
- **ECG:** Summary-style fields are always emitted on `ecgTestResult`. **`startEcgTest({ includeWaveform: true })`** may populate `result.waveform` when the Band and native stack support it; payloads can be large.
- **Breathing:** **iOS** uses `veepooSDKTestBreathingRateStart`; **Android** uses `startDetectBreath` / `stopDetectBreath` with `BreathData` (maps `deviceState` / progress / value into the same `breathingTestResult` shape as iOS).
- **Body composition:** Gate with `readDeviceFunctions().bodyComponent` where applicable. **Android:** `startDetectBodyComponent` / `stopDetectBodyComponent` (`IBodyComponentDetectListener`, `BodyComponent`); `VpSpGetUtil.isSupportBodyComponent`. **iOS:** `veepooSDKTestBodyCompositionStart` (progress + `VPDeviceBodyCompositionState` / `VPBodyCompositionValueModel`); `peripheralModel.bodyCompositionType`. **Partial:** historical `readBodyComponentData` / DB offline lists are **not** bridged in this slice.

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
- AGPS ephemeris transfer, device-initiated live GPS feed, KAABA direction APIs  
- Advanced Band BT controls (auto-reconnect, audio routing, clear pairing, manual connect/disconnect)

Treat gaps as **Not in JS** until a PR adds methods **and** updates this matrix.

---

## Incremental updates

After merging a feature:

1. Edit the relevant row(s) in this file (**Status**, **Device tested** when known).  
2. Bump **`vendor-manifest.json`** if vendored files changed.  
3. Add **`docs/release-notes/`** entry for consuming apps.
