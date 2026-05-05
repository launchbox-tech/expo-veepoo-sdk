import type { SedentaryReminderSettings } from "@/types/index";
import { isRecord, toInt, toBoolean } from "@/normalizers/primitives";

export function normalizeSedentaryReminderSettings(value: unknown): SedentaryReminderSettings {
  const record = isRecord(value) ? value : {};
  return {
    start_hour: toInt(record.startHour ?? record.start_hour),
    start_minute: toInt(record.startMinute ?? record.start_minute),
    end_hour: toInt(record.endHour ?? record.end_hour),
    end_minute: toInt(record.endMinute ?? record.end_minute),
    threshold_minutes: toInt(record.thresholdMinutes ?? record.threshold_minutes, 60),
    enabled: toBoolean(record.enabled, false),
  };
}
