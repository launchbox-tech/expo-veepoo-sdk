import type {
  VeepooDevice,
  ConnectionStatus,
  BluetoothStatus,
  PasswordData,
} from './connection.js';
import type {
  BatteryInfo,
  CameraShutterStatus,
  DeviceAlarm,
  DeviceBTState,
  DeviceContact,
  DeviceFunctions,
  DeviceVersion,
  HeartRateAlarm,
  FindDevicePhase,
  HealthReminder,
  MusicRemoteCommand,
  SocialMsgData,
  SosCallTimesSettings,
} from './device.js';
import type { ApneaRemindSettings, CustomSettings } from './settings.js';
import type {
  BloodGlucoseData,
  HalfHourData,
  OriginData,
  SleepData,
  Spo2OriginData,
  SportStepData,
  StressData,
} from './health-data.js';
import type {
  BloodOxygenTestResult,
  BloodPressureTestResult,
  BodyCompositionTestResult,
  BreathingTestResult,
  EcgTestResult,
  FatigueTestResult,
  HeartRateTestResult,
  HrvTestResult,
  ReadOriginProgress,
  TemperatureTestResult,
} from './health-tests.js';
import type { VeepooError } from './errors.js';

/** Normalized DFU / OTA progress (`firmwareDfuProgress` event). */
export type FirmwareDfuState =
  | 'fileNotExist'
  | 'start'
  | 'updating'
  | 'success'
  | 'failure'
  | 'prepared'
  | 'reboot'
  | 'reconnecting'
  | 'dfuLangConnectSuccess'
  | 'dfuLangConnectFailed'
  | 'unknown';

export type FirmwareDfuProgress = {
  deviceId: string;
  /** 0–100 */
  progress: number;
  state: FirmwareDfuState;
  message?: string;
};

/**
 * Single source of truth for SDK events: each key is an event name, value is its listener payload.
 * {@link VeepooEvent} is `keyof VeepooEventPayload`.
 */
export type VeepooEventPayload = {
  deviceFound: { device: VeepooDevice; timestamp: number };
  deviceConnected: {
    deviceId: string;
    deviceVersion?: string;
    deviceNumber?: string;
    isOadModel?: boolean;
  };
  deviceDisconnected: { deviceId: string };
  deviceConnectStatus: {
    deviceId: string;
    status: ConnectionStatus;
    code?: number;
  };
  deviceReady: { deviceId: string; isOadModel?: boolean };
  bluetoothStateChanged: BluetoothStatus;
  deviceFunction: {
    deviceId: string;
    functions?: DeviceFunctions;
    data?: DeviceFunctions;
  };
  deviceVersion: { deviceId: string; version: DeviceVersion };
  passwordData: { deviceId: string; data: PasswordData };
  socialMsgData: { deviceId: string; data: SocialMsgData };
  readOriginProgress: { deviceId: string; progress: ReadOriginProgress };
  readOriginComplete: { deviceId: string; success: boolean };
  originFiveMinuteData: { deviceId: string; data: OriginData };
  originHalfHourData: { deviceId: string; data: HalfHourData };
  sleepData: { deviceId: string; date: string; data: SleepData };
  sportStepData: { deviceId: string; date: string; data: SportStepData };
  heartRateTestResult: { deviceId: string; result: HeartRateTestResult };
  bloodPressureTestResult: {
    deviceId: string;
    result: BloodPressureTestResult;
  };
  bloodOxygenTestResult: { deviceId: string; result: BloodOxygenTestResult };
  temperatureTestResult: { deviceId: string; result: TemperatureTestResult };
  stressData: { deviceId: string; data: StressData };
  bloodGlucoseData: { deviceId: string; data: BloodGlucoseData };
  hrvTestResult: { deviceId: string; result: HrvTestResult };
  ecgTestResult: { deviceId: string; result: EcgTestResult };
  fatigueTestResult: { deviceId: string; result: FatigueTestResult };
  breathingTestResult: { deviceId: string; result: BreathingTestResult };
  bodyCompositionTestResult: { deviceId: string; result: BodyCompositionTestResult };
  batteryData: { deviceId: string; data: BatteryInfo };
  connectionStatusChanged: { deviceId: string; status: ConnectionStatus };
  originSpo2Data: { deviceId: string; data: Spo2OriginData };
  alarmData: { deviceId: string; alarms: DeviceAlarm[] };
  heartRateAlarmData: { deviceId: string; data: HeartRateAlarm };
  findDeviceState: {
    deviceId: string;
    phase: FindDevicePhase;
    rawState?: number;
  };
  firmwareDfuProgress: FirmwareDfuProgress;
  contactsData: { deviceId: string; contacts: DeviceContact[] };
  sosCallTimesData: { deviceId: string; data: SosCallTimesSettings };
  /** Fired when the Band triggers a camera photo action. Cross-platform. */
  cameraShutter: { deviceId: string; status: CameraShutterStatus };
  /** Fired when the Band sends a music remote command. Android only. */
  musicRemoteCommand: { deviceId: string; command: MusicRemoteCommand };
  /** Fired when the Band's classic BT state changes. */
  deviceBTStateChanged: {
    deviceId: string;
    state: DeviceBTState;
    btSwitchOpen: boolean;
    mediaSwitchOpen: boolean;
  };
  /** Fired when the Band triggers its hardware SOS button. iOS only — no vendor Android callback documented. */
  deviceSosTriggered: { deviceId: string };
  customSettingsData: { deviceId: string; data: CustomSettings };
  healthRemindData: { deviceId: string; data: HealthReminder };
  /** iOS only — emitted on read response. Android vendor has no equivalent. */
  apneaRemindData: { deviceId: string; data: ApneaRemindSettings };
  error: VeepooError;
};

export type VeepooEvent = keyof VeepooEventPayload;