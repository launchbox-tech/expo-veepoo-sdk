import type { DeviceAlarm, HeartRateAlarm, Spo2Alarm } from "@/types/index";
import { requireInRange, requireValidHour, requireValidMinute } from "@/validators/shared";

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
  requireInRange(alarm.high_threshold, 'highThreshold', 1, 300);
  requireInRange(alarm.low_threshold, 'lowThreshold', 1, 300);
  if (alarm.high_threshold <= alarm.low_threshold) {
    throw { code: 'INVALID_ARGUMENT', message: 'highThreshold must be greater than lowThreshold' };
  }
}

export function validateSpo2Alarm(alarm: Spo2Alarm): void {
  requireInRange(alarm.low_threshold, 'low_threshold', 1, 99);
}
