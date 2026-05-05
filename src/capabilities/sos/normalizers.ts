import type { SosCallTimesSettings } from "../../types/index.js";
import { isRecord, toInt } from "../../normalizers/primitives.js";

export function normalizeSosCallTimesSettings(value: unknown): SosCallTimesSettings {
  const record = isRecord(value) ? value : {};
  return {
    times: toInt(record.times),
    min_times: toInt(record.minTimes ?? record.min_times),
    max_times: toInt(record.maxTimes ?? record.max_times),
  };
}
