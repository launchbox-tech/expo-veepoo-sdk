import type {
  ReadOriginProgress,
  VeepooEvent,
  VeepooEventPayload,
  FirmwareDfuState,
} from '../types/index.js';
import { isRecord, clamp, toInt, toStringValue } from './primitives.js';
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

export function normalizeFirmwareDfuProgressPayload(value: unknown): VeepooEventPayload['firmwareDfuProgress'] {
  const p = isRecord(value) ? value : {};
  const stateRaw = toStringValue(p.state, 'unknown');
  const state: FirmwareDfuState = (FIRMWARE_DFU_STATES as readonly string[]).includes(
    stateRaw
  )
    ? (stateRaw as FirmwareDfuState)
    : 'unknown';
  let message: string | undefined;
  if (p.message !== undefined && p.message !== null) {
    message = String(p.message);
  }
  const out: VeepooEventPayload['firmwareDfuProgress'] = {
    deviceId: toStringValue(p.deviceId) ?? '',
    progress: clamp(toInt(p.progress) ?? 0, 0, 100),
    state,
  };
  if (message !== undefined) {
    out.message = message;
  }
  return out;
}

export function normalizeReadOriginProgressPayload(value: unknown): VeepooEventPayload['readOriginProgress'] {
  if (!isRecord(value) || !isRecord(value.progress)) {
    return value as VeepooEventPayload['readOriginProgress'];
  }

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

  return { ...value, progress: normalized } as VeepooEventPayload['readOriginProgress'];
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
  deviceFound: (raw) => raw as VeepooEventPayload['deviceFound'],
  deviceConnected: (raw) => raw as VeepooEventPayload['deviceConnected'],
  deviceDisconnected: (raw) => raw as VeepooEventPayload['deviceDisconnected'],
  deviceConnectStatus: (raw) => raw as VeepooEventPayload['deviceConnectStatus'],
  deviceReady: (raw) => raw as VeepooEventPayload['deviceReady'],
  readOriginComplete: (raw) => raw as VeepooEventPayload['readOriginComplete'],
  connectionStatusChanged: (raw) => raw as VeepooEventPayload['connectionStatusChanged'],
  deviceSosTriggered: (raw) => raw as VeepooEventPayload['deviceSosTriggered'],
  customSettingsData: (raw) => raw as VeepooEventPayload['customSettingsData'],
  healthRemindData: (raw) => raw as VeepooEventPayload['healthRemindData'],
  apneaRemindData: (raw) => raw as VeepooEventPayload['apneaRemindData'],
  sportModeData: (raw) => raw as VeepooEventPayload['sportModeData'],
  bloodAnalysisTestResult: (raw) => raw as VeepooEventPayload['bloodAnalysisTestResult'],
  gsrTestResult: (raw) => raw as VeepooEventPayload['gsrTestResult'],
  exerciseSessionData: (raw) => raw as VeepooEventPayload['exerciseSessionData'],
  accurateSleepData: (raw) => raw as VeepooEventPayload['accurateSleepData'],
  storedTemperatureData: (raw) => raw as VeepooEventPayload['storedTemperatureData'],
  storedBloodGlucoseData: (raw) => raw as VeepooEventPayload['storedBloodGlucoseData'],
  storedHrvData: (raw) => raw as VeepooEventPayload['storedHrvData'],
  storedEcgData: (raw) => raw as VeepooEventPayload['storedEcgData'],
  storedBodyCompositionData: (raw) => raw as VeepooEventPayload['storedBodyCompositionData'],
  pttTestResult: (raw) => raw as VeepooEventPayload['pttTestResult'],
  pttStateChanged: (raw) => raw as VeepooEventPayload['pttStateChanged'],
  error: (raw) => raw as VeepooEventPayload['error'],

  // ── actively normalized ────────────────────────────────────────────────────
  bluetoothStateChanged: (raw) => {
    const p = isRecord(raw) ? raw : {};
    return normalizeBluetoothStatus(p) as VeepooEventPayload['bluetoothStateChanged'];
  },
  readOriginProgress: (raw) => normalizeReadOriginProgressPayload(raw),
  deviceFunction: (raw) => {
    const p = isRecord(raw) ? raw : {};
    return {
      ...p,
      data: normalizeDeviceFunctions(p.data ?? p.functions),
      functions: normalizeDeviceFunctions(p.functions ?? p.data),
    } as VeepooEventPayload['deviceFunction'];
  },
  deviceVersion: (raw) => {
    const p = isRecord(raw) ? raw : {};
    return { ...p, version: normalizeDeviceVersion(p.version) } as VeepooEventPayload['deviceVersion'];
  },
  passwordData: (raw) => {
    const p = isRecord(raw) ? raw : {};
    return { ...p, data: normalizePasswordData(p.data) } as VeepooEventPayload['passwordData'];
  },
  socialMsgData: (raw) => {
    const p = isRecord(raw) ? raw : {};
    return { ...p, data: normalizeSocialMsgData(p.data) } as VeepooEventPayload['socialMsgData'];
  },
  originFiveMinuteData: (raw) => {
    const p = isRecord(raw) ? raw : {};
    return { ...p, data: normalizeOriginDataList([p.data])[0] } as VeepooEventPayload['originFiveMinuteData'];
  },
  originHalfHourData: (raw) => {
    const p = isRecord(raw) ? raw : {};
    return { ...p, data: normalizeHalfHourData(p.data) } as VeepooEventPayload['originHalfHourData'];
  },
  sleepData: (raw) => {
    const p = isRecord(raw) ? raw : {};
    return { ...p, data: normalizeSleepDataList(p.data)[0] } as VeepooEventPayload['sleepData'];
  },
  sportStepData: (raw) => {
    const p = isRecord(raw) ? raw : {};
    return { ...p, data: normalizeSportStepData(p.data) } as VeepooEventPayload['sportStepData'];
  },
  heartRateTestResult: (raw) => {
    const p = isRecord(raw) ? raw : {};
    return { ...p, result: normalizeHeartRateTestResult(p.result) } as VeepooEventPayload['heartRateTestResult'];
  },
  bloodPressureTestResult: (raw) => {
    const p = isRecord(raw) ? raw : {};
    return { ...p, result: normalizeBloodPressureTestResult(p.result) } as VeepooEventPayload['bloodPressureTestResult'];
  },
  bloodOxygenTestResult: (raw) => {
    const p = isRecord(raw) ? raw : {};
    return { ...p, result: normalizeBloodOxygenTestResult(p.result) } as VeepooEventPayload['bloodOxygenTestResult'];
  },
  temperatureTestResult: (raw) => {
    const p = isRecord(raw) ? raw : {};
    return { ...p, result: normalizeTemperatureTestResult(p.result) } as VeepooEventPayload['temperatureTestResult'];
  },
  stressData: (raw) => {
    const p = isRecord(raw) ? raw : {};
    return { ...p, data: normalizeStressData(p.data) } as VeepooEventPayload['stressData'];
  },
  bloodGlucoseData: (raw) => {
    const p = isRecord(raw) ? raw : {};
    return { ...p, data: normalizeBloodGlucoseData(p.data) } as VeepooEventPayload['bloodGlucoseData'];
  },
  batteryData: (raw) => {
    const p = isRecord(raw) ? raw : {};
    return { ...p, data: normalizeBatteryInfo(p.data) } as VeepooEventPayload['batteryData'];
  },
  originSpo2Data: (raw) => {
    const p = isRecord(raw) ? raw : {};
    return { ...p, data: normalizeSpo2OriginData(p.data) } as VeepooEventPayload['originSpo2Data'];
  },
  alarmData: (raw) => {
    const p = isRecord(raw) ? raw : {};
    return { ...p, alarms: normalizeAlarmList(p.alarms ?? p.data) } as VeepooEventPayload['alarmData'];
  },
  heartRateAlarmData: (raw) => {
    const p = isRecord(raw) ? raw : {};
    return { ...p, data: normalizeHeartRateAlarm(p.data) } as VeepooEventPayload['heartRateAlarmData'];
  },
  contactsData: (raw) => {
    const p = isRecord(raw) ? raw : {};
    return { ...p, contacts: normalizeContactList(p.contacts ?? p.data) } as VeepooEventPayload['contactsData'];
  },
  sosCallTimesData: (raw) => {
    const p = isRecord(raw) ? raw : {};
    return { ...p, data: normalizeSosCallTimesSettings(p.data) } as VeepooEventPayload['sosCallTimesData'];
  },
  findDeviceState: (raw) => {
    const p = isRecord(raw) ? raw : {};
    return normalizeFindDeviceStatePayload(p);
  },
  firmwareDfuProgress: (raw) => normalizeFirmwareDfuProgressPayload(raw),
  cameraShutter: (raw) => {
    const p = isRecord(raw) ? raw : {};
    return { ...p, status: normalizeCameraShutterStatus(p.status) } as VeepooEventPayload['cameraShutter'];
  },
  musicRemoteCommand: (raw) => {
    const p = isRecord(raw) ? raw : {};
    return { ...p, command: normalizeMusicRemoteCommand(p.command) } as VeepooEventPayload['musicRemoteCommand'];
  },
  deviceBTStateChanged: (raw) => {
    const p = isRecord(raw) ? raw : {};
    return {
      ...p,
      state: normalizeDeviceBTState(p.state ?? p.btState),
      btSwitchOpen: p.btSwitchOpen === true,
      mediaSwitchOpen: p.mediaSwitchOpen === true,
    } as VeepooEventPayload['deviceBTStateChanged'];
  },
  hrvTestResult: (raw) => {
    const p = isRecord(raw) ? raw : {};
    return { ...p, result: normalizeHrvTestResult(p.result) } as VeepooEventPayload['hrvTestResult'];
  },
  ecgTestResult: (raw) => {
    const p = isRecord(raw) ? raw : {};
    return { ...p, result: normalizeEcgTestResult(p.result) } as VeepooEventPayload['ecgTestResult'];
  },
  fatigueTestResult: (raw) => {
    const p = isRecord(raw) ? raw : {};
    return { ...p, result: normalizeFatigueTestResult(p.result) } as VeepooEventPayload['fatigueTestResult'];
  },
  breathingTestResult: (raw) => {
    const p = isRecord(raw) ? raw : {};
    return { ...p, result: normalizeBreathingTestResult(p.result) } as VeepooEventPayload['breathingTestResult'];
  },
  bodyCompositionTestResult: (raw) => {
    const p = isRecord(raw) ? raw : {};
    return { ...p, result: normalizeBodyCompositionTestResult(p.result) } as VeepooEventPayload['bodyCompositionTestResult'];
  },
};

export function normalizeEventPayload<K extends VeepooEvent>(
  event: K,
  payload: unknown
): VeepooEventPayload[K] {
  return EVENT_NORMALIZERS[event](payload);
}
