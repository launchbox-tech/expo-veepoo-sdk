export type {
  VeepooDevice,
  ConnectionStatus,
  ConnectionResult,
  ScanOptions,
  ScanResult,
  ConnectOptions,
  DeviceTimeSetting,
  BluetoothState,
  BluetoothAuthorization,
  PermissionStatus,
  PermissionsResult,
  BluetoothStatus,
  PasswordStatus,
  PasswordData,
} from './connection';

export type {
  FunctionStatus,
  DeviceFunctionPackage1,
  DeviceFunctionPackage2,
  DeviceFunctionPackage3,
  DeviceFunctionPackage4,
  DeviceFunctionPackage5,
  DeviceFunctions,
} from '@/capabilities/device-functions/types';
export type { DeviceVersion } from '@/capabilities/device-version/types';
export type { ChargeState, BatteryInfo } from '@/capabilities/battery/types';
export type { Sex, PersonalInfo } from '@/capabilities/personal-info/types';
export type { SocialMsgData } from '@/capabilities/social-msg/types';
export type { DeviceAlarm, HeartRateAlarm, Spo2Alarm } from '@/capabilities/alarms/types';
export type { FindDevicePhase } from '@/capabilities/find-device/types';
export type {
  ScreenLightSettings,
  ScreenLightDuration,
} from '@/capabilities/screen-light/types';
export type { SedentaryReminderSettings } from '@/capabilities/sedentary-reminder/types';
export type { WristFlipWakeSettings } from '@/capabilities/wrist-flip/types';
export type {
  WomenHealthBabySex,
  WomenHealthSettings,
  WomenHealthStatus,
} from '@/capabilities/women-health/types';
export type {
  WatchFaceDialType,
  WatchFaceStyle,
  WatchFaceStyleSettings,
} from '@/capabilities/watch-face/types';
export type {
  WeatherUnit,
  WeatherSettings,
  WeatherHourlyForecast,
  WeatherDailyForecast,
  WeatherData,
} from '@/capabilities/weather/types';
export type { DeviceContact, NewDeviceContact } from '@/capabilities/contacts/types';
export type { SosCallTimesSettings } from '@/capabilities/sos/types';
export type { CameraShutterStatus } from '@/capabilities/camera/types';
export type { MusicData, MusicRemoteCommand } from '@/capabilities/music/types';
export type { GPSAndTimezoneData } from '@/capabilities/gps-timezone/types';
export type { DeviceBTState, DeviceBTStatus } from '@/capabilities/bt-status/types';
export type { DeviceSwitchType, DeviceSwitches } from '@/capabilities/device-switches/types';

export type {
  TestState,
  HeartRateData,
  BloodPressureData,
  BloodOxygenData,
  TemperatureData,
  StressData,
  BloodGlucoseData,
  HeartRateTestResult,
  BloodPressureTestResult,
  BloodOxygenTestResult,
  TemperatureTestResult,
  BloodGlucoseTestResult,
  HrvTestResult,
  EcgTestOptions,
  EcgTestResult,
  FatigueTestResult,
  BreathingTestResult,
  BodyCompositionMetrics,
  BodyCompositionTestResult,
  BloodAnalysisValues,
  BloodAnalysisTestResult,
  GsrTestResult,
  PttState,
  PttTestResult,
  RealtimeTestModality,
} from '@/capabilities/realtime-tests/types';
export { RealtimeTest } from '@/capabilities/realtime-tests/types';
export type {
  SleepDataItem,
  SleepData,
  SleepMinuteState,
  SleepMinutePoint,
  AccurateSleepSession,
} from '@/capabilities/sleep-data/types';
export type { SportStepData } from '@/capabilities/sport-steps/types';
export type { DaySummaryData } from '@/capabilities/day-summary/types';
export type {
  OriginData,
  HalfHourData,
  Spo2OriginData,
  ReadState,
  ReadOriginProgress,
} from '@/capabilities/origin-data/types';
export type {
  DailyHealthData,
  ExerciseMinuteData,
  ExerciseSession,
  StoredTemperatureData,
  StoredBloodGlucoseData,
  StoredHrvData,
  StoredEcgData,
  StoredBodyCompositionData,
} from '@/capabilities/historical-query/types';

export type { AutoMeasureSetting } from '@/capabilities/auto-measure/types';
export type { Language } from '@/capabilities/language/types';
export type { SportMode, SportModeStatus } from '@/capabilities/sport-mode/types';
export { SPORT_MODE_ORDINALS } from '@/capabilities/sport-mode/types';
export type { BloodGlucoseRiskConfig } from '@/capabilities/calibration/types';
export type { WorldClockEntry } from '@/capabilities/world-clock/types';
export type {
  TemperatureUnit,
  DistanceUnit,
  TimeFormat,
  BloodGlucoseUnit,
  SkinTone,
  OperationStatus,
} from './settings';

export type {
  ApneaRemindSettings,
  CustomSettings,
  CustomSettingData,
  DeviceData,
  HealthReminder,
  HealthReminderType,
  VeepooEvent,
  VeepooEventPayload,
  FirmwareDfuState,
  FirmwareDfuProgress,
} from './events';

export type { VeepooErrorCode, VeepooError, LogLevel, LogScope, LogEntry } from './errors';
