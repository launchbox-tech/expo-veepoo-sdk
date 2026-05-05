import type { ScreenLightDuration, ScreenLightSettings } from "@/types/index";
import { isRecord, toInt, toBoolean } from "@/normalizers/primitives";

export function normalizeScreenLightSettings(value: unknown): ScreenLightSettings {
  const record = isRecord(value) ? value : {};
  const base: ScreenLightSettings = {
    night_start_hour: toInt(record.nightStartHour ?? record.night_start_hour),
    night_start_minute: toInt(record.nightStartMinute ?? record.night_start_minute),
    night_end_hour: toInt(record.nightEndHour ?? record.night_end_hour),
    night_end_minute: toInt(record.nightEndMinute ?? record.night_end_minute),
    night_level: toInt(record.nightLevel ?? record.night_level),
    day_level: toInt(record.dayLevel ?? record.day_level),
    auto_adjust: toBoolean(record.autoAdjust ?? record.auto_adjust, false),
    max_level: toInt(record.maxLevel ?? record.max_level, 5),
  };
  const lastManual = record.lastManualDayLevel ?? record.last_manual_day_level;
  if (lastManual !== undefined && lastManual !== null) {
    base.last_manual_day_level = toInt(lastManual);
  }
  return base;
}

export function normalizeScreenLightDuration(value: unknown): ScreenLightDuration {
  const record = isRecord(value) ? value : {};
  const out: ScreenLightDuration = {
    current_seconds: toInt(record.currentSeconds ?? record.current_seconds),
    min_seconds: toInt(record.minSeconds ?? record.min_seconds),
    max_seconds: toInt(record.maxSeconds ?? record.max_seconds),
  };
  const rec = record.recommendSeconds ?? record.recommend_seconds;
  if (rec !== undefined && rec !== null) {
    out.recommend_seconds = toInt(rec);
  }
  return out;
}
