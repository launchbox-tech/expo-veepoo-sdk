# Native API Audit

Date: 2026-03-27

## Scope

Audit target:

- JS native interface: `src/NativeVeepooSDK.ts`
- iOS native implementation: `ios/VeepooSDK/**`
- Android native implementation: `android/src/main/kotlin/expo/modules/veepoo/**`
- Vendor docs:
  - `docs/VeepooSDK Android Api.md`
  - `docs/VeepooSDK iOS Api.md`

Audit goals:

1. Check whether every JS-exposed native API is implemented on both iOS and Android.
2. Check whether each implemented API returns all important SDK data fields from vendor docs.
3. Check whether payload shape and semantics are consistent across platforms.

---

## Executive Summary

### Result

- JS exposed native methods: **35**
- Missing on iOS: **0**
- Missing on Android: **0**

### Key conclusion

All currently exposed JS native methods are implemented on both platforms, **but many of them are not full SDK-field mappings**. Several APIs only return simplified business-friendly payloads rather than the complete vendor SDK data structures.

### Main issue categories

1. **Implemented but partial mapping**
   - `verifyPassword`
   - `readDeviceFunctions`
   - `readSocialMsgData`
   - `readSportStepData`
   - `readOriginData`
   - `readDaySummaryData`
   - `readSleepData`
   - `readDeviceVersion`

2. **Cross-platform payload inconsistency**
   - `sleepData` event payload
   - `readOriginProgress` semantics
   - measurement/test result states

3. **Type definitions lagging native payload reality**
   - `TestState`
   - several event result payloads include extra states/fields not covered by `src/types.ts`

4. **Vendor SDK capabilities not yet wrapped**
   - many advanced day-select/by-setting/manual-data/calibration APIs are still unwrapped

---

## Method Coverage Audit

### A. Fully implemented at method level

The following JS-exposed methods exist on both platforms:

- `init`
- `isBluetoothEnabled`
- `requestPermissions`
- `startScan`
- `stopScan`
- `connect`
- `disconnect`
- `getConnectionStatus`
- `verifyPassword`
- `readBattery`
- `syncPersonalInfo`
- `readDeviceFunctions`
- `readSocialMsgData`
- `readDeviceVersion`
- `startReadOriginData`
- `readDeviceAllData`
- `readSleepData`
- `readSportStepData`
- `readOriginData`
- `readDaySummaryData`
- `readAutoMeasureSetting`
- `modifyAutoMeasureSetting`
- `setLanguage`
- `startHeartRateTest`
- `stopHeartRateTest`
- `startBloodPressureTest`
- `stopBloodPressureTest`
- `startBloodOxygenTest`
- `stopBloodOxygenTest`
- `startTemperatureTest`
- `stopTemperatureTest`
- `startStressTest`
- `stopStressTest`
- `startBloodGlucoseTest`
- `stopBloodGlucoseTest`

---

## Detailed Audit Checklist

Legend:

- **Coverage**
  - Complete: both platforms implemented and field mapping close to vendor SDK
  - Partial: implemented, but missing important fields / semantics differ
- **Priority**
  - P0: contract bug / high risk inconsistency
  - P1: important missing fields / compatibility risk
  - P2: enhancement

### 1. `verifyPassword`

- Coverage: **Partial**
- Priority: **P1**

#### Problems

- Vendor `PwdData` includes more fields than current wrapper returns.
- Missing fields:
  - `deviceTestVersion`
  - `isHaveDrinkData`
  - `isOpenNightTurnWriste`
  - `findPhoneFunction`
  - `wearDetectFunction`

#### References

- Android doc: `docs/VeepooSDK Android Api.md:203-235`
- Android impl: `android/src/main/kotlin/expo/modules/veepoo/VeepooSDKModuleConnection.kt`
- iOS impl: `ios/VeepooSDK/VeepooSDK.swift`, `ios/VeepooSDK/VeepooSDKModule+ConnectionHelpers.swift`

#### Recommendation

- Extend `PasswordData` in `src/types.ts`
- Return all documented `PwdData` fields on both platforms

---

### 2. `readDeviceFunctions`

- Coverage: **Partial**
- Priority: **P1**

#### Problems

- Current mapping only exposes a small subset of `FunctionDeviceSupportData`.
- Important fields missing:
  - drink / longseat / weather / countDown / agps / lowPower / textAlarm / watchday / originProtocolVersion / etc.
- Android currently hardcodes several capabilities as unsupported.
- iOS currently constructs only 3 partial packages.

#### References

- Android doc: `docs/VeepooSDK Android Api.md:258-313`
- Android impl:
  - `android/src/main/kotlin/expo/modules/veepoo/VeepooSDKModuleHelpers.kt`
  - `android/src/main/kotlin/expo/modules/veepoo/VeepooSDKModuleConnection.kt`
- iOS impl: `ios/VeepooSDK/VeepooSDKModule+ReadHelpers.swift`

#### Recommendation

- Build a more complete `DeviceFunctions` schema
- Include `watchday` directly in typed payload

---

### 3. `readSocialMsgData`

- Coverage: **Partial**
- Priority: **P1**

#### Problems

- Vendor social message structure includes many channels not exposed by current wrapper.
- Missing examples:
  - `sina`
  - `flickr`
  - `snapchat`
  - `dingding`
  - `wxWork`
  - `tikTok`
  - `telegram`
  - `connected2_me`
  - `kakaoTalk`
  - `messenger`
  - `shieldPolice`
- iOS mapping appears simplified from raw ANCS bytes and is not full parity with Android/vendor model.
- iOS currently maps `email` using SMS slot fallback, which is likely not accurate.

#### References

- Android doc: `docs/VeepooSDK Android Api.md:4098-4126`
- Android impl: `android/src/main/kotlin/expo/modules/veepoo/VeepooSDKModuleReadData.kt`
- iOS impl: `ios/VeepooSDK/VeepooSDKModule+ReadHelpers.swift`

#### Recommendation

- Expand `SocialMsgData`
- Re-audit exact iOS byte index mapping before exposing more fields

---

### 4. `readBattery`

- Coverage: **Partial**
- Priority: **P2**

#### Problems

- Wrapper returns battery basics, but does not fully normalize charge state into the TS `ChargeState` field.
- TS type already has optional `chargeState`, but native payload currently does not populate it.

#### References

- Android doc: `docs/VeepooSDK Android Api.md:605-615`
- iOS doc: `docs/VeepooSDK iOS Api.md:199-226`
- Android impl: `android/src/main/kotlin/expo/modules/veepoo/VeepooSDKModuleReadData.kt`
- iOS impl: `ios/VeepooSDK/VeepooSDK.swift`

#### Recommendation

- Populate normalized `chargeState`

---

### 5. `readDeviceVersion`

- Coverage: **Partial**
- Priority: **P1**

#### Problems

- Current unified shape does not match actual vendor data sources well.
- Android only fills:
  - `hardwareVersion <- cachedDeviceVersion`
  - `deviceNumber`
- iOS only fills:
  - `hardwareVersion <- deviceVersion`
  - `newVersion <- deviceNetVersion`
  - `description <- deviceNetVersionDes`
- `firmwareVersion` and `softwareVersion` are currently placeholder empty strings.

#### References

- Android doc: `docs/VeepooSDK Android Api.md:223-231`, `:7877-7895`
- iOS doc: `docs/VeepooSDK iOS Api.md:2682-2744`
- Android impl: `android/src/main/kotlin/expo/modules/veepoo/VeepooSDKModuleReadData.kt:216-240`
- iOS impl: `ios/VeepooSDK/VeepooSDK.swift:524-548`

#### Recommendation

- Redesign version DTO around actual vendor semantics:
  - displayVersion
  - testVersion
  - networkVersion
  - networkDescription

---

### 6. `readSleepData`

- Coverage: **Partial**
- Priority: **P0**

#### Problems

- Wrapper returns a normalized summary shape, not the full vendor sleep structures.
- iOS accurate sleep model contains many more fields not exposed.
- Android `SleepData` raw fields also not fully exposed.
- Event payload inconsistency:
  - iOS `sleepData.data` is an object
  - Android `sleepData.data` is an array

#### References

- Android doc:
  - `docs/VeepooSDK Android Api.md:696-710`
  - `docs/VeepooSDK Android Api.md:2780-2793`
- iOS doc:
  - `docs/VeepooSDK iOS Api.md:1676-1715`
  - `docs/VeepooSDK iOS Api.md:1736-1765`
- Android impl: `android/src/main/kotlin/expo/modules/veepoo/VeepooSDKModuleReadData.kt`
- iOS impl: `ios/VeepooSDK/VeepooSDKModule+Handlers.swift`

#### Recommendation

- First fix event contract inconsistency
- Then decide whether to expose:
  - normalized sleep DTO only
  - or normalized DTO + raw vendor extension fields

---

### 7. `readSportStepData`

- Coverage: **Partial**
- Priority: **P2**

#### Problems

- Wrapper only returns:
  - stepCount
  - distance
  - calories
- Vendor Android `SportData` also has:
  - `calcType`
  - `triaxialX`
  - `triaxialY`
  - `triaxialZ`

#### References

- Android doc: `docs/VeepooSDK Android Api.md:550-559`
- Android impl: `android/src/main/kotlin/expo/modules/veepoo/VeepooSDKModuleReadData.kt`
- iOS impl: `ios/VeepooSDK/VeepooSDKModule+Handlers.swift`

#### Recommendation

- Add optional advanced fields if needed

---

### 8. `readOriginData`

- Coverage: **Partial**
- Priority: **P0**

#### Problems

- Current payload is a simplified record, not full `OriginData` from vendor docs.
- Missing examples:
  - `date`
  - `allPackage`
  - `packageNumber`
  - `wear`
  - `calcType`
  - `tempOne/tempTwo`
  - `baseTemperature`
  - `drankPartOne`
  - additional risk/extension fields
- Missing `date/dayOffset` in exported result makes multi-day flows harder.

#### References

- Android doc: `docs/VeepooSDK Android Api.md:711-733`
- Android impl: `android/src/main/kotlin/expo/modules/veepoo/VeepooSDKModuleReadData.kt`
- iOS impl: `ios/VeepooSDK/VeepooSDKModule+Handlers.swift`

#### Recommendation

- Add `date`
- Add packet metadata
- Decide whether to expose a raw origin DTO separately from normalized DTO

---

### 9. `originFiveMinuteData` / `originHalfHourData`

- Coverage: **Partial**
- Priority: **P0**

#### Problems

- Event payloads do not include `date` or `dayOffset`.
- `originHalfHourData` is currently flattened and does not expose raw `OriginHalfHourData` structure.
- Multi-day sync consumers cannot reliably identify which day an event belongs to using `time` alone.

#### References

- Android doc: `docs/VeepooSDK Android Api.md:734-760`
- Android impl: `android/src/main/kotlin/expo/modules/veepoo/VeepooSDKModuleReadData.kt`
- iOS impl: `ios/VeepooSDK/VeepooSDKModule+ReadHelpers.swift`

#### Recommendation

- Add `date`
- Add `dayOffset`
- Keep normalized fields but include enough day identity metadata

---

### 10. `readDaySummaryData`

- Coverage: **Partial**
- Priority: **P1**

#### Problems

- This is a derived DTO, not a direct SDK structure.
- Fine as product API, but should be documented as synthesized summary rather than raw vendor data.

#### Recommendation

- Keep API
- Document clearly as normalized/derived data

---

### 11. `readOriginProgress` / `readOriginComplete`

- Coverage: **Partial**
- Priority: **P0**

#### Problems

- This area had cross-platform semantic mismatch and iOS overflow bug.
- Some fixes have already been applied:
  - iOS progress > 1 fixed
  - JS clamp added
  - Android progress semantics improved
- Remaining concern:
  - event naming and semantics still mixed with old API naming

#### Recommendation

- Keep old events for compatibility
- Introduce new canonical event names later:
  - `historySyncProgress`
  - `historySyncComplete`

---

### 12. Measurement / Test APIs

- Coverage: **Partial**
- Priority: **P0**

Affected:

- `heartRateTestResult`
- `bloodPressureTestResult`
- `bloodOxygenTestResult`
- `temperatureTestResult`
- `stressData`
- `bloodGlucoseData`

#### Problems

- `src/types.ts` `TestState` is too narrow.
- Native layers emit additional states, e.g.:
  - `testFail`
  - `testInterrupt`
  - `noFunction`
  - `calibration`
  - `invalid`
  - `unsupported`
  - `lowPower`
  - `complete`
- Android and iOS include extra fields not reflected in types, e.g.:
  - `isHaveProgress`
  - `deviceState`
  - `status`
  - `isEnd`

#### References

- TS type: `src/types.ts:373-427`
- iOS impl: `ios/VeepooSDK/VeepooSDKModule+Handlers.swift`
- Android impl: `android/src/main/kotlin/expo/modules/veepoo/VeepooSDKModuleTests.kt`

#### Recommendation

- Redesign test result union types
- Normalize status vocabulary across platforms

---

### 13. `setLanguage`

- Coverage: **Partial**
- Priority: **P1**

#### Problems

- iOS language map is missing `finnish` while vendor docs list language code 33.
- Android already supports `finnish`.

#### References

- iOS doc: `docs/VeepooSDK iOS Api.md:343-350`
- iOS impl: `ios/VeepooSDK/VeepooSDK.swift:662-669`
- Android impl: `android/src/main/kotlin/expo/modules/veepoo/VeepooSDKModuleWriteData.kt:46-49`

#### Recommendation

- Add `finnish` to iOS mapping

---

## Unwrapped Vendor Capabilities

These are examples of documented SDK capabilities not currently exposed through JS:

### Android examples

- `readAllHealthDataBySettingOrigin(...)`
- `readSleepDataFromDay(...)`
- `readSleepDataSingleDay(...)`
- `readOriginDataFromDay(...)`
- `readOriginDataBySetting(...)`
- `readSportModelOrigin(...)`
- blood glucose adjusting / multiple adjusting APIs

### iOS examples

- blood glucose personal/multi-personal calibration APIs
- more settings APIs
- more raw data / extended capability APIs
- dial / OTA / advanced transfer APIs

---

## Recommended Fix Order

### P0

1. Unify event contract shapes:
   - `sleepData`
   - `originFiveMinuteData`
   - `originHalfHourData`
   - measurement result states
2. Ensure `readOriginData` and sync events include `date/dayOffset`
3. Align test result TS types with native payload reality

### P1

4. Expand `verifyPassword`
5. Expand `readDeviceFunctions`
6. Expand `readSocialMsgData`
7. Fix iOS `setLanguage` missing `finnish`
8. Rework `readDeviceVersion` schema

### P2

9. Add richer step/battery details
10. Decide whether to expose raw vendor DTOs alongside normalized DTOs

---

## Final Assessment

### What is true now

- The current JS API surface is fully implemented on both platforms.

### What is not true now

- The wrapper does **not** return all vendor SDK fields for many important APIs.
- The wrapper does **not** cover all documented vendor SDK capabilities.
- Some native payloads still differ across platforms.

