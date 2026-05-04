import type { SosCallTimesSettings } from "../../types/index.js";
import { isRecord, toInt } from "../../normalizers/primitives.js";

export function normalizeSosCallTimesSettings(value: unknown): SosCallTimesSettings {
  const record = isRecord(value) ? value : {};
  return {
    times: toInt(record.times),
    minTimes: toInt(record.minTimes),
    maxTimes: toInt(record.maxTimes),
  };
}
