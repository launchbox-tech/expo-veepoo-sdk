import type { ScreenLightDuration, ScreenLightSettings } from "../../types/index.js";
import { isRecord, toInt, toBoolean } from "../../normalizers/primitives.js";

export function normalizeScreenLightSettings(value: unknown): ScreenLightSettings {
  const record = isRecord(value) ? value : {};
  const base: ScreenLightSettings = {
    nightStartHour: toInt(record.nightStartHour),
    nightStartMinute: toInt(record.nightStartMinute),
    nightEndHour: toInt(record.nightEndHour),
    nightEndMinute: toInt(record.nightEndMinute),
    nightLevel: toInt(record.nightLevel),
    dayLevel: toInt(record.dayLevel),
    autoAdjust: toBoolean(record.autoAdjust, false),
    maxLevel: toInt(record.maxLevel, 5),
  };
  if (record.lastManualDayLevel !== undefined && record.lastManualDayLevel !== null) {
    base.lastManualDayLevel = toInt(record.lastManualDayLevel);
  }
  return base;
}

export function normalizeScreenLightDuration(value: unknown): ScreenLightDuration {
  const record = isRecord(value) ? value : {};
  const out: ScreenLightDuration = {
    currentSeconds: toInt(record.currentSeconds),
    minSeconds: toInt(record.minSeconds),
    maxSeconds: toInt(record.maxSeconds),
  };
  if (record.recommendSeconds !== undefined && record.recommendSeconds !== null) {
    out.recommendSeconds = toInt(record.recommendSeconds);
  }
  return out;
}
