/**
 * Single authoritative source of runtime event names for the Veepoo bridge.
 *
 * NATIVE_EMITTED_EVENTS  — subscribed via native addListener; must match iOS/Android declarations.
 * JS_LOCAL_ONLY_EVENTS   — emitted only via JS emitLocal; no native addListener call.
 *
 * `types/events.ts` has a compile-time check that VeepooEventPayload keys equal
 * ALL_VEEPOO_EVENTS elements — adding an event to one file without the other is a TS error.
 */

export const NATIVE_EMITTED_EVENTS = [
  "deviceFound",
  "deviceConnected",
  "deviceDisconnected",
  "deviceConnectStatus",
  "deviceReady",
  "bluetoothStateChanged",
  "deviceFunction",
  "deviceVersion",
  "passwordData",
  "socialMsgData",
  "readOriginProgress",
  "readOriginComplete",
  "originFiveMinuteData",
  "originHalfHourData",
  "sleepData",
  "sportStepData",
  "heartRateTestResult",
  "bloodPressureTestResult",
  "bloodOxygenTestResult",
  "temperatureTestResult",
  "stressData",
  "bloodGlucoseData",
  "hrvTestResult",
  "ecgTestResult",
  "fatigueTestResult",
  "breathingTestResult",
  "bodyCompositionTestResult",
  "batteryData",
  "connectionStatusChanged",
  "originSpo2Data",
  "alarmData",
  "findDeviceState",
  "firmwareDfuProgress",
  "contactsData",
  "sosCallTimesData",
  "cameraShutter",
  "musicRemoteCommand",
  "deviceBTStateChanged",
  "deviceSosTriggered",
  "customSettingsData",
  "healthRemindData",
  "apneaRemindData",
  "sportModeData",
  "bloodAnalysisTestResult",
  "gsrTestResult",
  "exerciseSessionData",
  "accurateSleepData",
  "storedTemperatureData",
  "storedBloodGlucoseData",
  "storedHrvData",
  "storedEcgData",
  "storedBodyCompositionData",
  "pttTestResult",
  "pttStateChanged",
  "error",
] as const;

export const JS_LOCAL_ONLY_EVENTS = [
  "heartRateAlarmData",
] as const;

export const ALL_VEEPOO_EVENTS = [
  ...NATIVE_EMITTED_EVENTS,
  ...JS_LOCAL_ONLY_EVENTS,
] as const;
