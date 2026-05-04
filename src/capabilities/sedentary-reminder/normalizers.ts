import type { SedentaryReminderSettings } from "../../types/index.js";
import { isRecord, toInt, toBoolean } from "../../normalizers/primitives.js";

export function normalizeSedentaryReminderSettings(value: unknown): SedentaryReminderSettings {
  const record = isRecord(value) ? value : {};
  return {
    startHour: toInt(record.startHour),
    startMinute: toInt(record.startMinute),
    endHour: toInt(record.endHour),
    endMinute: toInt(record.endMinute),
    thresholdMinutes: toInt(record.thresholdMinutes, 60),
    enabled: toBoolean(record.enabled, false),
  };
}
