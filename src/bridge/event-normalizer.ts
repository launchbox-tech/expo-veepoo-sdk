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
  normalizeBloodGlucoseData,
  normalizeBloodOxygenTestResult,
  normalizeBloodPressureTestResult,
  normalizeBodyCompositionTestResult,
  normalizeBreathingTestResult,
  normalizeEcgTestResult,
  normalizeFatigueTestResult,
  normalizeHeartRateTestResult,
  normalizeHrvTestResult,
  normalizeStressData,
  normalizeTemperatureTestResult,
} from '@/capabilities/realtime-tests/normalizers';
import { normalizeFirmwareDfuProgress } from '@/capabilities/dfu/normalizers';

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
const EVENT_NORMALIZERS: {
  [K in VeepooEvent]: (raw: unknown) => VeepooEventPayload[K];
} = {
  // ── pass-throughs: no structural normalization needed ──────────────────────
  device_found: (raw) => raw as VeepooEventPayload['device_found'],
  device_connected: (raw) => raw as VeepooEventPayload['device_connected'],
  device_disconnected: (raw) => raw as VeepooEventPayload['device_disconnected'],
  device_connect_status: (raw) => raw as VeepooEventPayload['device_connect_status'],
  device_ready: (raw) => raw as VeepooEventPayload['device_ready'],
  read_origin_complete: (raw) => raw as VeepooEventPayload['read_origin_complete'],
  connection_status_changed: (raw) => raw as VeepooEventPayload['connection_status_changed'],
  device_sos_triggered: (raw) => raw as VeepooEventPayload['device_sos_triggered'],
  custom_settings_data: (raw) => raw as VeepooEventPayload['custom_settings_data'],
  health_remind_data: (raw) => raw as VeepooEventPayload['health_remind_data'],
  apnea_remind_data: (raw) => raw as VeepooEventPayload['apnea_remind_data'],
  sport_mode_data: (raw) => raw as VeepooEventPayload['sport_mode_data'],
  blood_analysis_test_result: (raw) => raw as VeepooEventPayload['blood_analysis_test_result'],
  gsr_test_result: (raw) => raw as VeepooEventPayload['gsr_test_result'],
  exercise_session_data: (raw) => raw as VeepooEventPayload['exercise_session_data'],
  accurate_sleep_data: (raw) => raw as VeepooEventPayload['accurate_sleep_data'],
  stored_temperature_data: (raw) => raw as VeepooEventPayload['stored_temperature_data'],
  stored_blood_glucose_data: (raw) => raw as VeepooEventPayload['stored_blood_glucose_data'],
  stored_hrv_data: (raw) => raw as VeepooEventPayload['stored_hrv_data'],
  stored_ecg_data: (raw) => raw as VeepooEventPayload['stored_ecg_data'],
  stored_body_composition_data: (raw) => raw as VeepooEventPayload['stored_body_composition_data'],
  ptt_test_result: (raw) => raw as VeepooEventPayload['ptt_test_result'],
  ptt_state_changed: (raw) => raw as VeepooEventPayload['ptt_state_changed'],
  error: (raw) => raw as VeepooEventPayload['error'],

  // ── actively normalized ────────────────────────────────────────────────────
  bluetooth_state_changed: (raw) => {
    const p = isRecord(raw) ? raw : {};
    return normalizeBluetoothStatus(p) as VeepooEventPayload['bluetooth_state_changed'];
  },
  read_origin_progress: (raw) => normalizeReadOriginProgressPayload(raw),
  device_function: (raw) => {
    const p = isRecord(raw) ? raw : {};
    return {
      ...p,
      data: normalizeDeviceFunctions(p.data ?? p.functions),
      functions: normalizeDeviceFunctions(p.functions ?? p.data),
    } as VeepooEventPayload['device_function'];
  },
  device_version: (raw) => {
    const p = isRecord(raw) ? raw : {};
    return { ...p, version: normalizeDeviceVersion(p.version) } as VeepooEventPayload['device_version'];
  },
  password_data: (raw) => {
    const p = isRecord(raw) ? raw : {};
    return { ...p, data: normalizePasswordData(p.data) } as VeepooEventPayload['password_data'];
  },
  social_msg_data: (raw) => {
    const p = isRecord(raw) ? raw : {};
    return { ...p, data: normalizeSocialMsgData(p.data) } as VeepooEventPayload['social_msg_data'];
  },
  origin_five_minute_data: (raw) => {
    const p = isRecord(raw) ? raw : {};
    return { ...p, data: normalizeOriginDataList([p.data])[0] } as VeepooEventPayload['origin_five_minute_data'];
  },
  origin_half_hour_data: (raw) => {
    const p = isRecord(raw) ? raw : {};
    return { ...p, data: normalizeHalfHourData(p.data) } as VeepooEventPayload['origin_half_hour_data'];
  },
  sleep_data: (raw) => {
    const p = isRecord(raw) ? raw : {};
    return { ...p, data: normalizeSleepDataList(p.data)[0] } as VeepooEventPayload['sleep_data'];
  },
  sport_step_data: (raw) => {
    const p = isRecord(raw) ? raw : {};
    return { ...p, data: normalizeSportStepData(p.data) } as VeepooEventPayload['sport_step_data'];
  },
  heart_rate_test_result: (raw) => {
    const p = isRecord(raw) ? raw : {};
    return { ...p, result: normalizeHeartRateTestResult(p.result) } as VeepooEventPayload['heart_rate_test_result'];
  },
  blood_pressure_test_result: (raw) => {
    const p = isRecord(raw) ? raw : {};
    return { ...p, result: normalizeBloodPressureTestResult(p.result) } as VeepooEventPayload['blood_pressure_test_result'];
  },
  blood_oxygen_test_result: (raw) => {
    const p = isRecord(raw) ? raw : {};
    return { ...p, result: normalizeBloodOxygenTestResult(p.result) } as VeepooEventPayload['blood_oxygen_test_result'];
  },
  temperature_test_result: (raw) => {
    const p = isRecord(raw) ? raw : {};
    return { ...p, result: normalizeTemperatureTestResult(p.result) } as VeepooEventPayload['temperature_test_result'];
  },
  stress_data: (raw) => {
    const p = isRecord(raw) ? raw : {};
    return { ...p, data: normalizeStressData(p.data) } as VeepooEventPayload['stress_data'];
  },
  blood_glucose_data: (raw) => {
    const p = isRecord(raw) ? raw : {};
    return { ...p, data: normalizeBloodGlucoseData(p.data) } as VeepooEventPayload['blood_glucose_data'];
  },
  battery_data: (raw) => {
    const p = isRecord(raw) ? raw : {};
    return { ...p, data: normalizeBatteryInfo(p.data) } as VeepooEventPayload['battery_data'];
  },
  origin_spo2_data: (raw) => {
    const p = isRecord(raw) ? raw : {};
    return { ...p, data: normalizeSpo2OriginData(p.data) } as VeepooEventPayload['origin_spo2_data'];
  },
  alarm_data: (raw) => {
    const p = isRecord(raw) ? raw : {};
    return { ...p, alarms: normalizeAlarmList(p.alarms ?? p.data) } as VeepooEventPayload['alarm_data'];
  },
  heart_rate_alarm_data: (raw) => {
    const p = isRecord(raw) ? raw : {};
    return { ...p, data: normalizeHeartRateAlarm(p.data) } as VeepooEventPayload['heart_rate_alarm_data'];
  },
  spo2_alarm_data: (raw) => raw as VeepooEventPayload['spo2_alarm_data'],
  device_switches_data: (raw) => raw as VeepooEventPayload['device_switches_data'],
  contacts_data: (raw) => {
    const p = isRecord(raw) ? raw : {};
    return { ...p, contacts: normalizeContactList(p.contacts ?? p.data) } as VeepooEventPayload['contacts_data'];
  },
  sos_call_times_data: (raw) => {
    const p = isRecord(raw) ? raw : {};
    return { ...p, data: normalizeSosCallTimesSettings(p.data) } as VeepooEventPayload['sos_call_times_data'];
  },
  find_device_state: (raw) => {
    const p = isRecord(raw) ? raw : {};
    return normalizeFindDeviceStatePayload(p);
  },
  firmware_dfu_progress: (raw) => normalizeFirmwareDfuProgress(raw),
  camera_shutter: (raw) => {
    const p = isRecord(raw) ? raw : {};
    return { ...p, status: normalizeCameraShutterStatus(p.status) } as VeepooEventPayload['camera_shutter'];
  },
  music_remote_command: (raw) => {
    const p = isRecord(raw) ? raw : {};
    return { ...p, command: normalizeMusicRemoteCommand(p.command) } as VeepooEventPayload['music_remote_command'];
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
  hrv_test_result: (raw) => {
    const p = isRecord(raw) ? raw : {};
    return { ...p, result: normalizeHrvTestResult(p.result) } as VeepooEventPayload['hrv_test_result'];
  },
  ecg_test_result: (raw) => {
    const p = isRecord(raw) ? raw : {};
    return { ...p, result: normalizeEcgTestResult(p.result) } as VeepooEventPayload['ecg_test_result'];
  },
  fatigue_test_result: (raw) => {
    const p = isRecord(raw) ? raw : {};
    return { ...p, result: normalizeFatigueTestResult(p.result) } as VeepooEventPayload['fatigue_test_result'];
  },
  breathing_test_result: (raw) => {
    const p = isRecord(raw) ? raw : {};
    return { ...p, result: normalizeBreathingTestResult(p.result) } as VeepooEventPayload['breathing_test_result'];
  },
  body_composition_test_result: (raw) => {
    const p = isRecord(raw) ? raw : {};
    return { ...p, result: normalizeBodyCompositionTestResult(p.result) } as VeepooEventPayload['body_composition_test_result'];
  },
  sdk_initialized: () => ({} as VeepooEventPayload['sdk_initialized']),
  scan_started: () => ({} as VeepooEventPayload['scan_started']),
  scan_stopped: () => ({} as VeepooEventPayload['scan_stopped']),
};

export function normalizeEventPayload<K extends VeepooEvent>(
  event: K,
  payload: unknown
): VeepooEventPayload[K] {
  return deepSnakeKeys(EVENT_NORMALIZERS[event](payload)) as VeepooEventPayload[K];
}
