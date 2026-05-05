import type { DeviceAlarm, HeartRateAlarm, Spo2Alarm } from "@/types/index";
import { isRecord, toInt, toBoolean } from "@/normalizers/primitives";

function repeatStringToWeekdays(repeatStr: string): number[] {
  const days: number[] = [];
  for (let i = 0; i < 7; i++) {
    if (repeatStr[i] === '1') days.push(7 - i);
  }
  return days.sort((a, b) => a - b);
}

export function normalizeAlarmList(value: unknown): DeviceAlarm[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item) => isRecord(item))
    .map((item) => {
      const repeatRaw = typeof item.repeat === 'string' ? item.repeat : '0000000';
      const repeat = Array.isArray(item.repeat)
        ? (item.repeat as number[])
        : repeatStringToWeekdays(repeatRaw);
      const alarm: DeviceAlarm = {
        id: toInt(item.id, 0),
        enabled: toBoolean(item.enabled, false),
        hour: toInt(item.hour, 0),
        minute: toInt(item.minute, 0),
        repeat,
      };
      if (item.scene !== undefined && item.scene !== null) {
        alarm.scene = toInt(item.scene);
      }
      if (typeof item.text === 'string' && item.text.length > 0) {
        alarm.text = item.text;
      }
      if (item.type === 'normal' || item.type === 'text') {
        alarm.type = item.type;
      }
      return alarm;
    });
}

export function normalizeHeartRateAlarm(value: unknown): HeartRateAlarm {
  const record = isRecord(value) ? value : {};
  return {
    enabled: toBoolean(record.enabled, false),
    high_threshold: toInt(record.highThreshold ?? record.high_threshold),
    low_threshold: toInt(record.lowThreshold ?? record.low_threshold),
  };
}

export function normalizeSpo2Alarm(value: unknown): Spo2Alarm {
  const record = isRecord(value) ? value : {};
  return {
    enabled: toBoolean(record.enabled, false),
    low_threshold: toInt(record.lowThreshold ?? record.low_threshold),
  };
}
