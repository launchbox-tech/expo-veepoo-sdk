import type { WristFlipWakeSettings } from "@/types/index";
import { isRecord, toInt, toBoolean } from "@/normalizers/primitives";

export function normalizeWristFlipWakeSettings(value: unknown): WristFlipWakeSettings {
  const record = isRecord(value) ? value : {};
  const base: WristFlipWakeSettings = {
    enabled: toBoolean(record.enabled, false),
    start_hour: toInt(record.startHour ?? record.start_hour),
    start_minute: toInt(record.startMinute ?? record.start_minute),
    end_hour: toInt(record.endHour ?? record.end_hour),
    end_minute: toInt(record.endMinute ?? record.end_minute),
    sensitivity_level: toInt(record.sensitivityLevel ?? record.sensitivity_level, 5),
  };
  const sctw = record.supportsCustomTimeWindow ?? record.supports_custom_time_window;
  if (sctw !== undefined && sctw !== null) {
    base.supports_custom_time_window = toBoolean(sctw, false);
  }
  const dsl = record.defaultSensitivityLevel ?? record.default_sensitivity_level;
  if (dsl !== undefined && dsl !== null) {
    base.default_sensitivity_level = toInt(dsl);
  }
  return base;
}
