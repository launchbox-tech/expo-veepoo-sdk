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
| Capability flags | `readDeviceFunctions`; `deviceFunction` | Shipped — Android v1.1.8+ uses five typed `DeviceFunctionPackage` callbacks internally; bridge merges them transparently | TBD |
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
| Band-initiated SOS trigger | `deviceSosTriggered` | Shipped — **iOS only** (`ReceiveDeviceSOSCommand` callback); no vendor Android callback documented | TBD |
| Custom measurement units & skin tone | `readCustomSettings`, `writeCustomSettings`; `customSettingsData` | Shipped — temperature unit (°C/°F), blood glucose unit (mmol/L / mg/dL), skin-tone level 1–6 | TBD |
| Health reminders (multi-type) | `readHealthReminder(type)`, `setHealthReminder(reminder)`; `healthRemindData` | Shipped — 8 types: sedentary, drinkWater, lookFarAway, sport, takeMedicine, read, trip, washHands | TBD |
| SpO2 apnea remind | `readApneaRemindSettings`, `setApneaRemindSettings`; `apneaRemindData` | Shipped — **iOS only** (gate: `oxygenType == 4`); Android rejects `CAPABILITY_UNSUPPORTED` | TBD |
| Exercise session history | `startReadExerciseData`; `exerciseSessionData` (per session) + `readOriginComplete` | Shipped — type, beginTime/endTime, totals (steps/distance/calories/time/HR/pace), pause info, per-minute minuteData; Android: `readSportModelOrigin`; iOS: `veepooSDKStartReadDeviceRunningData` → CRC list → block reads; gate: `runningSaveTimes > 0` (iOS) / `isSupportMultSportModel` (Android) | TBD |
| GSR test (galvanic skin response) | `startGsrTest`, `stopGsrTest`; `gsrTestResult` | Shipped — **Android only** (no iOS vendor API); emotionLevel, skinMoisture, snsActivation, cortisolValue; gate: `isSupportGSR()` (Android) | TBD |
| Accurate / detailed sleep history | `readAccurateSleepData(date?)`; `accurateSleepData` (per session) | Shipped — sleepTime/wakeTime, 5 duration fields (deep/light/rem/getUp/total), sleepQuality (0–4), insomniaScore/Times, fallAsleepScore, sleepEfficiencyScore, per-minute `curve` (index + state); gate: `isSupportPreciseSleep()` (Android) / `sleepType > 0` (iOS); sleep line parsed from hex string (top 3 bits of each 2-byte word) | TBD |
| Blood analysis test (lipid panel + uric acid) | `startBloodAnalysisTest`, `stopBloodAnalysisTest`; `bloodAnalysisTestResult` | Shipped — uricAcid, totalCholesterol, triglyceride, HDL, LDL; gate: `bloodAnalysisType > 0` (iOS) / `isSupportBloodComponentDetect` (Android); `isPersonalModel: false` (standard mode) | TBD |
| Sport mode setting | `readSportMode`, `setSportMode`, `stopSportMode`; `sportModeData` | Shipped — 127 modes (ordinal 1–127); iOS `readSportMode` returns `mode: null` (vendor only gives on/off status); `sportModeData` fires on session end; gate: `runningSaveTimes > 0` (iOS) / `isSupportSportModel` (Android) | TBD |
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

**Contacts & SOS:** Gate with `readDeviceFunctions().package3.contactFunction` (`"support"` or better). SOS-specific operations (`setContactSosState`, `readSosCallTimes`, `setSosCallTimes`) additionally require `contactType >= 2`; both reject with `CAPABILITY_UNSUPPORTED` otherwise. **Android:** `VPOperateManager` — `readContact(crc, IContactOptListener, IBleWriteResponse)` (CRC optimization: `onContactReadASSameCRC` returns empty list when device CRC matches), `addContact`, `deleteContact`, `setContactSOSState` (`IContactOptListener`); SOS call times via `readSOSCallTimes` / `setSOSCallTimes` (`ISOSCallTimesListener`). **iOS:** single entry point `veepooSDKSettingDeviceContactsWithOpCode:opModel:toID:resultBlock:` with `VPDeviceContactsOpCode` enum (`.read`, `.add`, `.delete`, `.edit`); SOS call times via `veepooSDKSettingDeviceContactsSOSInfoWithOpCode:times:resultBlock:` (`VPSOSOperationType.read` / `.setting`). **Contact model:** `name` (Android) / `nickName` (iOS) ≤ 20 bytes UTF-8; `phoneNumber` ≤ 20 chars; `isSOS` / `isSettingSOS` flag. **Not bridged:** `moveContact` / `VPDeviceContactsOpCodeMove` (reorder). **`deviceSosTriggered` event:** iOS-only (`ReceiveDeviceSOSCommand` block on `VPPeripheralBaseManage`); Android vendor SDK has no documented equivalent — Android side silent.

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
| Mini-checkup (comprehensive 10-param health assessment) | — | Not in JS | — |
| GSR / galvanic skin response (skin conductance) | — | Not in JS | — |

### Further notes (realtime vitals, PRD #66)

- **Single active realtime test:** Starting any supported `start*Test` while another realtime test is active rejects with **`REALTIME_TEST_IN_PROGRESS`** ([issue #67](https://github.com/launchbox-tech/expo-veepoo-sdk/issues/67)). Eligibility errors may use **`DEVICE_NOT_READY`**, **`DEVICE_NOT_CONNECTED`**, or **`CAPABILITY_UNSUPPORTED`** ([`VeepooErrorCode`](../src/types/errors.ts) in source).
- **HRV:** **Android** uses `readDeviceManualData` + `DeviceManualDataType.HRV` with `IDeviceManualDetectDataListener.onHrvManualDataChange` (polling loop in `VeepooSDKModuleHelpers.kt`). **iOS** (through v1.1.4): `VPManualTestDataType` defines only blood pressure and heart rate bits—no HRV; `readManualTestDataWithTimestamp` returns `VPManualTestDataModel` (manual BP). Historical HRV uses `veepooSdkStartReadDeviceHrvData` / DB helpers, not an app-driven manual realtime test. **iOS v1.2.0** adds a dedicated HRV measurement API (not yet documented in this offline snapshot — consult live iOS wiki). **`startHrvTest`** currently rejects with **`CAPABILITY_UNSUPPORTED`** on iOS with a message pointing here; update this bridge once the iOS v1.2.0 HRV API is documented.
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
- Text / image push to Band display (`pushTextMsg` / `pushImageMsg` Android v1.1.5; iOS `veepooSDKSendStartTransmissionMessage` / image transfer v1.1.1)
- JH58 PPG + acceleration raw-data streaming (Android v1.1.6; iOS v1.1.1 `veepooSDK_JH58*`)
- World clock CRUD (`veepooSDKWorldClockReadWithModels` / `veepooSDKWorldClockWriteWithModels`; `worldClock` flag is exposed in `DeviceFunctions` but the read/write operations are not bridged)
- Mini-checkup comprehensive health assessment (`startMiniCheckup` / `stopMiniCheckup` Android v1.1.7; iOS equivalent TBD)
- GSR / galvanic skin response detection (`startGsrDetect` / `stopGsrDetect` Android v1.1.9; iOS `veepooSDK_gsrDetectStart` v1.1.5)
- Multi-type manual measurement data retrieval (Android v1.2.2 — 12 types; iOS v1.1.8 — 6 types via `readManualTestDataWithTimestamp`)
- Nordic OTA (Android v1.2.4; iOS v1.1.9) — `startLocalFirmwareDfu` currently covers JL/Jerry path only
- Health Assistance, Health Glance (iOS v1.1.5)
- AI function (iOS v1.1.7); sport-control set/read/report, device rename (Android v1.2.6)
- App-side HRV detection (Android v1.2.8; iOS v1.2.0); ECG diagnosis (Android v1.2.7)
- Connection confirmation pop-up (Android v1.2.3; iOS v1.1.9)
- QX17 IMU/GPS/HR flow control + vibration motor (Android v1.2.9)
- JE136P TCM data distribution (iOS v1.2.0)

Treat gaps as **Not in JS** until a PR adds methods **and** updates this matrix.

---

## Incremental updates

After merging a feature:

1. Edit the relevant row(s) in this file (**Status**, **Device tested** when known).  
2. Bump **`vendor-manifest.json`** if vendored files changed.  
3. Add **`docs/release-notes/`** entry for consuming apps.
