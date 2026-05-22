import type { LogScope, VeepooEvent } from "@/types/index";

/**
 * Single authoritative source of runtime event names for the Veepoo bridge.
 *
 * NATIVE_EMITTED_EVENTS  — subscribed via native addListener; must match iOS/Android declarations.
 * NATIVE_TO_JS_EVENT_MAP — maps each native camelCase name to the snake_case name exposed to JS.
 * JS_LOCAL_ONLY_EVENTS   — emitted only via JS emitLocal; no native addListener call.
 * EVENT_LOG_SCOPES       — log scope per event (used by the runtime when logging incoming events).
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

/** Maps each native camelCase event name to the snake_case name exposed to JS consumers. */
export const NATIVE_TO_JS_EVENT_MAP = {
  deviceFound:                 "device_found",
  deviceConnected:             "device_connected",
  deviceDisconnected:          "device_disconnected",
  deviceConnectStatus:         "device_connect_status",
  deviceReady:                 "device_ready",
  bluetoothStateChanged:       "bluetooth_state_changed",
  deviceFunction:              "device_function",
  deviceVersion:               "device_version",
  passwordData:                "password_data",
  socialMsgData:               "social_msg_data",
  readOriginProgress:          "read_origin_progress",
  readOriginComplete:          "read_origin_complete",
  originFiveMinuteData:        "origin_five_minute_data",
  originHalfHourData:          "origin_half_hour_data",
  sleepData:                   "sleep_data",
  sportStepData:               "sport_step_data",
  heartRateTestResult:         "heart_rate_test_result",
  bloodPressureTestResult:     "blood_pressure_test_result",
  bloodOxygenTestResult:       "blood_oxygen_test_result",
  temperatureTestResult:       "temperature_test_result",
  stressData:                  "stress_data",
  bloodGlucoseData:            "blood_glucose_data",
  hrvTestResult:               "hrv_test_result",
  ecgTestResult:               "ecg_test_result",
  fatigueTestResult:           "fatigue_test_result",
  breathingTestResult:         "breathing_test_result",
  bodyCompositionTestResult:   "body_composition_test_result",
  batteryData:                 "battery_data",
  connectionStatusChanged:     "connection_status_changed",
  originSpo2Data:              "origin_spo2_data",
  alarmData:                   "alarm_data",
  findDeviceState:             "find_device_state",
  firmwareDfuProgress:         "firmware_dfu_progress",
  contactsData:                "contacts_data",
  sosCallTimesData:            "sos_call_times_data",
  cameraShutter:               "camera_shutter",
  musicRemoteCommand:          "music_remote_command",
  deviceBTStateChanged:        "device_bt_state_changed",
  deviceSosTriggered:          "device_sos_triggered",
  customSettingsData:          "custom_settings_data",
  healthRemindData:            "health_remind_data",
  apneaRemindData:             "apnea_remind_data",
  sportModeData:               "sport_mode_data",
  bloodAnalysisTestResult:     "blood_analysis_test_result",
  gsrTestResult:               "gsr_test_result",
  exerciseSessionData:         "exercise_session_data",
  accurateSleepData:           "accurate_sleep_data",
  storedTemperatureData:       "stored_temperature_data",
  storedBloodGlucoseData:      "stored_blood_glucose_data",
  storedHrvData:               "stored_hrv_data",
  storedEcgData:               "stored_ecg_data",
  storedBodyCompositionData:   "stored_body_composition_data",
  pttTestResult:               "ptt_test_result",
  pttStateChanged:             "ptt_state_changed",
  error:                       "error",
} as const satisfies Record<(typeof NATIVE_EMITTED_EVENTS)[number], string>;

export const JS_LOCAL_ONLY_EVENTS = [
  "heart_rate_alarm_data",
  "spo2_alarm_data",
  "device_switches_data",
  "sdk_initialized",
  "scan_started",
  "scan_stopped",
] as const;

export const JS_EXPOSED_NATIVE_EVENTS = Object.values(NATIVE_TO_JS_EVENT_MAP) as readonly string[] as readonly (typeof NATIVE_TO_JS_EVENT_MAP[keyof typeof NATIVE_TO_JS_EVENT_MAP])[];

export const ALL_VEEPOO_EVENTS = [
  ...JS_EXPOSED_NATIVE_EVENTS,
  ...JS_LOCAL_ONLY_EVENTS,
] as const;

/**
 * Log scope per event — used by VeepooSDKRuntime.log when emitting an
 * `event.<name>` debug entry. Each `VeepooEvent` is listed exactly once
 * so adding a new event without a scope is a TypeScript error.
 */
export const EVENT_LOG_SCOPES = {
  // ── scan ────────────────────────────────────────────────────────────
  device_found: "scan",
  scan_started: "scan",
  scan_stopped: "scan",

  // ── bluetooth ───────────────────────────────────────────────────────
  bluetooth_state_changed: "bluetooth",

  // ── connection ──────────────────────────────────────────────────────
  device_connected: "connection",
  device_disconnected: "connection",
  device_connect_status: "connection",
  device_ready: "connection",
  connection_status_changed: "connection",

  // ── read (history / origin / sleep / steps) ─────────────────────────
  read_origin_progress: "read",
  read_origin_complete: "read",
  origin_five_minute_data: "read",
  origin_half_hour_data: "read",
  sleep_data: "read",
  sport_step_data: "read",

  // ── realtime tests ──────────────────────────────────────────────────
  heart_rate_test_result: "test",
  blood_pressure_test_result: "test",
  blood_oxygen_test_result: "test",
  temperature_test_result: "test",
  stress_data: "test",
  blood_glucose_data: "test",
  hrv_test_result: "test",
  ecg_test_result: "test",
  fatigue_test_result: "test",
  breathing_test_result: "test",
  body_composition_test_result: "test",

  // ── sdk ─────────────────────────────────────────────────────────────
  error: "sdk",
  sdk_initialized: "sdk",

  // ── device (default bucket for the rest) ────────────────────────────
  device_function: "device",
  device_version: "device",
  password_data: "device",
  social_msg_data: "device",
  battery_data: "device",
  origin_spo2_data: "device",
  alarm_data: "device",
  find_device_state: "device",
  firmware_dfu_progress: "device",
  contacts_data: "device",
  sos_call_times_data: "device",
  camera_shutter: "device",
  music_remote_command: "device",
  device_bt_state_changed: "device",
  device_sos_triggered: "device",
  custom_settings_data: "device",
  health_remind_data: "device",
  apnea_remind_data: "device",
  sport_mode_data: "device",
  blood_analysis_test_result: "device",
  gsr_test_result: "device",
  exercise_session_data: "device",
  accurate_sleep_data: "device",
  stored_temperature_data: "device",
  stored_blood_glucose_data: "device",
  stored_hrv_data: "device",
  stored_ecg_data: "device",
  stored_body_composition_data: "device",
  ptt_test_result: "device",
  ptt_state_changed: "device",
  heart_rate_alarm_data: "device",
  spo2_alarm_data: "device",
  device_switches_data: "device",
} as const satisfies Record<VeepooEvent, LogScope>;
