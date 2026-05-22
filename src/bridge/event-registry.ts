import type { LogScope, VeepooEvent, VeepooEventPayload } from "@/types/index";
import { deepSnakeKeys } from "@/shared/deep-keys";
import { isRecord } from "@/shared/primitives";
import {
  passthrough,
  wrapInner,
  type EventNormalizer,
} from "./event-envelope";

// ── Capability normalizers (functions only; events are declared below) ─────
import { normalizeAlarmList, normalizeHeartRateAlarm } from "@/capabilities/alarms/normalizers";
import { normalizeBatteryInfo } from "@/capabilities/battery";
import { normalizeDeviceBTState } from "@/capabilities/bt-status";
import { normalizeCameraShutterStatus } from "@/capabilities/camera";
import { normalizeContactList } from "@/capabilities/contacts/normalizers";
import { normalizeDeviceFunctions } from "@/capabilities/device-functions/normalizers/index";
import { normalizeDeviceVersion } from "@/capabilities/device-version";
import { normalizeFirmwareDfuProgress } from "@/capabilities/dfu";
import { normalizeFindDeviceStatePayload } from "@/capabilities/find-device";
import { normalizeMusicRemoteCommand } from "@/capabilities/music";
import {
  normalizeHalfHourData,
  normalizeOriginDataList,
  normalizeReadOriginProgressPayload,
  normalizeSpo2OriginData,
} from "@/capabilities/origin-data/normalizers";
import {
  normalizeBloodAnalysisTestResult,
  normalizeBloodGlucoseData,
  normalizeBloodOxygenTestResult,
  normalizeBloodPressureTestResult,
  normalizeBodyCompositionTestResult,
  normalizeBreathingTestResult,
  normalizeEcgTestResult,
  normalizeFatigueTestResult,
  normalizeGsrTestResult,
  normalizeHeartRateTestResult,
  normalizeHrvTestResult,
  normalizePttTestResult,
  normalizeStressData,
  normalizeTemperatureTestResult,
} from "@/capabilities/realtime-tests/normalizers";
import { normalizeBluetoothStatus, normalizePasswordData } from "@/capabilities/session/normalizers";
import { normalizeSleepDataList } from "@/capabilities/sleep-data/normalizers";
import { normalizeSocialMsgData } from "@/capabilities/social-msg";
import { normalizeSosCallTimesSettings } from "@/capabilities/sos";
import { normalizeSportStepData } from "@/capabilities/sport-steps";

// ── defineEvent helper ─────────────────────────────────────────────────────

/**
 * Declarative event metadata. One `EventDef` per JS event holds everything the
 * bridge needs: the JS name, the native emitter name (omitted for JS-local
 * events), the log scope used by the runtime debug logger, and the normalizer
 * that converts the raw native payload to the public {@link VeepooEventPayload}.
 *
 * `EVENT_DEFINITIONS` is the single source of truth — every other event table
 * (`NATIVE_EMITTED_EVENTS`, `NATIVE_TO_JS_EVENT_MAP`, `EVENT_LOG_SCOPES`,
 * `EVENT_NORMALIZERS`, `ALL_VEEPOO_EVENTS`, `JS_LOCAL_ONLY_EVENTS`,
 * `JS_EXPOSED_NATIVE_EVENTS`) is derived from it.
 */
export interface EventDef<K extends VeepooEvent> {
  readonly jsName: K;
  /** Native camelCase emitter name. Omit for JS-local-only events. */
  readonly nativeName?: string;
  readonly logScope: LogScope;
  readonly normalize: EventNormalizer<K>;
}

function defineEvent<K extends VeepooEvent>(def: EventDef<K>): EventDef<K> {
  return def;
}

function emptyPayload<K extends VeepooEvent>(): EventNormalizer<K> {
  return () => ({} as VeepooEventPayload[K]);
}

// ── Single source of truth ────────────────────────────────────────────────

export const EVENT_DEFINITIONS = {
  // ── scan / discovery ─────────────────────────────────────────────────
  device_found: defineEvent({
    jsName: "device_found",
    nativeName: "deviceFound",
    logScope: "scan",
    normalize: passthrough<"device_found">(),
  }),
  scan_started: defineEvent({
    jsName: "scan_started",
    logScope: "scan",
    normalize: emptyPayload<"scan_started">(),
  }),
  scan_stopped: defineEvent({
    jsName: "scan_stopped",
    logScope: "scan",
    normalize: emptyPayload<"scan_stopped">(),
  }),

  // ── bluetooth ────────────────────────────────────────────────────────
  bluetooth_state_changed: defineEvent({
    jsName: "bluetooth_state_changed",
    nativeName: "bluetoothStateChanged",
    logScope: "bluetooth",
    normalize: (raw) => {
      const p = isRecord(raw) ? raw : {};
      return normalizeBluetoothStatus(p) as VeepooEventPayload["bluetooth_state_changed"];
    },
  }),

  // ── connection / session ─────────────────────────────────────────────
  device_connected: defineEvent({
    jsName: "device_connected",
    nativeName: "deviceConnected",
    logScope: "connection",
    normalize: passthrough<"device_connected">(),
  }),
  device_disconnected: defineEvent({
    jsName: "device_disconnected",
    nativeName: "deviceDisconnected",
    logScope: "connection",
    normalize: passthrough<"device_disconnected">(),
  }),
  device_connect_status: defineEvent({
    jsName: "device_connect_status",
    nativeName: "deviceConnectStatus",
    logScope: "connection",
    normalize: passthrough<"device_connect_status">(),
  }),
  device_ready: defineEvent({
    jsName: "device_ready",
    nativeName: "deviceReady",
    logScope: "connection",
    normalize: passthrough<"device_ready">(),
  }),
  connection_status_changed: defineEvent({
    jsName: "connection_status_changed",
    nativeName: "connectionStatusChanged",
    logScope: "connection",
    normalize: passthrough<"connection_status_changed">(),
  }),
  password_data: defineEvent({
    jsName: "password_data",
    nativeName: "passwordData",
    logScope: "device",
    normalize: wrapInner("data", normalizePasswordData),
  }),

  // ── origin / historical reads ────────────────────────────────────────
  read_origin_progress: defineEvent({
    jsName: "read_origin_progress",
    nativeName: "readOriginProgress",
    logScope: "read",
    normalize: (raw) => normalizeReadOriginProgressPayload(raw),
  }),
  read_origin_complete: defineEvent({
    jsName: "read_origin_complete",
    nativeName: "readOriginComplete",
    logScope: "read",
    normalize: passthrough<"read_origin_complete">(),
  }),
  origin_five_minute_data: defineEvent({
    jsName: "origin_five_minute_data",
    nativeName: "originFiveMinuteData",
    logScope: "read",
    normalize: wrapInner("data", (raw) => normalizeOriginDataList([raw])[0]),
  }),
  origin_half_hour_data: defineEvent({
    jsName: "origin_half_hour_data",
    nativeName: "originHalfHourData",
    logScope: "read",
    normalize: wrapInner("data", normalizeHalfHourData),
  }),
  origin_spo2_data: defineEvent({
    jsName: "origin_spo2_data",
    nativeName: "originSpo2Data",
    logScope: "device",
    normalize: wrapInner("data", normalizeSpo2OriginData),
  }),
  sleep_data: defineEvent({
    jsName: "sleep_data",
    nativeName: "sleepData",
    logScope: "read",
    normalize: wrapInner("data", (raw) => normalizeSleepDataList(raw)[0]),
  }),
  accurate_sleep_data: defineEvent({
    jsName: "accurate_sleep_data",
    nativeName: "accurateSleepData",
    logScope: "device",
    normalize: passthrough<"accurate_sleep_data">(),
  }),
  sport_step_data: defineEvent({
    jsName: "sport_step_data",
    nativeName: "sportStepData",
    logScope: "read",
    normalize: wrapInner("data", normalizeSportStepData),
  }),
  exercise_session_data: defineEvent({
    jsName: "exercise_session_data",
    nativeName: "exerciseSessionData",
    logScope: "device",
    normalize: passthrough<"exercise_session_data">(),
  }),
  stored_temperature_data: defineEvent({
    jsName: "stored_temperature_data",
    nativeName: "storedTemperatureData",
    logScope: "device",
    normalize: passthrough<"stored_temperature_data">(),
  }),
  stored_blood_glucose_data: defineEvent({
    jsName: "stored_blood_glucose_data",
    nativeName: "storedBloodGlucoseData",
    logScope: "device",
    normalize: passthrough<"stored_blood_glucose_data">(),
  }),
  stored_hrv_data: defineEvent({
    jsName: "stored_hrv_data",
    nativeName: "storedHrvData",
    logScope: "device",
    normalize: passthrough<"stored_hrv_data">(),
  }),
  stored_ecg_data: defineEvent({
    jsName: "stored_ecg_data",
    nativeName: "storedEcgData",
    logScope: "device",
    normalize: passthrough<"stored_ecg_data">(),
  }),
  stored_body_composition_data: defineEvent({
    jsName: "stored_body_composition_data",
    nativeName: "storedBodyCompositionData",
    logScope: "device",
    normalize: passthrough<"stored_body_composition_data">(),
  }),

  // ── realtime tests ───────────────────────────────────────────────────
  heart_rate_test_result: defineEvent({
    jsName: "heart_rate_test_result",
    nativeName: "heartRateTestResult",
    logScope: "test",
    normalize: wrapInner("result", normalizeHeartRateTestResult),
  }),
  blood_pressure_test_result: defineEvent({
    jsName: "blood_pressure_test_result",
    nativeName: "bloodPressureTestResult",
    logScope: "test",
    normalize: wrapInner("result", normalizeBloodPressureTestResult),
  }),
  blood_oxygen_test_result: defineEvent({
    jsName: "blood_oxygen_test_result",
    nativeName: "bloodOxygenTestResult",
    logScope: "test",
    normalize: wrapInner("result", normalizeBloodOxygenTestResult),
  }),
  temperature_test_result: defineEvent({
    jsName: "temperature_test_result",
    nativeName: "temperatureTestResult",
    logScope: "test",
    normalize: wrapInner("result", normalizeTemperatureTestResult),
  }),
  stress_data: defineEvent({
    jsName: "stress_data",
    nativeName: "stressData",
    logScope: "test",
    normalize: wrapInner("data", normalizeStressData),
  }),
  blood_glucose_data: defineEvent({
    jsName: "blood_glucose_data",
    nativeName: "bloodGlucoseData",
    logScope: "test",
    normalize: wrapInner("data", normalizeBloodGlucoseData),
  }),
  hrv_test_result: defineEvent({
    jsName: "hrv_test_result",
    nativeName: "hrvTestResult",
    logScope: "test",
    normalize: wrapInner("result", normalizeHrvTestResult),
  }),
  ecg_test_result: defineEvent({
    jsName: "ecg_test_result",
    nativeName: "ecgTestResult",
    logScope: "test",
    normalize: wrapInner("result", normalizeEcgTestResult),
  }),
  fatigue_test_result: defineEvent({
    jsName: "fatigue_test_result",
    nativeName: "fatigueTestResult",
    logScope: "test",
    normalize: wrapInner("result", normalizeFatigueTestResult),
  }),
  breathing_test_result: defineEvent({
    jsName: "breathing_test_result",
    nativeName: "breathingTestResult",
    logScope: "test",
    normalize: wrapInner("result", normalizeBreathingTestResult),
  }),
  body_composition_test_result: defineEvent({
    jsName: "body_composition_test_result",
    nativeName: "bodyCompositionTestResult",
    logScope: "test",
    normalize: wrapInner("result", normalizeBodyCompositionTestResult),
  }),
  blood_analysis_test_result: defineEvent({
    jsName: "blood_analysis_test_result",
    nativeName: "bloodAnalysisTestResult",
    logScope: "device",
    normalize: wrapInner("result", normalizeBloodAnalysisTestResult),
  }),
  gsr_test_result: defineEvent({
    jsName: "gsr_test_result",
    nativeName: "gsrTestResult",
    logScope: "device",
    normalize: wrapInner("result", normalizeGsrTestResult),
  }),
  ptt_test_result: defineEvent({
    jsName: "ptt_test_result",
    nativeName: "pttTestResult",
    logScope: "device",
    normalize: wrapInner("result", normalizePttTestResult),
  }),
  ptt_state_changed: defineEvent({
    jsName: "ptt_state_changed",
    nativeName: "pttStateChanged",
    logScope: "device",
    normalize: passthrough<"ptt_state_changed">(),
  }),

  // ── alarms ───────────────────────────────────────────────────────────
  alarm_data: defineEvent({
    jsName: "alarm_data",
    nativeName: "alarmData",
    logScope: "device",
    normalize: wrapInner("alarms", normalizeAlarmList, { fallbackKey: "data" }),
  }),
  heart_rate_alarm_data: defineEvent({
    jsName: "heart_rate_alarm_data",
    logScope: "device",
    normalize: wrapInner("data", normalizeHeartRateAlarm),
  }),
  spo2_alarm_data: defineEvent({
    jsName: "spo2_alarm_data",
    logScope: "device",
    normalize: passthrough<"spo2_alarm_data">(),
  }),

  // ── device metadata / settings ───────────────────────────────────────
  battery_data: defineEvent({
    jsName: "battery_data",
    nativeName: "batteryData",
    logScope: "device",
    normalize: wrapInner("data", normalizeBatteryInfo),
  }),
  device_version: defineEvent({
    jsName: "device_version",
    nativeName: "deviceVersion",
    logScope: "device",
    normalize: wrapInner("version", normalizeDeviceVersion),
  }),
  device_function: defineEvent({
    jsName: "device_function",
    nativeName: "deviceFunction",
    logScope: "device",
    normalize: (raw) => {
      const p = isRecord(raw) ? raw : {};
      return {
        ...p,
        data: normalizeDeviceFunctions(p.data ?? p.functions),
        functions: normalizeDeviceFunctions(p.functions ?? p.data),
      } as VeepooEventPayload["device_function"];
    },
  }),
  device_bt_state_changed: defineEvent({
    jsName: "device_bt_state_changed",
    nativeName: "deviceBTStateChanged",
    logScope: "device",
    normalize: (raw) => {
      const p = isRecord(raw) ? raw : {};
      return {
        ...p,
        state: normalizeDeviceBTState(p.state ?? p.btState),
        bt_switch_open: (p.btSwitchOpen ?? p.bt_switch_open) === true,
        media_switch_open: (p.mediaSwitchOpen ?? p.media_switch_open) === true,
      } as VeepooEventPayload["device_bt_state_changed"];
    },
  }),
  device_switches_data: defineEvent({
    jsName: "device_switches_data",
    logScope: "device",
    normalize: passthrough<"device_switches_data">(),
  }),
  find_device_state: defineEvent({
    jsName: "find_device_state",
    nativeName: "findDeviceState",
    logScope: "device",
    normalize: (raw) => {
      const p = isRecord(raw) ? raw : {};
      return normalizeFindDeviceStatePayload(p) as VeepooEventPayload["find_device_state"];
    },
  }),
  firmware_dfu_progress: defineEvent({
    jsName: "firmware_dfu_progress",
    nativeName: "firmwareDfuProgress",
    logScope: "device",
    normalize: (raw) => normalizeFirmwareDfuProgress(raw),
  }),
  contacts_data: defineEvent({
    jsName: "contacts_data",
    nativeName: "contactsData",
    logScope: "device",
    normalize: wrapInner("contacts", normalizeContactList, { fallbackKey: "data" }),
  }),
  sos_call_times_data: defineEvent({
    jsName: "sos_call_times_data",
    nativeName: "sosCallTimesData",
    logScope: "device",
    normalize: wrapInner("data", normalizeSosCallTimesSettings),
  }),
  device_sos_triggered: defineEvent({
    jsName: "device_sos_triggered",
    nativeName: "deviceSosTriggered",
    logScope: "device",
    normalize: passthrough<"device_sos_triggered">(),
  }),
  camera_shutter: defineEvent({
    jsName: "camera_shutter",
    nativeName: "cameraShutter",
    logScope: "device",
    normalize: wrapInner("status", normalizeCameraShutterStatus),
  }),
  music_remote_command: defineEvent({
    jsName: "music_remote_command",
    nativeName: "musicRemoteCommand",
    logScope: "device",
    normalize: wrapInner("command", normalizeMusicRemoteCommand),
  }),
  social_msg_data: defineEvent({
    jsName: "social_msg_data",
    nativeName: "socialMsgData",
    logScope: "device",
    normalize: wrapInner("data", normalizeSocialMsgData),
  }),
  sport_mode_data: defineEvent({
    jsName: "sport_mode_data",
    nativeName: "sportModeData",
    logScope: "device",
    normalize: (raw) => {
      const p = isRecord(raw) ? raw : {};
      const rawMode = p.mode;
      // Native sends camelCase e.g. "outdoorRun"; TypeScript SportMode is snake_case "outdoor_run"
      const mode =
        typeof rawMode === "string" && rawMode !== "" && rawMode !== "common"
          ? (rawMode.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`) as VeepooEventPayload["sport_mode_data"]["mode"])
          : null;
      return { ...p, mode } as VeepooEventPayload["sport_mode_data"];
    },
  }),

  // ── orphan payload types declared in types/events.ts ────────────────
  custom_settings_data: defineEvent({
    jsName: "custom_settings_data",
    nativeName: "customSettingsData",
    logScope: "device",
    normalize: passthrough<"custom_settings_data">(),
  }),
  health_remind_data: defineEvent({
    jsName: "health_remind_data",
    nativeName: "healthRemindData",
    logScope: "device",
    normalize: passthrough<"health_remind_data">(),
  }),
  apnea_remind_data: defineEvent({
    jsName: "apnea_remind_data",
    nativeName: "apneaRemindData",
    logScope: "device",
    normalize: passthrough<"apnea_remind_data">(),
  }),

  // ── SDK lifecycle ────────────────────────────────────────────────────
  error: defineEvent({
    jsName: "error",
    nativeName: "error",
    logScope: "sdk",
    normalize: passthrough<"error">(),
  }),
  sdk_initialized: defineEvent({
    jsName: "sdk_initialized",
    logScope: "sdk",
    normalize: emptyPayload<"sdk_initialized">(),
  }),
} as const satisfies { [K in VeepooEvent]: EventDef<K> };

// ── Derived tables ────────────────────────────────────────────────────────

type AllDefs = typeof EVENT_DEFINITIONS;
const allDefs = Object.values(EVENT_DEFINITIONS) as ReadonlyArray<AllDefs[keyof AllDefs]>;
const nativeDefs = allDefs.filter(
  (d): d is AllDefs[keyof AllDefs] & { nativeName: string } =>
    typeof d.nativeName === "string",
);

/** Native (camelCase) event names emitted by iOS/Android. */
export const NATIVE_EMITTED_EVENTS: readonly string[] = nativeDefs.map((d) => d.nativeName);

/** Maps each native camelCase event name to the snake_case name exposed to JS consumers. */
export const NATIVE_TO_JS_EVENT_MAP: Readonly<Record<string, VeepooEvent>> = Object.fromEntries(
  nativeDefs.map((d) => [d.nativeName, d.jsName]),
) as Record<string, VeepooEvent>;

/** Log scope per event — used when the runtime logs an `event.<name>` debug entry. */
export const EVENT_LOG_SCOPES: Readonly<Record<VeepooEvent, LogScope>> = Object.fromEntries(
  allDefs.map((d) => [d.jsName, d.logScope]),
) as Record<VeepooEvent, LogScope>;

/** Inner-payload normalizers, keyed by JS event name. */
export const EVENT_NORMALIZERS = Object.fromEntries(
  allDefs.map((d) => [d.jsName, d.normalize]),
) as { [K in VeepooEvent]: EventNormalizer<K> };

/** Events emitted from JS only (no native addListener call). */
export const JS_LOCAL_ONLY_EVENTS: readonly VeepooEvent[] = allDefs
  .filter((d) => d.nativeName === undefined)
  .map((d) => d.jsName);

/** JS event names sourced from native emitters. */
export const JS_EXPOSED_NATIVE_EVENTS: readonly VeepooEvent[] = nativeDefs.map((d) => d.jsName);

/** All JS event names (native-sourced + JS-local). */
export const ALL_VEEPOO_EVENTS: readonly VeepooEvent[] = allDefs.map((d) => d.jsName);

/**
 * Apply the per-event inner-payload normalizer declared in {@link EVENT_DEFINITIONS}
 * and then run `deepSnakeKeys` so consumers always see snake_case keys (ADR 0004).
 */
export function normalizeEventPayload<K extends VeepooEvent>(
  event: K,
  payload: unknown,
): VeepooEventPayload[K] {
  return deepSnakeKeys(EVENT_NORMALIZERS[event](payload)) as VeepooEventPayload[K];
}
