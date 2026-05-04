import type { SleepData } from "../../types/index.js";
import { isRecord, toInt, toNumber, toStringValue } from "../../normalizers/primitives.js";

function normalizeSleepRecord(value: Record<string, unknown>): SleepData | null {
  if (Array.isArray(value.items) && isRecord(value.summary)) {
    return {
      date: toStringValue(value.date),
      items: value.items.map((item) => {
        const record = isRecord(item) ? item : {};
        return {
          date: toStringValue(record.date),
          sleepTime: toStringValue(record.sleepTime),
          wakeTime: toStringValue(record.wakeTime),
          deepSleepMinutes: toInt(record.deepSleepMinutes),
          lightSleepMinutes: toInt(record.lightSleepMinutes),
          totalSleepMinutes: toInt(record.totalSleepMinutes),
          sleepQuality: toInt(record.sleepQuality),
          sleepLine: toStringValue(record.sleepLine),
          wakeUpCount: toInt(record.wakeUpCount),
        };
      }),
      summary: {
        totalDeepSleepMinutes: toInt(value.summary.totalDeepSleepMinutes),
        totalLightSleepMinutes: toInt(value.summary.totalLightSleepMinutes),
        totalSleepMinutes: toInt(value.summary.totalSleepMinutes),
        averageSleepQuality: toInt(value.summary.averageSleepQuality),
        totalWakeUpCount: toInt(value.summary.totalWakeUpCount),
      },
    };
  }

  const sleepTime = toStringValue(value.SLEEP_TIME ?? value.sleepTime);
  const wakeTime = toStringValue(value.WAKE_TIME ?? value.wakeTime);
  if (!sleepTime && !wakeTime) return null;

  const deepSleepMinutes = Math.trunc((toNumber(value.DEEP_HOUR) ?? 0) * 60);
  const lightSleepMinutes = Math.trunc((toNumber(value.LIGHT_HOUR) ?? 0) * 60);
  const totalSleepMinutes =
    toInt(value.totalSleepMinutes, -1) >= 0
      ? toInt(value.totalSleepMinutes)
      : Math.trunc((toNumber(value.SLE_HOUR) ?? 0) * 60 + (toNumber(value.SLE_MINUTE) ?? 0));
  const sleepQuality = toInt(value.SLEEP_LEVEL ?? value.sleepQuality);
  const wakeUpCount = toInt(value.WakeUpTime ?? value.wakeUpCount);
  const date = toStringValue(value.date || (wakeTime ? wakeTime.slice(0, 10) : ''));

  return {
    date,
    items: [
      {
        date,
        sleepTime,
        wakeTime,
        deepSleepMinutes,
        lightSleepMinutes,
        totalSleepMinutes,
        sleepQuality,
        sleepLine: toStringValue(value.SLE_LINE ?? value.sleepLine),
        wakeUpCount,
      },
    ],
    summary: {
      totalDeepSleepMinutes: deepSleepMinutes,
      totalLightSleepMinutes: lightSleepMinutes,
      totalSleepMinutes,
      averageSleepQuality: sleepQuality,
      totalWakeUpCount: wakeUpCount,
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
