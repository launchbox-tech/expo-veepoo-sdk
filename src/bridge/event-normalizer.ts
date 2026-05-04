import type {
  ReadOriginProgress,
  VeepooEvent,
  VeepooEventPayload,
} from '../types/index.js';
import { isRecord, clamp } from '../normalizers/primitives.js';
import { normalizeBluetoothStatus, normalizePasswordData } from '../capabilities/session/normalizers.js';
import { normalizeAlarmList, normalizeHeartRateAlarm } from '../capabilities/alarms/normalizers.js';
import { normalizeBatteryInfo } from '../capabilities/battery/normalizers.js';
import { normalizeCameraShutterStatus } from '../capabilities/camera/normalizers.js';
import { normalizeContactList } from '../capabilities/contacts/normalizers.js';
import { normalizeDeviceBTState } from '../capabilities/bt-status/normalizers.js';
import { normalizeDeviceFunctions } from '../capabilities/device-functions/normalizers/index.js';
import { normalizeDeviceVersion } from '../capabilities/device-version/normalizers.js';
import { normalizeFindDeviceStatePayload } from '../capabilities/find-device/normalizers.js';
import { normalizeMusicRemoteCommand } from '../capabilities/music/normalizers.js';
import { normalizeSocialMsgData } from '../capabilities/social-msg/normalizers.js';
import { normalizeSosCallTimesSettings } from '../capabilities/sos/normalizers.js';
import {
  normalizeHalfHourData,
  normalizeOriginDataList,
  normalizeSpo2OriginData,
} from '../capabilities/origin-data/normalizers.js';
import { normalizeSleepDataList } from '../capabilities/sleep-data/normalizers.js';
import { normalizeSportStepData } from '../capabilities/sport-steps/normalizers.js';
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
} from '../capabilities/realtime-tests/normalizers.js';
import { normalizeFirmwareDfuProgress } from '../capabilities/dfu/normalizers.js';

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
  firmwareDfuProgress: (raw) => normalizeFirmwareDfuProgress(raw),
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
