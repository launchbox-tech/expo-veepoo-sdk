export {
  normalizePermissionsResult,
  normalizeBluetoothStatus,
  normalizePasswordData,
} from './connection.js';

export {
  normalizeAlarmList,
  normalizeBatteryInfo,
  normalizeDeviceFunctions,
  normalizeHeartRateAlarm,
  normalizeScreenLightDuration,
  normalizeScreenLightSettings,
  normalizeSedentaryReminderSettings,
  normalizeWristFlipWakeSettings,
  normalizeWomenHealthSettings,
  normalizeWatchFaceStyle,
  normalizeSocialMsgData,
  normalizeDeviceVersion,
} from './device.js';

export {
  normalizeSleepDataList,
  normalizeSportStepData,
  normalizeOriginDataList,
  normalizeHalfHourData,
  normalizeDaySummaryData,
  normalizeStressData,
  normalizeBloodGlucoseData,
  normalizeSpo2OriginData,
} from './health-data.js';

export {
  normalizeHeartRateTestResult,
  normalizeBloodPressureTestResult,
  normalizeBloodOxygenTestResult,
  normalizeTemperatureTestResult,
  normalizeHrvTestResult,
  normalizeEcgTestResult,
  normalizeFatigueTestResult,
  normalizeBreathingTestResult,
  normalizeBodyCompositionTestResult,
} from './health-tests.js';

export { normalizeAutoMeasureSettings } from './settings.js';

export { normalizeReadOriginProgressPayload, normalizeEventPayload } from './events.js';
