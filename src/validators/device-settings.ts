import type {
  AutoMeasureSetting,
  DeviceAlarm,
  FunctionStatus,
  HeartRateAlarm,
  ScreenLightSettings,
  SedentaryReminderSettings,
  SocialMsgData,
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

export function validateDeviceTime(time?: Date): void {
  if (time === undefined) return;
  if (!(time instanceof Date) || isNaN(time.getTime())) {
    throw { code: 'INVALID_ARGUMENT', message: 'time must be a valid Date' };
  }
}
