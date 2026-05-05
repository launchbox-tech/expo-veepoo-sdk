import type { ALL_VEEPOO_EVENTS } from '@/bridge/veepoo-events-registry';
import type {
  VeepooDevice,
  ConnectionStatus,
  BluetoothStatus,
  PasswordData,
} from './connection';
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
} from './device';
import type { ApneaRemindSettings, CustomSettings, SportMode } from './settings';
import type {
  AccurateSleepSession,
  StoredTemperatureData,
  StoredBloodGlucoseData,
  StoredHrvData,
  StoredEcgData,
  StoredBodyCompositionData,
  BloodGlucoseData,
  ExerciseSession,
  HalfHourData,
  OriginData,
  SleepData,
  Spo2OriginData,
  SportStepData,
  StressData,
} from './health-data';
import type {
  BloodAnalysisTestResult,
  BloodOxygenTestResult,
  GsrTestResult,
  PttTestResult,
  PttState,
  BloodPressureTestResult,
  BodyCompositionTestResult,
  BreathingTestResult,
  EcgTestResult,
  FatigueTestResult,
  HeartRateTestResult,
  HrvTestResult,
  ReadOriginProgress,
  TemperatureTestResult,
} from './health-tests';
import type { VeepooError } from './errors';

/** Normalized DFU / OTA progress (`firmwareDfuProgress` event). */
export type FirmwareDfuState =
  | 'file_not_exist'
  | 'start'
  | 'updating'
  | 'success'
  | 'failure'
  | 'prepared'
  | 'reboot'
  | 'reconnecting'
  | 'dfu_lang_connect_success'
  | 'dfu_lang_connect_failed'
  | 'unknown';

export type FirmwareDfuProgress = {
  device_id: string;
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
    device_id: string;
    device_version?: string;
    device_number?: string;
    is_oad_model?: boolean;
  };
  deviceDisconnected: { device_id: string };
  deviceConnectStatus: {
    device_id: string;
    status: ConnectionStatus;
    code?: number;
  };
  deviceReady: { device_id: string; is_oad_model?: boolean };
  bluetoothStateChanged: BluetoothStatus;
  deviceFunction: {
    device_id: string;
    functions?: DeviceFunctions;
    data?: DeviceFunctions;
  };
  deviceVersion: { device_id: string; version: DeviceVersion };
  passwordData: { device_id: string; data: PasswordData };
  socialMsgData: { device_id: string; data: SocialMsgData };
  readOriginProgress: { device_id: string; progress: ReadOriginProgress };
  readOriginComplete: { device_id: string; success: boolean };
  originFiveMinuteData: { device_id: string; data: OriginData };
  originHalfHourData: { device_id: string; data: HalfHourData };
  sleepData: { device_id: string; date: string; data: SleepData };
  sportStepData: { device_id: string; date: string; data: SportStepData };
  heartRateTestResult: { device_id: string; result: HeartRateTestResult };
  bloodPressureTestResult: {
    device_id: string;
    result: BloodPressureTestResult;
  };
  bloodOxygenTestResult: { device_id: string; result: BloodOxygenTestResult };
  temperatureTestResult: { device_id: string; result: TemperatureTestResult };
  stressData: { device_id: string; data: StressData };
  bloodGlucoseData: { device_id: string; data: BloodGlucoseData };
  hrvTestResult: { device_id: string; result: HrvTestResult };
  ecgTestResult: { device_id: string; result: EcgTestResult };
  fatigueTestResult: { device_id: string; result: FatigueTestResult };
  breathingTestResult: { device_id: string; result: BreathingTestResult };
  bodyCompositionTestResult: { device_id: string; result: BodyCompositionTestResult };
  batteryData: { device_id: string; data: BatteryInfo };
  connectionStatusChanged: { device_id: string; status: ConnectionStatus };
  originSpo2Data: { device_id: string; data: Spo2OriginData };
  alarmData: { device_id: string; alarms: DeviceAlarm[] };
  heartRateAlarmData: { device_id: string; data: HeartRateAlarm };
  findDeviceState: {
    device_id: string;
    phase: FindDevicePhase;
    raw_state?: number;
  };
  firmwareDfuProgress: FirmwareDfuProgress;
  contactsData: { device_id: string; contacts: DeviceContact[] };
  sosCallTimesData: { device_id: string; data: SosCallTimesSettings };
  /** Fired when the Band triggers a camera photo action. Cross-platform. */
  cameraShutter: { device_id: string; status: CameraShutterStatus };
  /** Fired when the Band sends a music remote command. Android only. */
  musicRemoteCommand: { device_id: string; command: MusicRemoteCommand };
  /** Fired when the Band's classic BT state changes. */
  deviceBTStateChanged: {
    device_id: string;
    state: DeviceBTState;
    bt_switch_open: boolean;
    media_switch_open: boolean;
  };
  /** Fired when the Band triggers its hardware SOS button. iOS only — no vendor Android callback documented. */
  deviceSosTriggered: { device_id: string };
  customSettingsData: { device_id: string; data: CustomSettings };
  healthRemindData: { device_id: string; data: HealthReminder };
  /** iOS only — emitted on read response. Android vendor has no equivalent. */
  apneaRemindData: { device_id: string; data: ApneaRemindSettings };
  /** Fired when the Band finishes/stops a sport session. Android: SportModelStateData; iOS: deviceSportDidFinishBlock. */
  sportModeData: { device_id: string; mode: SportMode | null };
  bloodAnalysisTestResult: { device_id: string; result: BloodAnalysisTestResult };
  /** GSR (Galvanic Skin Response) test. Android only — iOS rejects CAPABILITY_UNSUPPORTED. */
  gsrTestResult: { device_id: string; result: GsrTestResult };
  /** Emitted once per session as exercise history syncs from Band. */
  exerciseSessionData: { device_id: string; session: ExerciseSession };
  /** Emitted per accurate sleep session (one per night). Gate: sleepType > 0 (iOS) / isSupportPreciseSleep (Android). */
  accurateSleepData: { device_id: string; date: string; data: AccurateSleepSession };
  /** Emitted per stored temperature record. Prerequisite: call startReadOriginData first. */
  storedTemperatureData: { device_id: string; data: StoredTemperatureData };
  /** Emitted per stored blood glucose record. Prerequisite: call startReadOriginData first. */
  storedBloodGlucoseData: { device_id: string; data: StoredBloodGlucoseData };
  /** Emitted per stored HRV record. Prerequisite: call startReadOriginData first. */
  storedHrvData: { device_id: string; data: StoredHrvData };
  /** Emitted per stored offline ECG record. Prerequisite: call startReadOriginData first. */
  storedEcgData: { device_id: string; data: StoredEcgData };
  /** Emitted per stored body composition record. Prerequisite: call startReadOriginData first. */
  storedBodyCompositionData: { device_id: string; data: StoredBodyCompositionData };
  /** Fired on each PTT measurement update. iOS only. */
  pttTestResult: { device_id: string; result: PttTestResult };
  /** Fired when device autonomously enters or exits PTT mode. iOS only. */
  pttStateChanged: { device_id: string; state: PttState };
  error: VeepooError;
  sdkInitialized: Record<never, never>;
  scanStarted: Record<never, never>;
  scanStopped: Record<never, never>;
};

export type VeepooEvent = keyof VeepooEventPayload;

// Compile-time parity check: VeepooEventPayload keys must exactly match ALL_VEEPOO_EVENTS.
// Adding an event to one without the other produces a TypeScript error here.
type _RegistryParity = [keyof VeepooEventPayload] extends [(typeof ALL_VEEPOO_EVENTS)[number]]
  ? [(typeof ALL_VEEPOO_EVENTS)[number]] extends [keyof VeepooEventPayload]
    ? true
    : never
  : never;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
declare const _: _RegistryParity;
