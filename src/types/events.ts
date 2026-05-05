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

/** Normalized DFU / OTA progress (`firmware_dfu_progress` event). */
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
  device_found: { device: VeepooDevice; timestamp: number };
  device_connected: {
    device_id: string;
    device_version?: string;
    device_number?: string;
    is_oad_model?: boolean;
  };
  device_disconnected: { device_id: string };
  device_connect_status: {
    device_id: string;
    status: ConnectionStatus;
    code?: number;
  };
  device_ready: { device_id: string; is_oad_model?: boolean };
  bluetooth_state_changed: BluetoothStatus;
  device_function: {
    device_id: string;
    functions?: DeviceFunctions;
    data?: DeviceFunctions;
  };
  device_version: { device_id: string; version: DeviceVersion };
  password_data: { device_id: string; data: PasswordData };
  social_msg_data: { device_id: string; data: SocialMsgData };
  read_origin_progress: { device_id: string; progress: ReadOriginProgress };
  read_origin_complete: { device_id: string; success: boolean };
  origin_five_minute_data: { device_id: string; data: OriginData };
  origin_half_hour_data: { device_id: string; data: HalfHourData };
  sleep_data: { device_id: string; date: string; data: SleepData };
  sport_step_data: { device_id: string; date: string; data: SportStepData };
  heart_rate_test_result: { device_id: string; result: HeartRateTestResult };
  blood_pressure_test_result: {
    device_id: string;
    result: BloodPressureTestResult;
  };
  blood_oxygen_test_result: { device_id: string; result: BloodOxygenTestResult };
  temperature_test_result: { device_id: string; result: TemperatureTestResult };
  stress_data: { device_id: string; data: StressData };
  blood_glucose_data: { device_id: string; data: BloodGlucoseData };
  hrv_test_result: { device_id: string; result: HrvTestResult };
  ecg_test_result: { device_id: string; result: EcgTestResult };
  fatigue_test_result: { device_id: string; result: FatigueTestResult };
  breathing_test_result: { device_id: string; result: BreathingTestResult };
  body_composition_test_result: { device_id: string; result: BodyCompositionTestResult };
  battery_data: { device_id: string; data: BatteryInfo };
  connection_status_changed: { device_id: string; status: ConnectionStatus };
  origin_spo2_data: { device_id: string; data: Spo2OriginData };
  alarm_data: { device_id: string; alarms: DeviceAlarm[] };
  heart_rate_alarm_data: { device_id: string; data: HeartRateAlarm };
  find_device_state: {
    device_id: string;
    phase: FindDevicePhase;
    raw_state?: number;
  };
  firmware_dfu_progress: FirmwareDfuProgress;
  contacts_data: { device_id: string; contacts: DeviceContact[] };
  sos_call_times_data: { device_id: string; data: SosCallTimesSettings };
  /** Fired when the Band triggers a camera photo action. Cross-platform. */
  camera_shutter: { device_id: string; status: CameraShutterStatus };
  /** Fired when the Band sends a music remote command. Android only. */
  music_remote_command: { device_id: string; command: MusicRemoteCommand };
  /** Fired when the Band's classic BT state changes. */
  device_bt_state_changed: {
    device_id: string;
    state: DeviceBTState;
    bt_switch_open: boolean;
    media_switch_open: boolean;
  };
  /** Fired when the Band triggers its hardware SOS button. iOS only — no vendor Android callback documented. */
  device_sos_triggered: { device_id: string };
  custom_settings_data: { device_id: string; data: CustomSettings };
  health_remind_data: { device_id: string; data: HealthReminder };
  /** iOS only — emitted on read response. Android vendor has no equivalent. */
  apnea_remind_data: { device_id: string; data: ApneaRemindSettings };
  /** Fired when the Band finishes/stops a sport session. Android: SportModelStateData; iOS: deviceSportDidFinishBlock. */
  sport_mode_data: { device_id: string; mode: SportMode | null };
  blood_analysis_test_result: { device_id: string; result: BloodAnalysisTestResult };
  /** GSR (Galvanic Skin Response) test. Android only — iOS rejects CAPABILITY_UNSUPPORTED. */
  gsr_test_result: { device_id: string; result: GsrTestResult };
  /** Emitted once per session as exercise history syncs from Band. */
  exercise_session_data: { device_id: string; session: ExerciseSession };
  /** Emitted per accurate sleep session (one per night). Gate: sleepType > 0 (iOS) / isSupportPreciseSleep (Android). */
  accurate_sleep_data: { device_id: string; date: string; data: AccurateSleepSession };
  /** Emitted per stored temperature record. Prerequisite: call startReadOriginData first. */
  stored_temperature_data: { device_id: string; data: StoredTemperatureData };
  /** Emitted per stored blood glucose record. Prerequisite: call startReadOriginData first. */
  stored_blood_glucose_data: { device_id: string; data: StoredBloodGlucoseData };
  /** Emitted per stored HRV record. Prerequisite: call startReadOriginData first. */
  stored_hrv_data: { device_id: string; data: StoredHrvData };
  /** Emitted per stored offline ECG record. Prerequisite: call startReadOriginData first. */
  stored_ecg_data: { device_id: string; data: StoredEcgData };
  /** Emitted per stored body composition record. Prerequisite: call startReadOriginData first. */
  stored_body_composition_data: { device_id: string; data: StoredBodyCompositionData };
  /** Fired on each PTT measurement update. iOS only. */
  ptt_test_result: { device_id: string; result: PttTestResult };
  /** Fired when device autonomously enters or exits PTT mode. iOS only. */
  ptt_state_changed: { device_id: string; state: PttState };
  error: VeepooError;
  sdk_initialized: Record<never, never>;
  scan_started: Record<never, never>;
  scan_stopped: Record<never, never>;
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
