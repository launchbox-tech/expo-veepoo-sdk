# Veepoo Band — Vendor Surface Inventory (G Band APK interop research)

Decompiled from `com.vpgband.app.apk` (jadx). Vendor SDK package = `com.veepoo.protocol`;
G Band app device layer = `com.veepoo.device` / `com.veepoo.home`.

Surface size: VPOperateManager exposes ~290 distinct public command methods; 137 listener
interfaces in `listener.data.*`; 135 data-model classes in `model.datas.*`; 86 enums;
33 setting classes; 70 device-capability flags.

---

## 1. VPOperateManager — vendor command surface (grouped)

### 1a. Read commands (history / stored data)
- `readAllHealthData`, `readAllHealthDataBySettingOrigin` — bulk health pull
- `readOriginData`, `readOriginDataBySetting`, `readOriginDataFromDay`, `readOriginDataSingleDay` — 5-min/half-hour origin (steps/HR/sport/temp/sleep-state)
- `readSleepData`, `readSleepDataBySetting`, `readSleepDataFromDay`, `readSleepDataSingleDay`
- `readSportStep` — current/today step counter
- `readHRVOrigin`, `readHRVOriginBySetting` — stored HRV per-5-min
- `readSpo2hOrigin`, `readSpo2hOriginBySetting` — stored SpO2 (incl. apnea/cardiac-load/respiration)
- `readTemptureDataBySetting` — stored skin temperature
- `readSportModelOrigin`, `readSportModelState`, `readSportDataCrc`, `readSportControlInfo` — exercise/workout sessions (GPS + non-GPS head + item rows)
- `readECGData`, `readECGManuallyData`, `readMultiEcgData`, `readMultiECGId`, `readECGId` — ECG records + diagnosis
- `readBodyComponentData`, `readBodyComponentId` — bio-impedance body composition
- `readBloodComponentCalibration`, `readMultipleCalibrationBGValue`, `readBloodGlucoseAdjustingData` — blood-component / glucose calibration history
- `readDetectBP` / `readBpFunctionState` — stored BP & BP capability state
- `readDeviceManualData` — **all spot-test (manual) measurements in one pull** (HR/SpO2/BP/temp/HRV/glucose/blood-component/stress/MET/emotion/fatigue/skin-conductance)
- `readRRIntervalByDay`, `readHRVOrigin` — RR intervals / Lorenz
- `readPPGRawData`, `readPPGSwitchStatus` — raw PPG
- `readChantingData`, `readDrinkData`, `readCountDown`, `readWomenState` — misc trackers
- `readBattery`, `readProductionInfo`, `readBTInfo`, `readRssi`, `readDeviceManualData`

### 1b. Start/Stop measurement commands (spot tests / live detect)
Pairs (start → stop):
- `startDetectHeart` / `stopDetectHeart` — HR
- `startDetectSPO2H` (+ `startDetectSPO2HForG08WProject`) / `stopDetectSPO2H` — blood oxygen
- `startDetectBP` / `stopDetectBP`, `startDetectCuffBP` / `stopDetectCuffBP` — blood pressure (PPG + cuff/air-pump)
- `startDetectECG` / `stopDetectECG`, `startDetectMultiECG` / `stopDetectMultiECG`, `startMultiLeadDetectECG` / `stopMultiLeadDetectECG`
- `startDetectHrv` / `stopDetectHrv` — HRV
- `startDetectTempture` / `stopDetectTempture` — temperature
- `startDetectPressure` / `stopDetectPressure` — stress
- `startDetectFatigue` / `stopDetectFatigue` — fatigue
- `startDetectBreath` / `stopDetectBreath` — breathing/respiration
- `startDetectGsr` / `stopDetectGsr` — GSR / skin conductance
- `startBloodGlucoseDetect` / `stopBloodGlucoseDetect` — blood glucose
- `startDetectBloodComponent` / `stopDetectBloodComponent` — blood-component (uric acid, cholesterol, TAG, HDL, LDL)
- `startDetectBodyComponent` / `stopDetectBodyComponent` — body composition
- `startDetectTcmDiagnosis` / `stopDetectTcmDiagnosis` — TCM diagnosis (incl. ECG ADC)
- `startMiniCheckup` / `stopMiniCheckup` — "1-minute mini checkup" composite (HR+BP+SpO2+stress+...)
- `startReadPttSignData` / `stopReadPttSignData` — PTT (pulse transit time)
- `startSportModel` / `stopSportModel`, `startMultSportModel`, `startGsensorSport` / `stopGsensorSport` — live workout session
- `startPPGRealTimeTransmission` / `stopPPGRealTimeTransmission` — live PPG stream
- `startSafetyProtection` / `stopSafetyProtection` — SOS/safety
- `startFindDeviceByPhone` / `stopFindDeviceByPhone`, `startCamera` / `stopCamera`

### 1c. Settings read/write
Alarms (`readAlarm`/`addAlarm2`/`modifyAlarm2`/`deleteAlarm2`/`getAlarm2List`, `settingAlarm`),
text alarms (`addTextAlarm`/`readTextAlarm`/...), world clocks, contacts (`addContact`/`moveContact`/...),
SOS call times (`readSOSCallTimes`/`setSOSCallTimes`/`setContactSOSState`),
screen (`readScreenLight`/`settingScreenLight`, `readScreenLightTime`/`setScreenLightTime`, `readScreenStyle`/`settingScreenStyle`),
heart-warning (`readHeartWarning`/`settingHeartWarning`), health remind (`readHealthRemind`/`settingHealthRemind`),
sedentary (`readLongSeat`/`settingLongSeat`), night turn-wrist (`readNightTurnWriste`/`settingNightTurnWriste`),
auto-measure (`readAutoMeasureSettingData`/`setAutoMeasureSettingData`, `readSpo2hAutoDetect`/`settingSpo2hAutoDetect`),
women's health (`readWomenState`/`settingWomenState`), weather (`settingWeatherData`/`settingWeatherStatusInfo`/`readWeatherStatusInfo`),
language (`settingDeviceLanguage`), time (`settingTime`), GPS (`settingGpsLatLon`/`setReportGps`),
custom UI/watchface (`changeCustomSetting`/`readCustomSetting`/`setCustomWacthUi`/`readWatchUiInfo`),
breath-break remind, BG/blood-component calibration, music control, volume, kaaba/prayer, countdown,
health alarm interval, fun-switch state, magnetic therapy.

### 1d. Device control
`connectDevice`/`disconnectWatch`, `confirmDevicePwd`/`modifyDevicePwd`/`verifyPassword`,
`clearDeviceData`/`resetDeviceData`, `powerOffDevice`, `changeMTU`, `readBattery`,
`startCamera`/`stopCamera`, `settingFindDevice`, `pushTextMsg`/`pushImageMsg`/`sendSocialMsgContent`,
`pushGnssLocationData`, `bleDeviceRename`, `openBluetooth`/`closeBluetooth`.

### 1e. DFU / firmware / watchface
`checkVersionAndFile`/`getOadVersion`/`findOadModelDevice`/`enterOad`,
`startNordicOtaUpgrade`, `startZkOtaUpgrade`, `startJLDeviceOTAUpgrade`/`startJLDeviceAuth`,
`makeDeviceIntoUpdateMode*` (AGPS, server, image-push, G15 themes/profile/QR),
`startUiUpdate`/`endUiUpdate`/`checkUiCrc`/`sendUiData`, `updatePhotoDial`/`setJLWatchDial`.

### 1f. Other / AI / 4G
AI dial (`sendAIDial*`), AI Q&A (`sendAIQA*`), 4G/network (`set4gServerInfo`/`read4gServerInfo`),
soldier/safety command channel (`sendToSoldierCommand`), magnetic therapy, GNSS location.

---

## 2. Listener interfaces & data shapes (high-value measurement types)

### Sport / Exercise
- `ISportModelOriginListener`: `onHeadChangeListListener(SportModelOriginHeadData)`,
  `onGPSWatchSportModeHeadChange(SportModelGPSWatchOriginHeadData)`,
  `onItemChangeListListener(List<SportModelOriginItemData>)`, `onReadOriginProgress(float)`, `onReadOriginComplete()`.
- `ISportDataListener`: `onSportDataChange(SportData)` — live {step,distance,calorie}.
- `IDeviceSportReportListener`: `onSportControlDataChange(SportControlDataInfo)`.
- `ESportType` (60 modes): walk/run (indoor/outdoor), riding, swim, HIIT, yoga, rope, climb, ball sports, rowing, elliptical, treadmill, marathon, triathlon, etc.

### ECG
- `IECGDetectListener`: `onEcgADCChange(int[],int[])`, `onEcgDetectInfoChange(EcgDetectInfo)`,
  `onEcgDetectResultChange(EcgDetectResult)`, `onEcgDetectDiagnosisChange(EcgDiagnosis)`, `onEcgDetectStateChange(EcgDetectState)`.
- `IECGReadDataListener`: `readDataFinish(List<EcgDetectResult>)`, `readDiagnosisDataFinish(List<EcgDiagnosis>)`.
- `EcgDetectResult` fields: heartRate, aveHeart, aveHrv, aveQT, aveResRate, duration, drawfrequency, frequency,
  diseaseResult, diagnosis8, leadOffType/leadSign, originSign, filterSignals, powers, progress, isSuccess.
- `EcgDiagnosis` (9.3K) — full per-disease scoring.

### SpO2 / Oxygen
- `ISpo2hDataListener`: `onSpO2HADataChange(Spo2hData{value, rateValue, spState, deviceState, checkingProgress})`.
- `ISpo2hOriginDataListener`: `onSpo2hOriginListener(Spo2hOriginData)`, progress/complete.
- `Spo2hOriginData` fields: oxygenValue, heartValue, respirationRate, apneaResult, hypopnea, hypoxiaTime,
  isHypoxia, cardiacLoad, hRVariation, sportValue, stepValue, date, mTime.

### HRV
- `IHrvDetectListener`: `onHrvDetect(int)`, `onDetectFailed(HrvDetectState)`, `onDetectStop()`.
- `IHRVOriginDataListener`: `onHRVOriginListener(HRVOriginData)`, `onDayHrvScore(int,String,int)`, progress/complete.
- `HRVOriginData` fields: hrvValue, hrvType, rate, rrValue(int[]), date, mTime.
- `getHrvAnalysisReport(List<HRVOriginData>, IHrvAnalysisReportListener)` → `HrvAnalysisReport`.
- RR/Lorenz: `convertRRData2RRLorenzInfo`, `RRLorenzInfo`/`RRLorenzPointInfo`.

### Sleep
- `ISleepDataListener`: `onSleepDataChange(SleepData)`. `onReadSleepComplete`, `onSleepProgress`/`onSleepProgressDetail`.
- `SleepPrecisionData` (8.5K): accurateType, deepScore, lightMode, fallAsleepScore, getUpScore,
  insomnia (times/duration/score/length/tag), sleepEfficiencyScore, sleepTag, sleepSourceStr, per-segment durations.

### Temperature
- `ITemptureDetectDataListener`: `onDataChange(TemptureDetectData)`.
- `ITemptureDataListener`: `onTemptureDataListDataChange(List<TemptureData>)`.
- `TemptureData` fields: tempture(float), baseTempture(float), allPackage, packageNumber, mTime.

### Blood Glucose
- `IBloodGlucoseChangeListener`: `onBloodGlucoseDetect(int, float, EBloodGlucoseRiskLevel)`,
  `onDetectError(int, EBloodGlucoseStatus)`, adjusting/multiple-adjusting read+set callbacks (meal-based).
- `BloodGlucoseManualData`: bloodGlucoseValue(float), risk(EBloodGlucoseRiskLevel), timeStamp, version.

### Blood Pressure
- `IBPDetectDataListener`: `onDataChange(BpData)`. `ICuffBPDetectDataListener` for cuff/air-pump.
- `BloodPressureManualData` (7.2K): systolic, diastolic, heartRate, measurementMode, resultCredibility,
  age/height/isMale, + raw arrays (ppgAdcArray, pressureAdcArray, accelerationX/Y/Z, attitudeArray, sportArray).

### Body Composition
- `IBodyComponentDetectListener`: `onDetectSuccess(BodyComponent)`, `onDetecting(int,int)`, fail/stop.
- `BodyComponent`: BMI, bodyFatRate, bodyWater, boneMass, muscleMass/Rate, proteinMass/Proportion,
  skeletalMuscleRate, subcutaneousFat, FFM, basalMetabolicRate, waterContent.

### Blood Component
- `IBloodComponentDetectListener`: `onDetectComplete(BloodComponent)`, `onDetecting(int,BloodComponent)`, fail/stop.
- `BloodComponent`: uricAcid, tCHO (total cholesterol), tAG (triglycerides), hDL, lDL.

### Stress / Fatigue / GSR
- `IPressureDetectListener`: `onDetectSuccess(int)`, `onDetecting(int)`, fail/stop. (stress score)
- `IFatigueDataListener`: `onFatigueDataListener(FatigueData{value, fatigueState, progress})`.
- `IGsrDetectListener`: `onGsrDetectSuccess(GsrDetectResult)`, progress/fail/stop. (skin conductance)
- `ITcmDiagnosisDetectListener`: `onTcmDiagnosisDiagnosisChange(TcmDiagnosis)` + ECG ADC.

### Mini Checkup (composite 1-min health snapshot)
- `IMiniCheckupOptListener`: `onMiniCheckupSuccess(MiniCheckupResultData)`,
  `onMiniCheckupDetailTestSuccess(MiniCheckupDetailData)`, progress/fail/stop.
- Sub-models: MiniCheckupBPAirPump, MiniCheckupBPPhotoelectric, MiniCheckupBloodComponent,
  MiniCheckupBodyComponent, MiniCheckupSkinElectricity.

### Women's Health
- `IWomenDataListener`: `onWomenDataChange(WomenData{oprateStatus, womenSetting})`.
- `WomenSetting` (3.5K) — cycle config; `WomanCyclesBean` DB table.

### Breathing / PTT / PPG
- `IBreathDataListener`: `onDataChange(BreathData)`.
- `IPttDetectListener`, `IPPGRealTimeTransmissionListener` (`PPGSecondData`), `IPPGRawDataReadListener` (`PPGRawData`).

### Device function (capability)
- `IDeviceFuctionDataListener`: `onDeviceFunctionPackage1Report` … `Package5Report`,
  `onFunctionSupportDataChange(FunctionDeviceSupportData)`.

---

## 3. Capability detection mechanism

When the band connects (`confirmDevicePwd`), it returns up to **5 function-support packets**
(`DeviceFunctionPackage1`…`5`, each ~6-8K decoded bit-fields). The SDK merges them into a single
`FunctionDeviceSupportData` carrying **70 `EFunctionStatus` flags**. Each flag is one of
`EFunctionStatus = { UNSUPPORT, SUPPORT, SUPPORT_OPEN, SUPPORT_CLOSE }` (so a feature can be present
but toggled on/off). The G Band app reads these via getters (`getEcg()`, `getBp()`, etc.) on
`FunctionDeviceSupportData`, and stores/queries persisted feature state through
`VpSpGetUtil` / `VpSpSaveUtil` (e.g. `getECGType()`). `VPOperateManager.getFunctionCheck()` exposes
the live capability object. `setShowFunctionNotSupportToast` / `isShowFunctionNotSupportToast`
gate UI when a feature is `UNSUPPORT`.

### All 70 capability flags
agps, aiDial, aiQA, Alarm2, allDayHrvFunc, AngioAdjuster, autoMeasure, beathFunction, bloodComponent,
bloodComponentHealthAssessment, bloodComponentSingleCalibration, bloodGlucose, bloodGlucoseAdjusting,
bloodGlucoseHealthAssessment, bloodGlucoseMultipleAdjusting, bloodGlucoseRiskAssessment, bodyComponent,
bodyComponentHealthAssessment, Bp, Camera, contactFunction, CountDown, daSport, distanceCalorieGoal,
Drink, ecg, Fatigue, findDeviceByPhone, gameSetting, GSR, healthAssessment, healthRemind, heartDetect,
HeartWaring, hidFuction, hrvAppDetectFunction, hrvFunction, Longseat, lowPower, met, miniCheckup,
multSportModel, newCalcSport, NightTurnSetting, photoAlbum, postcard, precisionSleep, resetData,
safetyProtection, ScreenLight, screenLightTime, screenStyleFunction, server4g, Spo2H, Spo2HAdjuster,
Spo2HBreathBreak, Spo2hShow, Spo2HValueZero, SportModel, stress, temperatureAlarm, temperatureFunction,
textAlarm, textImagePush, videoDial, wallet, weatherFunction, WeChatSport, Women, worldClock.

---

## 4. G Band APP persistence (Room DB `VpAppDataBase`, 20 DAOs)

| DAO | SQLite table | Holds |
|---|---|---|
| OriginInfoDao | FiveMinutesOriginInfo | 5-min origin (steps/HR/sport/temp/sleep-state) |
| HalfHourDataDao | HalfHourSportBean | half-hour aggregates |
| SleepInfoBeanDao | SleepInfoBean | sleep sessions |
| FitnessDao | Fitness | workout/exercise sessions |
| VpEcgDao | VpEcgDetectInfo | ECG records + diagnosis |
| VpMultiEcgDao | multi_ecg_result_info | multi-lead ECG |
| VpGsrInfoDao | gsr_info | GSR / skin conductance |
| VpPttDao | VpPttRecordInfo | PTT records |
| VpBodyComponentDao | VpBodyComponentInfo | body composition |
| VpDeviceManualDbDao | VpBTDeviceManualInfo | **all spot tests** (HR/SpO2/BP/temp/HRV/glucose/blood-component/stress/MET/emotion/fatigue/skin) |
| WomanCyclesDao | WomanCyclesBean | women's cycle |
| HealthDataDbDao | health_data | generic health rows |
| VpHealthGlanceInfoDao | health_glance_info | dashboard glance |
| AIHealthAnalysisDao | ai_health_analysis_record | AI analysis output |
| DeviceInfoDbDao | device_info | paired device meta |
| DialInfoDao | DownloadDialInfo | watchface downloads |
| DateVersionDao | DateVersionDown | per-date sync version cursor |
| OriginDataVersionDao | OriginDataVersion | origin sync version cursor |
| StravaDao | StravaSportUploadBean | Strava upload queue |
| HealthSharingInviteInfoDao | invite_info | health-sharing invites |

`VpBTDeviceManualInfo` columns (embedded per-type sub-objects): account, mac, date, timeStamp, version,
baseTemperature, temperature, rate (HR), oxygen (SpO2), uricAcid/tCHO/tAG/hDL/lDL (blood-component),
hrv, risk/bloodGlucoseValue (glucose), full BP block (systolic/diastolic/heartRate/measurementMode/
credibility + raw ADC arrays), pressure (stress), meto (MET), isUpload/isDelete/spare.

---

## 5. G Band sync recipe (BleReadManager1, `home/other/ble`)

Two coroutine phases run after `confirmDevicePwd` succeeds. Both are sequential (each step awaits the
previous, each wrapped in a per-step timeout). Orchestrator = `BleReadManager1` (Kotlin); the source
labels confirm the order and timeouts below.

### Phase A — `startDeviceSetting` ("初始化设备设置" / initialize device settings)
1. readProductionInfo (30s)
2. changeCustomSetting (15s)
3. readWatchUiInfo (15s)
4. syncPersonInfo (15s)
5. settingDeviceLanguage (15s)
6. readScreenStyle (15s)
7. readCustomSetting (15s)
8. readAlarmList (15s)
9. readScreenLightTime (15s)
10. readNightTurnWrist (15s)
11. readScreenLight (15s)
12. readLongSeat (sedentary) (15s)
13. readHeartWarning (15s)
14. readSpo2hAutoDetect (15s)
15. readContact (15s)
16. readWeatherStatusInfo (15s)
17. readBtInfo (0.5s)
18. readMultipleCalibrationBGValue (5s)
19. settingWomenState (5s)
20. readSportControlInfo (5s)
21. readAutoMeasureSettingData (5s)

### Phase B — `startSyncOriginData` ("同步日常数据" / sync daily data) — THE DATA SYNC
1. **readSleepData** (30s)
2. **readOriginData** (90s) — 5-min + half-hour origin (steps/HR/sport/temp/sleep-state/SpO2-origin/HRV-origin via OriginDataReader)
3. **readSportStep** (60s) — current/today step count
4. **readSportModelOrigin** (60s, via `f()`, type=2) — exercise/workout sessions
5. **readTemperatureData** (60s) — stored temperature
6. **readECGData** (80s) — stored ECG records + diagnosis
7. **readBodyComponentData** (60s) — body composition
8. **readBloodComponentCalibration** (60s) — blood-component calibration history
9. **readDetectBP** (60s) — stored blood pressure
10. **readDeviceManualData** (final) — pulls all remaining spot-test rows (HR/SpO2/HRV/glucose/stress/MET/emotion/fatigue/skin) in one command

Note: `readOriginData`'s `OriginDataReader` (in `com.veepoo.device.utils`) internally fans the origin
packet out into 5-min, half-hour, **SpO2-origin** and **HRV-origin** lists — so SpO2 and HRV history
are folded into step 2, not separate top-level steps. The Veepoo origin parse is local-DB-backed
(`readDeviceAllData` transfers band→SDK-DB first; see our existing memory note).

---

## 6. GAP TABLE — vendor capability vs our SDK (expo-veepoo-sdk)

Legend: Wrapped = yes / no / partial. "G Band uses" = does the vendor app pull/use it in its sync.

| Vendor capability | Wrapped? | G Band uses? | Notes |
|---|---|---|---|
| Connect / disconnect / status | yes | yes | connect, disconnect, getConnectionStatus |
| Verify password | yes | yes | verifyPassword / confirmDevicePwd |
| Read device functions (capability) | yes | yes | readDeviceFunctions → FunctionDeviceSupportData |
| Read battery | yes | yes | |
| Read device version / production info | partial | yes | We have readDeviceVersion; vendor also reads readProductionInfo (serial/model) — **not wrapped** |
| Origin 5-min/half-hour daily data | yes | yes | readOriginData / readDaySummaryData / readDeviceAllData |
| Sport step (today step counter) | yes | yes | readSportStepData |
| Sleep (basic + accurate) | yes | yes | readSleepData / readAccurateSleepData |
| **Exercise / workout sessions** | partial | yes | We have `startReadExerciseData`; vendor sync uses `readSportModelOrigin` (head + GPS-head + item rows + progress). **Our JS layer historically didn't fire it** (see memory: workout_sessions empty). Confirm the wrapped path reads SportModelOriginHeadData/Item/GPS. |
| Stored ECG + diagnosis | yes | yes | readStoredEcgData. Vendor returns EcgDetectResult + EcgDiagnosis. |
| **Multi-lead ECG** | no | yes (table `multi_ecg_result_info`) | `startDetectMultiECG`/`readMultiEcgData`/`startMultiLeadDetectECG` — **not wrapped** |
| Stored HRV | yes | yes (folded into origin) | readStoredHrvData / readHrvData; vendor gets it via OriginDataReader fan-out |
| Stored SpO2 / oxygen | partial | yes (folded into origin) | We have `startBloodOxygenTest` + auto-detect read; **no dedicated stored-SpO2-origin read** wrapped (vendor folds Spo2hOriginData via origin). SpO2-origin carries apnea/hypoxia/respiration/cardiac-load — richer than what a simple oxygen read exposes. |
| Stored temperature | yes | yes | readStoredTemperatureData |
| Stored blood glucose | yes | yes | readStoredBloodGlucoseData |
| Stored body composition | yes | yes | readStoredBodyCompositionData |
| **Stored blood component (uric acid/cholesterol/lipids)** | partial | yes | We have `startBloodAnalysisTest` (live blood-component); vendor also reads **calibration history** `readBloodComponentCalibration` — **not wrapped**. No dedicated stored-blood-component read in our list. |
| **Stored blood pressure (readDetectBP)** | partial | yes | We have `startBloodPressureTest` (live); vendor sync pulls stored BP via `readDetectBP`. **Stored-BP read not wrapped.** |
| **readDeviceManualData (all spot tests in one pull)** | no | yes (final sync step) | The vendor app's single-command bulk pull of ALL manual measurements (HR/SpO2/BP/temp/HRV/glucose/blood-component/stress/MET/emotion/fatigue/skin). **We have none of this** — we only fire individual live `start*Test` commands. This is the biggest stored-data gap. |
| Live HR test | yes | (on-demand) | startHeartRateTest/stop |
| Live SpO2 test | yes | (on-demand) | startBloodOxygenTest/stop |
| Live BP test | yes | (on-demand) | startBloodPressureTest/stop |
| **Live cuff/air-pump BP** | no | — | `startDetectCuffBP` — **not wrapped** (only PPG BP) |
| Live ECG test | yes | (on-demand) | startEcgTest/stop |
| Live HRV test | yes | (on-demand) | startHrvTest/stop |
| Live temperature test | yes | (on-demand) | startTemperatureTest/stop |
| Live stress test | yes | (on-demand) | startStressTest/stop |
| Live fatigue test | yes | (on-demand) | startFatigueTest/stop |
| Live breathing test | yes | (on-demand) | startBreathingTest/stop |
| Live GSR / skin conductance | yes | yes (table `gsr_info`) | startGsrTest/stop |
| Live blood glucose test | yes | (on-demand) | startBloodGlucoseTest/stop |
| Live blood-component (analysis) | yes | (on-demand) | startBloodAnalysisTest/stop |
| Live body-composition test | yes | (on-demand) | startBodyCompositionTest/stop |
| Live PTT test | yes | (on-demand) | startPttTest/stop |
| **Mini Checkup (1-min composite)** | no | yes | `startMiniCheckup` → MiniCheckupResultData (HR+BP+SpO2+stress+blood-component+body-component+skin). **Not wrapped.** |
| **TCM diagnosis** | no | — | `startDetectTcmDiagnosis` → TcmDiagnosis. **Not wrapped.** |
| **PPG real-time / raw PPG stream** | no | — | `startPPGRealTimeTransmission`, `readPPGRawData`. **Not wrapped.** |
| **RR interval / Lorenz** | no | — | `readRRIntervalByDay`, `convertRRData2RRLorenzInfo`. **Not wrapped.** |
| Auto-measure settings | yes | yes | readAutoMeasureSetting/modify |
| SpO2 auto-detect setting | partial | yes | vendor reads `readSpo2hAutoDetect`/`settingSpo2hAutoDetect`; we have generic modifyAutoMeasureSetting — **dedicated SpO2 auto-detect not wrapped** |
| Alarms / text alarms | yes | yes | setAlarm/readAlarms/deleteAlarm |
| **World clock** | no | — | addWorldClock/readWorldClock. **Not wrapped.** |
| Contacts + SOS | yes | yes | addContact/readContacts/setSosCallTimes/setContactSosState |
| Heart-rate alarm / warning | yes | yes | readHeartRateAlarm/setHeartRateAlarm |
| Health reminder | yes | yes | readHealthReminder/setHealthReminder |
| Sedentary reminder | yes | yes | readSedentaryReminder/setSedentaryReminder |
| Apnea/breath-break remind | yes | yes | readApneaRemindSettings/setApneaRemindSettings |
| Night/wrist-flip wake | yes | yes | readWristFlipWakeSettings/set... |
| Screen light + duration + style | yes | yes | readScreenLight*/set... + readWatchFaceStyle |
| Weather | yes | yes | pushWeatherData/setWeatherSettings/readWeatherSettings |
| Women's health | yes | yes | readWomenHealthSettings/setWomenHealthSettings |
| Custom settings (watch UI) | yes | yes | readCustomSettings/writeCustomSettings/readWatchFaceStyle |
| Social / message push | yes | yes | readSocialMsgData/writeSocialMsgData |
| Music control | yes | yes | pushMusicData/setMusicControlEnabled |
| Camera mode | yes | yes | enterCameraMode/exitCameraMode |
| Find device | yes | yes | startFindDevice/stopFindDevice |
| Personal info sync | yes | yes | syncPersonalInfo |
| Device time / GPS / timezone | yes | yes | setDeviceTime / setDeviceGPSAndTimezone |
| Language | yes | yes | setLanguage |
| BT switch / status | yes | yes | setDeviceBTSwitch/readDeviceBTStatus |
| **Sport-control info (live workout control)** | no | yes | `readSportControlInfo` / `setSportControlInfo` (used in settings phase). **Not wrapped.** |
| Local firmware DFU | yes | — | startLocalFirmwareDfu (vendor has many OTA flavours: Nordic/ZK/JL/AGPS/UI) — only generic local DFU wrapped |
| **Drink tracker** | no | — | readDrinkData. **Not wrapped.** |
| **Countdown** | no | — | readCountDown/settingCountDown. **Not wrapped.** |
| **Magnetic therapy** | no | — | openMagneticTherapy. **Not wrapped (likely irrelevant).** |
| **Safety protection (SOS/soldier)** | no | — | startSafetyProtection. **Not wrapped.** |
| **AI dial / AI Q&A / 4G** | no | — | sendAIDial*/sendAIQA*/set4gServerInfo. **Not wrapped (advanced device-only).** |
| **Multi sport model** | no | yes | startMultSportModel. **Not wrapped.** |
| **Health alarm interval** | no | — | readHealthAlarmInterval. **Not wrapped.** |
| **BG multiple calibration (meal-based)** | partial | yes | vendor uses readMultipleCalibrationBGValue + MealInfo; we have generic glucose test only |

---

## 7. Summary of unwrapped *data intakes* (priority for SDK)

Stored/history reads our SDK is missing that the G Band app actually syncs:
1. `readDeviceManualData` — bulk spot-test pull (HR, SpO2, BP, temp, HRV, glucose, blood-component, stress, MET, emotion, fatigue, skin-conductance) — **single highest-value gap**.
2. `readSportModelOrigin` exercise sessions (head/GPS-head/item) — our wrapped `startReadExerciseData` historically didn't fire; verify it returns SportModelOriginHeadData/Item.
3. `readDetectBP` — stored blood-pressure history (we only do live BP).
4. `readBloodComponentCalibration` + `readMultipleCalibrationBGValue` (MealInfo) — calibration history.
5. Multi-lead ECG (`readMultiEcgData`).
6. Stored SpO2-origin & HRV-origin richer fields (apnea/hypoxia/respiration/cardiac-load/RR) — folded into origin by vendor; confirm our `readOriginData` exposes them.
7. `readProductionInfo` (device serial/model), `readSportControlInfo`.
8. Composite measurements: `startMiniCheckup`, `startDetectCuffBP`, `startDetectTcmDiagnosis`, PPG real-time/raw, RR/Lorenz.
