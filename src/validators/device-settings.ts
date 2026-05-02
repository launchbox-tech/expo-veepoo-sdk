import type { AutoMeasureSetting, DeviceAlarm } from '../types/index.js';
import { requireInRange, requireValidHour, requireValidMinute } from './shared.js';

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
    if (Buffer.byteLength(alarm.text, 'utf8') > 60) {
      throw { code: 'INVALID_ARGUMENT', message: 'text must not exceed 60 bytes' };
    }
  }
}

export function validateDeleteAlarm(alarmId: number): void {
  requireInRange(alarmId, 'alarmId', 1, 20);
}
