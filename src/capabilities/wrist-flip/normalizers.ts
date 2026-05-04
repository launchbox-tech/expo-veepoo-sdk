import type { WristFlipWakeSettings } from "../../types/index.js";
import { isRecord, toInt, toBoolean } from "../../normalizers/primitives.js";

export function normalizeWristFlipWakeSettings(value: unknown): WristFlipWakeSettings {
  const record = isRecord(value) ? value : {};
  const base: WristFlipWakeSettings = {
    enabled: toBoolean(record.enabled, false),
    startHour: toInt(record.startHour),
    startMinute: toInt(record.startMinute),
    endHour: toInt(record.endHour),
    endMinute: toInt(record.endMinute),
    sensitivityLevel: toInt(record.sensitivityLevel, 5),
  };
  if (record.supportsCustomTimeWindow !== undefined && record.supportsCustomTimeWindow !== null) {
    base.supportsCustomTimeWindow = toBoolean(record.supportsCustomTimeWindow, false);
  }
  if (record.defaultSensitivityLevel !== undefined && record.defaultSensitivityLevel !== null) {
    base.defaultSensitivityLevel = toInt(record.defaultSensitivityLevel);
  }
  return base;
}
