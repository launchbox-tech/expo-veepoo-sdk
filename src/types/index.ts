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
} from './connection.js';

export type {
  FunctionStatus,
  DeviceFunctionPackage1,
  DeviceFunctionPackage2,
  DeviceFunctionPackage3,
  DeviceFunctionPackage4,
  DeviceFunctionPackage5,
  DeviceFunctions,
  DeviceVersion,
  ChargeState,
  BatteryInfo,
  Sex,
  PersonalInfo,
  SocialMsgData,
  CustomSettingData,
  DeviceAlarm,
  HeartRateAlarm,
  FindDevicePhase,
  ScreenLightSettings,
  ScreenLightDuration,
  DeviceData,
} from './device.js';

export type {
  HeartRateData,
  BloodPressureData,
  BloodOxygenData,
  TemperatureData,
  StressData,
  BloodGlucoseData,
  SleepDataItem,
  SleepData,
  DailyHealthData,
  SportStepData,
  DaySummaryData,
  OriginData,
  HalfHourData,
  Spo2OriginData,
} from './health-data.js';

export type {
  TestState,
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
  ReadState,
  ReadOriginProgress,
} from './health-tests.js';

export type {
  AutoMeasureSetting,
  Language,
  TemperatureUnit,
  DistanceUnit,
  TimeFormat,
  BloodGlucoseUnit,
  OperationStatus,
} from './settings.js';

export type { VeepooEvent, VeepooEventPayload } from './events.js';

export type { VeepooErrorCode, VeepooError, LogLevel, LogScope, LogEntry } from './errors.js';
