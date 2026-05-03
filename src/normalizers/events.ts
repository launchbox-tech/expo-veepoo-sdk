import type {
  ReadOriginProgress,
  VeepooEvent,
  FirmwareDfuState,
} from '../types/index.js';
import { isRecord, clamp, toInt, toStringValue } from './shared.js';
import { normalizeBluetoothStatus, normalizePasswordData } from './connection.js';
import {
  normalizeAlarmList,
  normalizeBatteryInfo,
  normalizeCameraShutterStatus,
  normalizeContactList,
  normalizeDeviceBTState,
  normalizeDeviceFunctions,
  normalizeDeviceVersion,
  normalizeHeartRateAlarm,
  normalizeFindDeviceStatePayload,
  normalizeMusicRemoteCommand,
  normalizeSocialMsgData,
  normalizeSosCallTimesSettings,
} from './device.js';
import {
  normalizeBloodGlucoseData,
  normalizeHalfHourData,
  normalizeOriginDataList,
  normalizeSleepDataList,
  normalizeSpo2OriginData,
  normalizeSportStepData,
  normalizeStressData,
} from './health-data.js';
import {
  normalizeBloodOxygenTestResult,
  normalizeBloodPressureTestResult,
  normalizeBodyCompositionTestResult,
  normalizeBreathingTestResult,
  normalizeEcgTestResult,
  normalizeFatigueTestResult,
  normalizeHeartRateTestResult,
  normalizeHrvTestResult,
  normalizeTemperatureTestResult,
} from './health-tests.js';

const FIRMWARE_DFU_STATES: readonly FirmwareDfuState[] = [
  'fileNotExist',
  'start',
  'updating',
  'success',
  'failure',
  'prepared',
  'reboot',
  'reconnecting',
  'dfuLangConnectSuccess',
  'dfuLangConnectFailed',
  'unknown',
];

export function normalizeFirmwareDfuProgressPayload(value: unknown): unknown {
  if (!isRecord(value)) return value;
  const stateRaw = toStringValue(value.state, 'unknown');
  const state: FirmwareDfuState = (FIRMWARE_DFU_STATES as readonly string[]).includes(
    stateRaw
  )
    ? (stateRaw as FirmwareDfuState)
    : 'unknown';
  let message: string | undefined;
  if (value.message !== undefined && value.message !== null) {
    message = String(value.message);
  }
  const out: Record<string, unknown> = {
    deviceId: toStringValue(value.deviceId),
    progress: clamp(toInt(value.progress), 0, 100),
    state,
  };
  if (message !== undefined) {
    out.message = message;
  }
  return out;
}

export function normalizeReadOriginProgressPayload(value: unknown): unknown {
  if (!isRecord(value) || !isRecord(value.progress)) return value;

  const progress = value.progress;
  const normalized: ReadOriginProgress = {
    readState:
      typeof progress.readState === 'string'
        ? (progress.readState as ReadOriginProgress['readState'])
        : 'idle',
    totalDays:
      typeof progress.totalDays === 'number' && Number.isFinite(progress.totalDays)
        ? Math.max(1, Math.trunc(progress.totalDays))
        : 1,
    currentDay:
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

  return { ...value, progress: normalized };
}

export function normalizeEventPayload(event: VeepooEvent, payload: unknown): unknown {
  if (typeof payload !== 'object' || payload === null) return payload;
  const p = payload as Record<string, unknown>;
  switch (event) {
    case 'bluetoothStateChanged':
      return normalizeBluetoothStatus(p);
    case 'readOriginProgress':
      return normalizeReadOriginProgressPayload(p);
    case 'deviceFunction':
      return {
        ...p,
        data: normalizeDeviceFunctions(p.data ?? p.functions),
        functions: normalizeDeviceFunctions(p.functions ?? p.data),
      };
    case 'deviceVersion':
      return { ...p, version: normalizeDeviceVersion(p.version) };
    case 'passwordData':
      return { ...p, data: normalizePasswordData(p.data) };
    case 'socialMsgData':
      return { ...p, data: normalizeSocialMsgData(p.data) };
    case 'originFiveMinuteData':
      return { ...p, data: normalizeOriginDataList([p.data])[0] };
    case 'originHalfHourData':
      return { ...p, data: normalizeHalfHourData(p.data) };
    case 'sleepData':
      return { ...p, data: normalizeSleepDataList(p.data)[0] };
    case 'sportStepData':
      return { ...p, data: normalizeSportStepData(p.data) };
    case 'heartRateTestResult':
      return { ...p, result: normalizeHeartRateTestResult(p.result) };
    case 'bloodPressureTestResult':
      return { ...p, result: normalizeBloodPressureTestResult(p.result) };
    case 'bloodOxygenTestResult':
      return { ...p, result: normalizeBloodOxygenTestResult(p.result) };
    case 'temperatureTestResult':
      return { ...p, result: normalizeTemperatureTestResult(p.result) };
    case 'stressData':
      return { ...p, data: normalizeStressData(p.data) };
    case 'bloodGlucoseData':
      return { ...p, data: normalizeBloodGlucoseData(p.data) };
    case 'batteryData':
      return { ...p, data: normalizeBatteryInfo(p.data) };
    case 'originSpo2Data':
      return { ...p, data: normalizeSpo2OriginData(p.data) };
    case 'alarmData':
      return { ...p, alarms: normalizeAlarmList(p.alarms ?? p.data) };
    case 'heartRateAlarmData':
      return { ...p, data: normalizeHeartRateAlarm(p.data) };
    case 'contactsData':
      return { ...p, contacts: normalizeContactList(p.contacts ?? p.data) };
    case 'sosCallTimesData':
      return { ...p, data: normalizeSosCallTimesSettings(p.data) };
    case 'findDeviceState':
      return normalizeFindDeviceStatePayload(p);
    case 'firmwareDfuProgress':
      return normalizeFirmwareDfuProgressPayload(p);
    case 'cameraShutter':
      return { ...p, status: normalizeCameraShutterStatus(p.status) };
    case 'musicRemoteCommand':
      return { ...p, command: normalizeMusicRemoteCommand(p.command) };
    case 'deviceBTStateChanged':
      return {
        ...p,
        state: normalizeDeviceBTState(p.state ?? p.btState),
        btSwitchOpen: p.btSwitchOpen === true,
        mediaSwitchOpen: p.mediaSwitchOpen === true,
      };
    case 'hrvTestResult':
      return { ...p, result: normalizeHrvTestResult(p.result) };
    case 'ecgTestResult':
      return { ...p, result: normalizeEcgTestResult(p.result) };
    case 'fatigueTestResult':
      return { ...p, result: normalizeFatigueTestResult(p.result) };
    case 'breathingTestResult':
      return { ...p, result: normalizeBreathingTestResult(p.result) };
    case 'bodyCompositionTestResult':
      return { ...p, result: normalizeBodyCompositionTestResult(p.result) };
    default:
      return payload;
  }
}
