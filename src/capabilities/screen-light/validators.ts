import type { ScreenLightSettings } from "../../types/index.js";
import { requireInRange, requireValidHour, requireValidMinute } from "../../validators/shared.js";

export function validateScreenLightSettings(s: ScreenLightSettings): void {
  const r = s as any;
  requireValidHour(s.night_start_hour ?? r.nightStartHour, 'nightStartHour');
  requireValidMinute(s.night_start_minute ?? r.nightStartMinute, 'nightStartMinute');
  requireValidHour(s.night_end_hour ?? r.nightEndHour, 'nightEndHour');
  requireValidMinute(s.night_end_minute ?? r.nightEndMinute, 'nightEndMinute');
  requireInRange(s.night_level ?? r.nightLevel, 'nightLevel', 0, 15);
  requireInRange(s.day_level ?? r.dayLevel, 'dayLevel', 0, 15);
  requireInRange(s.max_level ?? r.maxLevel, 'maxLevel', 1, 15);
  const lastManualDayLevel = s.last_manual_day_level ?? r.lastManualDayLevel;
  if (lastManualDayLevel !== undefined) {
    requireInRange(lastManualDayLevel, 'lastManualDayLevel', 0, 15);
  }
}

export function validateScreenLightDurationSeconds(seconds: number): void {
  requireInRange(seconds, 'seconds', 1, 600);
}
