import type {
  ReadOriginProgress,
  VeepooEvent,
  VeepooEventPayload,
} from '@/types/index';
import { isRecord, clamp } from '@/normalizers/primitives';
import { deepSnakeKeys } from '@/normalizers/deep-keys';
import { normalizeBluetoothStatus, normalizePasswordData } from '@/capabilities/session/normalizers';
import { normalizeAlarmList, normalizeHeartRateAlarm } from '@/capabilities/alarms/normalizers';
import { normalizeBatteryInfo } from '@/capabilities/battery/normalizers';
import { normalizeCameraShutterStatus } from '@/capabilities/camera/normalizers';
import { normalizeContactList } from '@/capabilities/contacts/normalizers';
import { normalizeDeviceBTState } from '@/capabilities/bt-status/normalizers';
import { normalizeDeviceFunctions } from '@/capabilities/device-functions/normalizers/index';
import { normalizeDeviceVersion } from '@/capabilities/device-version/normalizers';
import { normalizeFindDeviceStatePayload } from '@/capabilities/find-device/normalizers';
import { normalizeMusicRemoteCommand } from '@/capabilities/music/normalizers';
import { normalizeSocialMsgData } from '@/capabilities/social-msg/normalizers';
import { normalizeSosCallTimesSettings } from '@/capabilities/sos/normalizers';
import {
  normalizeHalfHourData,
  normalizeOriginDataList,
  normalizeSpo2OriginData,
} from '@/capabilities/origin-data/normalizers';
import { normalizeSleepDataList } from '@/capabilities/sleep-data/normalizers';
import { normalizeSportStepData } from '@/capabilities/sport-steps/normalizers';
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
} from '@/capabilities/realtime-tests/normalizers';
import { normalizeFirmwareDfuProgress } from '@/capabilities/dfu/normalizers';

// ── Envelope helpers ─────────────────────────────────────────────────────────
//
// Every native-emitted event arrives as an `event envelope` — a record with
// device/session-scoped keys (e.g. `deviceId`) plus a single `inner payload`
// field that holds the capability-specific value. The bridge owns envelope
// handling; capabilities own their inner-payload normalizers. See CONTEXT.md
// for the canonical definitions.

type EventNormalizer<K extends VeepooEvent> = (raw: unknown) => VeepooEventPayload[K];

/** Identity normalizer for events whose envelope needs no value-level rewriting. */
const passthrough = <K extends VeepooEvent>(): EventNormalizer<K> =>
  (raw) => raw as VeepooEventPayload[K];

/**
 * Spread the envelope, replace one inner-payload field with its normalized
 * shape. `fallbackKey` lets a few events tolerate native sending the inner
 * payload under either of two camelCase keys.
 */
function wrapInner<K extends VeepooEvent>(
  field: string,
  normalize: (raw: unknown) => unknown,
  options?: { fallbackKey?: string },
): EventNormalizer<K> {
  return (raw) => {
    const p = isRecord(raw) ? raw : {};
    const primary = (p as Record<string, unknown>)[field];
    const value =
      options?.fallbackKey !== undefined && primary === undefined
        ? (p as Record<string, unknown>)[options.fallbackKey]
        : primary;
    return { ...p, [field]: normalize(value) } as VeepooEventPayload[K];
  };
}

// ── Bespoke normalizers (kept inline for events with non-uniform envelopes) ──

export function normalizeReadOriginProgressPayload(value: unknown): VeepooEventPayload['read_origin_progress'] {
  if (!isRecord(value) || !isRecord(value.progress)) {
    return value as VeepooEventPayload['read_origin_progress'];
  }

  const progress = value.progress;
  const normalized: ReadOriginProgress = {
    read_state:
      typeof progress.readState === 'string'
        ? (progress.readState as ReadOriginProgress['read_state'])
        : 'idle',
    total_days:
      typeof progress.totalDays === 'number' && Number.isFinite(progress.totalDays)
        ? Math.max(1, Math.trunc(progress.totalDays))
        : 1,
    current_day:
      typeof progress.currentDay === 'number' && Number.isFinite(progress.currentDay)
        ? Math.max(1, Math.trunc(progress.currentDay))
        : 1,
    progress:
      typeof progress.progress === 'number' && Number.isFinite(progress.progress)
        ? Math.trunc(
            clamp(
              progress.progress <= 1 ? progress.progress * 100 : progress.progress,
              0,
              100
            )
          )
        : 0,
  };

  return { ...value, progress: normalized } as VeepooEventPayload['read_origin_progress'];
}

/**
 * Typed dispatch table — every `VeepooEvent` key must appear here, and each
 * entry's return type must satisfy `VeepooEventPayload[K]`.  TypeScript will
 * error at compile time if a key is missing or the return type is wrong.
 */
const EVENT_NORMALIZERS = {
  // ── pass-throughs ─────────────────────────────────────────────────────────
  device_found: passthrough<'device_found'>(),
  device_connected: passthrough<'device_connected'>(),
  device_disconnected: passthrough<'device_disconnected'>(),
  device_connect_status: passthrough<'device_connect_status'>(),
  device_ready: passthrough<'device_ready'>(),
  read_origin_complete: passthrough<'read_origin_complete'>(),
  connection_status_changed: passthrough<'connection_status_changed'>(),
  device_sos_triggered: passthrough<'device_sos_triggered'>(),
  custom_settings_data: passthrough<'custom_settings_data'>(),
  health_remind_data: passthrough<'health_remind_data'>(),
  apnea_remind_data: passthrough<'apnea_remind_data'>(),
  exercise_session_data: passthrough<'exercise_session_data'>(),
  accurate_sleep_data: passthrough<'accurate_sleep_data'>(),
  stored_temperature_data: passthrough<'stored_temperature_data'>(),
  stored_blood_glucose_data: passthrough<'stored_blood_glucose_data'>(),
  stored_hrv_data: passthrough<'stored_hrv_data'>(),
  stored_ecg_data: passthrough<'stored_ecg_data'>(),
  stored_body_composition_data: passthrough<'stored_body_composition_data'>(),
  ptt_state_changed: passthrough<'ptt_state_changed'>(),
  error: passthrough<'error'>(),
  spo2_alarm_data: passthrough<'spo2_alarm_data'>(),
  device_switches_data: passthrough<'device_switches_data'>(),

  // ── wrap-inner: envelope + one normalized inner-payload key ───────────────
  password_data: wrapInner('data', normalizePasswordData),
  social_msg_data: wrapInner('data', normalizeSocialMsgData),
  device_version: wrapInner('version', normalizeDeviceVersion),
  origin_five_minute_data: wrapInner('data', (raw) => normalizeOriginDataList([raw])[0]),
  origin_half_hour_data: wrapInner('data', normalizeHalfHourData),
  sleep_data: wrapInner('data', (raw) => normalizeSleepDataList(raw)[0]),
  sport_step_data: wrapInner('data', normalizeSportStepData),
  heart_rate_test_result: wrapInner('result', normalizeHeartRateTestResult),
  blood_pressure_test_result: wrapInner('result', normalizeBloodPressureTestResult),
  blood_oxygen_test_result: wrapInner('result', normalizeBloodOxygenTestResult),
  temperature_test_result: wrapInner('result', normalizeTemperatureTestResult),
  stress_data: wrapInner('data', normalizeStressData),
  blood_glucose_data: wrapInner('data', normalizeBloodGlucoseData),
  battery_data: wrapInner('data', normalizeBatteryInfo),
  origin_spo2_data: wrapInner('data', normalizeSpo2OriginData),
  alarm_data: wrapInner('alarms', normalizeAlarmList, { fallbackKey: 'data' }),
  heart_rate_alarm_data: wrapInner('data', normalizeHeartRateAlarm),
  contacts_data: wrapInner('contacts', normalizeContactList, { fallbackKey: 'data' }),
  sos_call_times_data: wrapInner('data', normalizeSosCallTimesSettings),
  camera_shutter: wrapInner('status', normalizeCameraShutterStatus),
  music_remote_command: wrapInner('command', normalizeMusicRemoteCommand),
  hrv_test_result: wrapInner('result', normalizeHrvTestResult),
  ecg_test_result: wrapInner('result', normalizeEcgTestResult),
  fatigue_test_result: wrapInner('result', normalizeFatigueTestResult),
  breathing_test_result: wrapInner('result', normalizeBreathingTestResult),
  body_composition_test_result: wrapInner('result', normalizeBodyCompositionTestResult),
  blood_analysis_test_result: wrapInner('result', normalizeBloodAnalysisTestResult),
  gsr_test_result: wrapInner('result', normalizeGsrTestResult),
  ptt_test_result: wrapInner('result', normalizePttTestResult),

  // ── bespoke (non-uniform envelopes) ───────────────────────────────────────
  read_origin_progress: (raw) => normalizeReadOriginProgressPayload(raw),
  firmware_dfu_progress: (raw) => normalizeFirmwareDfuProgress(raw),
  bluetooth_state_changed: (raw) => {
    const p = isRecord(raw) ? raw : {};
    return normalizeBluetoothStatus(p) as VeepooEventPayload['bluetooth_state_changed'];
  },
  find_device_state: (raw) => {
    const p = isRecord(raw) ? raw : {};
    return normalizeFindDeviceStatePayload(p);
  },
  device_function: (raw) => {
    const p = isRecord(raw) ? raw : {};
    return {
      ...p,
      data: normalizeDeviceFunctions(p.data ?? p.functions),
      functions: normalizeDeviceFunctions(p.functions ?? p.data),
    } as VeepooEventPayload['device_function'];
  },
  sport_mode_data: (raw) => {
    const p = isRecord(raw) ? raw : {};
    const rawMode = p.mode;
    // Native sends camelCase e.g. "outdoorRun"; TypeScript SportMode is snake_case "outdoor_run"
    const mode =
      typeof rawMode === 'string' && rawMode !== '' && rawMode !== 'common'
        ? (rawMode.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`) as VeepooEventPayload['sport_mode_data']['mode'])
        : null;
    return { ...p, mode } as VeepooEventPayload['sport_mode_data'];
  },
  device_bt_state_changed: (raw) => {
    const p = isRecord(raw) ? raw : {};
    return {
      ...p,
      state: normalizeDeviceBTState(p.state ?? p.btState),
      bt_switch_open: (p.btSwitchOpen ?? p.bt_switch_open) === true,
      media_switch_open: (p.mediaSwitchOpen ?? p.media_switch_open) === true,
    } as VeepooEventPayload['device_bt_state_changed'];
  },

  // ── JS-only events ────────────────────────────────────────────────────────
  sdk_initialized: () => ({} as VeepooEventPayload['sdk_initialized']),
  scan_started: () => ({} as VeepooEventPayload['scan_started']),
  scan_stopped: () => ({} as VeepooEventPayload['scan_stopped']),
} satisfies { [K in VeepooEvent]: EventNormalizer<K> };

export function normalizeEventPayload<K extends VeepooEvent>(
  event: K,
  payload: unknown
): VeepooEventPayload[K] {
  return deepSnakeKeys(EVENT_NORMALIZERS[event](payload)) as VeepooEventPayload[K];
}
