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
export type { DeviceVersion } from '@/capabilities/device-version';
export type { ChargeState, BatteryInfo } from '@/capabilities/battery';
export type { Sex, PersonalInfo } from '@/capabilities/personal-info';
export type { SocialMsgData } from '@/capabilities/social-msg';
export type { DeviceAlarm, HeartRateAlarm, Spo2Alarm } from '@/capabilities/alarms/types';
export type { FindDevicePhase } from '@/capabilities/find-device';
export type {
  ScreenLightSettings,
  ScreenLightDuration,
} from '@/capabilities/screen-light/types';
export type { SedentaryReminderSettings } from '@/capabilities/sedentary-reminder';
export type { WristFlipWakeSettings } from '@/capabilities/wrist-flip';
export type {
  WomenHealthBabySex,
  WomenHealthSettings,
  WomenHealthStatus,
} from '@/capabilities/women-health/types';
export type {
  WatchFaceDialType,
  WatchFaceStyle,
  WatchFaceStyleSettings,
} from '@/capabilities/watch-face';
export type {
  WeatherUnit,
  WeatherSettings,
  WeatherHourlyForecast,
  WeatherDailyForecast,
  WeatherData,
} from '@/capabilities/weather/types';
export type { DeviceContact, NewDeviceContact } from '@/capabilities/contacts/types';
export type { SosCallTimesSettings } from '@/capabilities/sos';
export type { CameraShutterStatus } from '@/capabilities/camera';
export type { MusicData, MusicRemoteCommand } from '@/capabilities/music';
export type { GPSAndTimezoneData } from '@/capabilities/gps-timezone';
export type { DeviceBTState, DeviceBTStatus } from '@/capabilities/bt-status';
export type { DeviceSwitchType, DeviceSwitches } from '@/capabilities/device-switches';

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
  HealthGlanceResult,
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
export type { SportStepData } from '@/capabilities/sport-steps';
export type { DaySummaryData } from '@/capabilities/day-summary';
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
  ExerciseReadProgress,
  ExerciseSession,
  StoredTemperatureData,
  StoredBloodGlucoseData,
  StoredHrvData,
  StoredEcgData,
  StoredBodyCompositionData,
} from '@/capabilities/historical-query';

export type { AutoMeasureSetting } from '@/capabilities/auto-measure';
export type { Language } from '@/capabilities/language';
export type { SportMode, SportModeStatus } from '@/capabilities/sport-mode/types';
export { SPORT_MODE_ORDINALS } from '@/capabilities/sport-mode/types';
export type { BloodGlucoseRiskConfig } from '@/capabilities/calibration';
export type { WorldClockEntry } from '@/capabilities/world-clock';
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

export type { VeepooErrorCode, VeepooError, LogLevel, LogScope, LogEntry, LogListener } from './errors';
