import type { NativeVeepooSDKInterface } from "../NativeVeepooSDK.js";

/** Async native module methods (Expo `AsyncFunction`), excluding event subscription helpers. */
export type NativeAsyncMethodName = Exclude<
  keyof NativeVeepooSDKInterface,
  "addListener" | "removeListeners"
>;

/**
 * Single source of truth for native async method names. Keep in sync with
 * `NativeVeepooSDKInterface` — TypeScript enforces each entry is a valid key.
 * When adding an `AsyncFunction` on iOS/Android, append here and update native typings.
 */
export const NATIVE_ASYNC_METHOD_NAMES = [
  "init",
  "isBluetoothEnabled",
  "requestPermissions",
  "startScan",
  "stopScan",
  "connect",
  "disconnect",
  "getConnectionStatus",
  "verifyPassword",
  "readBattery",
  "syncPersonalInfo",
  "readDeviceFunctions",
  "readSocialMsgData",
  "writeSocialMsgData",
  "readDeviceVersion",
  "startReadOriginData",
  "readDeviceAllData",
  "readSleepData",
  "readSportStepData",
  "readOriginData",
  "readDaySummaryData",
  "readAutoMeasureSetting",
  "modifyAutoMeasureSetting",
  "setLanguage",
  "startHeartRateTest",
  "stopHeartRateTest",
  "startBloodPressureTest",
  "stopBloodPressureTest",
  "startBloodOxygenTest",
  "stopBloodOxygenTest",
  "startTemperatureTest",
  "stopTemperatureTest",
  "startStressTest",
  "stopStressTest",
  "startBloodGlucoseTest",
  "stopBloodGlucoseTest",
  "startHrvTest",
  "stopHrvTest",
  "startEcgTest",
  "stopEcgTest",
  "startFatigueTest",
  "stopFatigueTest",
  "startBreathingTest",
  "stopBreathingTest",
  "setDeviceTime",
  "readAlarms",
  "setAlarm",
  "deleteAlarm",
  "readHeartRateAlarm",
  "setHeartRateAlarm",
  "startFindDevice",
  "stopFindDevice",
  "readScreenLightSettings",
  "setScreenLightSettings",
  "readScreenLightDuration",
  "setScreenLightDuration",
  "readSedentaryReminder",
  "setSedentaryReminder",
  "readWristFlipWakeSettings",
  "setWristFlipWakeSettings",
  "startLocalFirmwareDfu",
  "readWatchFaceStyle",
  "setWatchFaceStyle",
] as const satisfies readonly NativeAsyncMethodName[];

export type NativeAsyncRegistryUnion =
  (typeof NATIVE_ASYNC_METHOD_NAMES)[number];

/** Tuple-wrapped `extends` so the registry must match `NativeVeepooSDKInterface` async keys exactly. */
type _RegistryExhaustive = [NativeAsyncMethodName] extends [NativeAsyncRegistryUnion]
  ? [NativeAsyncRegistryUnion] extends [NativeAsyncMethodName]
    ? true
    : never
  : never;

export const NATIVE_ASYNC_REGISTRY_INTEGRITY: _RegistryExhaustive = true;
