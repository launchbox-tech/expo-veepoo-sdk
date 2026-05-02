import type {
  AutoMeasureSetting,
  DeviceAlarm,
  FunctionStatus,
  HeartRateAlarm,
  ScreenLightSettings,
  SedentaryReminderSettings,
  SocialMsgData,
  WatchFaceDialType,
  WatchFaceStyleSettings,
  WomenHealthBabySex,
  WomenHealthSettings,
  WomenHealthStatus,
  WristFlipWakeSettings,
} from '../types/index.js';
import { requireInRange, requireValidHour, requireValidMinute } from './shared.js';

const VALID_FUNCTION_STATUSES = new Set<FunctionStatus>([
  'unsupported', 'support', 'open', 'close', 'unknown',
]);

export function validateSocialMsgData(data: Partial<SocialMsgData>): void {
  const keys = Object.keys(data);
  if (keys.length === 0) {
    throw { code: 'INVALID_ARGUMENT', message: 'data must contain at least one channel' };
  }
  for (const key of keys) {
    const value = (data as Record<string, unknown>)[key];
    if (!VALID_FUNCTION_STATUSES.has(value as FunctionStatus)) {
      throw { code: 'INVALID_ARGUMENT', message: `${key} must be a valid FunctionStatus` };
    }
  }
}

export function validateAutoMeasureSetting(setting: Partial<AutoMeasureSetting>): void {
  if (setting.measureInterval !== undefined) {
    requireInRange(setting.measureInterval, 'measureInterval', 1, 120);
  }
  if (setting.currentStartMinute !== undefined) {
    requireInRange(setting.currentStartMinute, 'currentStartMinute', 0, 1_439);
  }
  if (setting.currentEndMinute !== undefined) {
    requireInRange(setting.currentEndMinute, 'currentEndMinute', 0, 1_439);
  }
}

export function validateAlarm(alarm: DeviceAlarm): void {
  requireInRange(alarm.id, 'id', 1, 20);
  requireValidHour(alarm.hour, 'hour');
  requireValidMinute(alarm.minute, 'minute');
  for (const day of alarm.repeat) {
    requireInRange(day, 'repeat element', 1, 7);
  }
  if (alarm.scene !== undefined) {
    requireInRange(alarm.scene, 'scene', 0, 20);
  }
  if (alarm.text !== undefined) {
    if (new TextEncoder().encode(alarm.text).byteLength > 60) {
      throw { code: 'INVALID_ARGUMENT', message: 'text must not exceed 60 bytes' };
    }
  }
}

export function validateDeleteAlarm(alarmId: number): void {
  requireInRange(alarmId, 'alarmId', 1, 20);
}

export function validateHeartRateAlarm(alarm: HeartRateAlarm): void {
  requireInRange(alarm.highThreshold, 'highThreshold', 1, 300);
  requireInRange(alarm.lowThreshold, 'lowThreshold', 1, 300);
  if (alarm.highThreshold <= alarm.lowThreshold) {
    throw { code: 'INVALID_ARGUMENT', message: 'highThreshold must be greater than lowThreshold' };
  }
}

export function validateScreenLightSettings(s: ScreenLightSettings): void {
  requireValidHour(s.nightStartHour, 'nightStartHour');
  requireValidMinute(s.nightStartMinute, 'nightStartMinute');
  requireValidHour(s.nightEndHour, 'nightEndHour');
  requireValidMinute(s.nightEndMinute, 'nightEndMinute');
  requireInRange(s.nightLevel, 'nightLevel', 0, 15);
  requireInRange(s.dayLevel, 'dayLevel', 0, 15);
  requireInRange(s.maxLevel, 'maxLevel', 1, 15);
  if (s.lastManualDayLevel !== undefined) {
    requireInRange(s.lastManualDayLevel, 'lastManualDayLevel', 0, 15);
  }
}

export function validateScreenLightDurationSeconds(seconds: number): void {
  requireInRange(seconds, 'seconds', 1, 600);
}

/** Vendor long-sit gate is 30–240 minutes (iOS `longSeatGateValue`). */
export function validateSedentaryReminderSettings(s: SedentaryReminderSettings): void {
  requireValidHour(s.startHour, 'startHour');
  requireValidMinute(s.startMinute, 'startMinute');
  requireValidHour(s.endHour, 'endHour');
  requireValidMinute(s.endMinute, 'endMinute');
  requireInRange(s.thresholdMinutes, 'thresholdMinutes', 30, 240);
}

export function validateWristFlipWakeSettings(s: WristFlipWakeSettings): void {
  requireValidHour(s.startHour, 'startHour');
  requireValidMinute(s.startMinute, 'startMinute');
  requireValidHour(s.endHour, 'endHour');
  requireValidMinute(s.endMinute, 'endMinute');
  requireInRange(s.sensitivityLevel, 'sensitivityLevel', 1, 10);
}

const YMD = /^\d{4}-\d{2}-\d{2}$/;

const VALID_WOMEN_HEALTH_STATUS = new Set<WomenHealthStatus>([
  'none',
  'menstrual',
  'pregnancy_prep',
  'pregnancy',
  'postpartum',
]);

function requireYmd(value: string | undefined, field: string): void {
  if (value === undefined || value === '') {
    throw { code: 'INVALID_ARGUMENT', message: `${field} is required` };
  }
  if (!YMD.test(value)) {
    throw { code: 'INVALID_ARGUMENT', message: `${field} must be yyyy-MM-dd` };
  }
}

/** Validates payload for `setWomenHealthSettings` (native `WomenSetting` / `VPDeviceFemaleModel`). */
export function validateWomenHealthSettings(s: WomenHealthSettings): void {
  if (!VALID_WOMEN_HEALTH_STATUS.has(s.status)) {
    throw { code: 'INVALID_ARGUMENT', message: 'status must be a valid WomenHealthStatus' };
  }
  if (s.menstrualLengthDays !== undefined) {
    requireInRange(s.menstrualLengthDays, 'menstrualLengthDays', 4, 28);
  }
  if (s.menstrualCycleDays !== undefined) {
    requireInRange(s.menstrualCycleDays, 'menstrualCycleDays', 15, 50);
  }
  if (s.lastMenstrualDate !== undefined && s.lastMenstrualDate !== '' && !YMD.test(s.lastMenstrualDate)) {
    throw { code: 'INVALID_ARGUMENT', message: 'lastMenstrualDate must be yyyy-MM-dd' };
  }
  if (
    s.expectedDeliveryDate !== undefined &&
    s.expectedDeliveryDate !== '' &&
    !YMD.test(s.expectedDeliveryDate)
  ) {
    throw { code: 'INVALID_ARGUMENT', message: 'expectedDeliveryDate must be yyyy-MM-dd' };
  }
  if (s.babyBirthday !== undefined && s.babyBirthday !== '' && !YMD.test(s.babyBirthday)) {
    throw { code: 'INVALID_ARGUMENT', message: 'babyBirthday must be yyyy-MM-dd' };
  }
  if (s.babySex !== undefined) {
    const allowed: WomenHealthBabySex[] = ['female', 'male'];
    if (!allowed.includes(s.babySex)) {
      throw { code: 'INVALID_ARGUMENT', message: 'babySex must be female or male' };
    }
  }

  switch (s.status) {
    case 'menstrual':
    case 'pregnancy_prep':
      requireYmd(s.lastMenstrualDate, 'lastMenstrualDate');
      if (s.menstrualLengthDays === undefined) {
        throw { code: 'INVALID_ARGUMENT', message: 'menstrualLengthDays is required for this status' };
      }
      if (s.menstrualCycleDays === undefined) {
        throw { code: 'INVALID_ARGUMENT', message: 'menstrualCycleDays is required for this status' };
      }
      break;
    case 'pregnancy':
      requireYmd(s.lastMenstrualDate, 'lastMenstrualDate');
      requireYmd(s.expectedDeliveryDate, 'expectedDeliveryDate');
      break;
    case 'postpartum':
      requireYmd(s.lastMenstrualDate, 'lastMenstrualDate');
      requireYmd(s.babyBirthday, 'babyBirthday');
      if (s.menstrualLengthDays === undefined) {
        throw { code: 'INVALID_ARGUMENT', message: 'menstrualLengthDays is required for postpartum' };
      }
      if (s.menstrualCycleDays === undefined) {
        throw { code: 'INVALID_ARGUMENT', message: 'menstrualCycleDays is required for postpartum' };
      }
      if (s.babySex === undefined) {
        throw { code: 'INVALID_ARGUMENT', message: 'babySex is required for postpartum' };
      }
      break;
    default:
      break;
  }
}

const WATCH_FACE_DIAL_TYPES = new Set<WatchFaceDialType>(['default', 'market', 'photo']);

function requireWatchFaceDialType(value: unknown, field: string): asserts value is WatchFaceDialType {
  if (typeof value !== 'string' || !WATCH_FACE_DIAL_TYPES.has(value as WatchFaceDialType)) {
    throw { code: 'INVALID_ARGUMENT', message: `${field} must be 'default', 'market', or 'photo'` };
  }
}

/** Optional filter for read; native may still return a unified snapshot (Android). */
export function validateReadWatchFaceStyleOptions(options?: {
  dialType?: WatchFaceDialType;
}): void {
  if (options?.dialType !== undefined) {
    requireWatchFaceDialType(options.dialType, 'dialType');
  }
}

/** Vendor slot index; cap loosely — some Bands expose large enumerations. */
export function validateWatchFaceStyleSettings(s: WatchFaceStyleSettings): void {
  requireInRange(s.screenIndex, 'screenIndex', 0, 65_535);
  if (s.dialType !== undefined) {
    requireWatchFaceDialType(s.dialType, 'dialType');
  }
}

export function validateFirmwareDfuFilePath(filePath: string): void {
  if (typeof filePath !== 'string' || filePath.trim().length === 0) {
    throw { code: 'INVALID_ARGUMENT', message: 'filePath is required' };
  }
  if (filePath.length > 4096) {
    throw { code: 'INVALID_ARGUMENT', message: 'filePath is too long' };
  }
}

export function validateDeviceTime(time?: Date): void {
  if (time === undefined) return;
  if (!(time instanceof Date) || isNaN(time.getTime())) {
    throw { code: 'INVALID_ARGUMENT', message: 'time must be a valid Date' };
  }
}
