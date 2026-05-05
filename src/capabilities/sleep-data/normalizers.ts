import type { SleepData } from "@/types/index";
import { isRecord, toInt, toNumber, toStringValue } from "@/normalizers/primitives";

function normalizeSleepRecord(value: Record<string, unknown>): SleepData | null {
  if (Array.isArray(value.items) && isRecord(value.summary)) {
    return {
      date: toStringValue(value.date),
      items: value.items.map((item) => {
        const record = isRecord(item) ? item : {};
        return {
          date: toStringValue(record.date),
          sleep_time: toStringValue(record.sleepTime ?? record.sleep_time),
          wake_time: toStringValue(record.wakeTime ?? record.wake_time),
          deep_sleep_minutes: toInt(record.deepSleepMinutes ?? record.deep_sleep_minutes),
          light_sleep_minutes: toInt(record.lightSleepMinutes ?? record.light_sleep_minutes),
          total_sleep_minutes: toInt(record.totalSleepMinutes ?? record.total_sleep_minutes),
          sleep_quality: toInt(record.sleepQuality ?? record.sleep_quality),
          sleep_line: toStringValue(record.sleepLine ?? record.sleep_line),
          wake_up_count: toInt(record.wakeUpCount ?? record.wake_up_count),
        };
      }),
      summary: {
        total_deep_sleep_minutes: toInt(value.summary.totalDeepSleepMinutes ?? value.summary.total_deep_sleep_minutes),
        total_light_sleep_minutes: toInt(value.summary.totalLightSleepMinutes ?? value.summary.total_light_sleep_minutes),
        total_sleep_minutes: toInt(value.summary.totalSleepMinutes ?? value.summary.total_sleep_minutes),
        average_sleep_quality: toInt(value.summary.averageSleepQuality ?? value.summary.average_sleep_quality),
        total_wake_up_count: toInt(value.summary.totalWakeUpCount ?? value.summary.total_wake_up_count),
      },
    };
  }

  const sleep_time = toStringValue(value.SLEEP_TIME ?? value.sleepTime ?? value.sleep_time);
  const wake_time = toStringValue(value.WAKE_TIME ?? value.wakeTime ?? value.wake_time);
  if (!sleep_time && !wake_time) return null;

  const deep_sleep_minutes = Math.trunc((toNumber(value.DEEP_HOUR) ?? 0) * 60);
  const light_sleep_minutes = Math.trunc((toNumber(value.LIGHT_HOUR) ?? 0) * 60);
  const total_sleep_minutes =
    toInt(value.totalSleepMinutes ?? value.total_sleep_minutes, -1) >= 0
      ? toInt(value.totalSleepMinutes ?? value.total_sleep_minutes)
      : Math.trunc((toNumber(value.SLE_HOUR) ?? 0) * 60 + (toNumber(value.SLE_MINUTE) ?? 0));
  const sleep_quality = toInt(value.SLEEP_LEVEL ?? value.sleepQuality ?? value.sleep_quality);
  const wake_up_count = toInt(value.WakeUpTime ?? value.wakeUpCount ?? value.wake_up_count);
  const date = toStringValue(value.date || (wake_time ? wake_time.slice(0, 10) : ''));

  return {
    date,
    items: [
      {
        date,
        sleep_time,
        wake_time,
        deep_sleep_minutes,
        light_sleep_minutes,
        total_sleep_minutes,
        sleep_quality,
        sleep_line: toStringValue(value.SLE_LINE ?? value.sleepLine ?? value.sleep_line),
        wake_up_count,
      },
    ],
    summary: {
      total_deep_sleep_minutes: deep_sleep_minutes,
      total_light_sleep_minutes: light_sleep_minutes,
      total_sleep_minutes,
      average_sleep_quality: sleep_quality,
      total_wake_up_count: wake_up_count,
    },
  };
}

export function normalizeSleepDataList(value: unknown): SleepData[] {
  if (!Array.isArray(value)) {
    if (isRecord(value)) {
      const single = normalizeSleepRecord(value);
      return single ? [single] : [];
    }
    return [];
  }
  return value
    .map((item) => (isRecord(item) ? normalizeSleepRecord(item) : null))
    .filter((item): item is SleepData => item !== null);
}
