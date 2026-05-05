import type { ScreenLightSettings } from "@/types/index";
import { requireInRange, requireValidHour, requireValidMinute } from "@/validators/shared";

export function validateScreenLightSettings(s: ScreenLightSettings): void {
  requireValidHour(s.night_start_hour, 'nightStartHour');
  requireValidMinute(s.night_start_minute, 'nightStartMinute');
  requireValidHour(s.night_end_hour, 'nightEndHour');
  requireValidMinute(s.night_end_minute, 'nightEndMinute');
  requireInRange(s.night_level, 'nightLevel', 0, 15);
  requireInRange(s.day_level, 'dayLevel', 0, 15);
  requireInRange(s.max_level, 'maxLevel', 1, 15);
  if (s.last_manual_day_level !== undefined) {
    requireInRange(s.last_manual_day_level, 'lastManualDayLevel', 0, 15);
  }
}

export function validateScreenLightDurationSeconds(seconds: number): void {
  requireInRange(seconds, 'seconds', 1, 600);
}
