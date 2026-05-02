# Vendor API parity matrix

Canonical inventory of **vendor Veepoo/HBand capability areas** versus **`VeepooSDK` JavaScript API** in this package. Use this before assuming a wiki-only API exists on the bridge.

**Upstream docs:** [Android wiki](https://github.com/HBandSDK/Android_Ble_SDK/wiki/VeepooSDK-Android-API-Document) · [iOS wiki](https://github.com/HBandSDK/iOS_Ble_SDK/wiki/VeepooSDK-iOS-API-Document) · Offline snapshots: [`VeepooSDK Android Api.md`](VeepooSDK%20Android%20Api.md), [`VeepooSDK iOS Api.md`](VeepooSDK%20iOS%20Api.md).

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
| Heart rate alarm thresholds | JS types + `heartRateAlarmData` event path; **no** `readHeartRateAlarm` / `setHeartRateAlarm` on `VeepooSDK` yet | Partial | TBD |

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
| HRV (manual realtime) | `startHrvTest`, `stopHrvTest`; `hrvTestResult` | Partial — Android shipped; **iOS** rejects `CAPABILITY_UNSUPPORTED` (see notes) | TBD |
| ECG (manual realtime) | `startEcgTest`, `stopEcgTest`; `ecgTestResult` (optional `includeWaveform`) | Shipped | TBD |
| Fatigue (manual realtime) | `startFatigueTest`, `stopFatigueTest`; `fatigueTestResult` | Shipped | TBD |
| Breathing rate (manual realtime) | `startBreathingTest`, `stopBreathingTest`; `breathingTestResult` | Partial — **iOS** shipped; **Android** rejects `CAPABILITY_UNSUPPORTED` until native path is wired | TBD |

### Further notes (realtime vitals, PRD #66)

- **Single active realtime test:** Starting any supported `start*Test` while another realtime test is active rejects with **`REALTIME_TEST_IN_PROGRESS`** ([issue #67](https://github.com/launchbox-tech/expo-veepoo-sdk/issues/67)). Eligibility errors may use **`DEVICE_NOT_READY`**, **`DEVICE_NOT_CONNECTED`**, or **`CAPABILITY_UNSUPPORTED`** ([`VeepooErrorCode`](../src/types/errors.ts) in source).
- **HRV:** Android uses the vendor manual-data path for HRV during the test loop. **iOS** does not expose a matching realtime HRV manual API in this bridge; `startHrvTest` fails fast with `CAPABILITY_UNSUPPORTED` — use historical HRV flows or Android for this modality.
- **ECG:** Summary-style fields are always emitted on `ecgTestResult`. **`startEcgTest({ includeWaveform: true })`** may populate `result.waveform` when the Band and native stack support it; payloads can be large.
- **Breathing:** **iOS** drives the vendor breathing-rate test. **Android** returns `CAPABILITY_UNSUPPORTED` in the current Kotlin bridge; extend native when the vendor API is bound.

---

## Logging & errors

| Vendor area (summary) | JS methods / events | Status | Device tested |
|----------------------|---------------------|--------|---------------|
| Structured logs | `setLogEnabled`, `isLogEnabled`, `setLogger` | Shipped | TBD |
| Unified errors | `error` event / `VeepooError` (native rejects mapped per ADR 0003; optional `nativeCode` when collapsed) | Shipped | TBD |

---

## Not exposed in JS (representative backlog)

Aligned with maintainer backlog — vendor wiki may document these while this package does **not** yet expose them on `VeepooSDK`:

- OTA / DFU (binaries present; no JS surface)  
- Watch faces / server dial transfer  
- Body composition, women’s health, weather push, contacts/SOS, AGPS, music/camera remote  
- Platform-specific extras (e.g. toggling OS Bluetooth from SDK)

Treat gaps as **Not in JS** until a PR adds methods **and** updates this matrix.

---

## Incremental updates

After merging a feature:

1. Edit the relevant row(s) in this file (**Status**, **Device tested** when known).  
2. Bump **`vendor-manifest.json`** if vendored files changed.  
3. Add **`docs/release-notes/`** entry for consuming apps.
