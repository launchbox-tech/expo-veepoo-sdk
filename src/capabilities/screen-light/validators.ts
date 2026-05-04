import type { ScreenLightSettings } from "../../types/index.js";
import { requireInRange, requireValidHour, requireValidMinute } from "../../validators/shared.js";

export function validateScreenLightSettings(s: ScreenLightSettings): void {
  requireValidHour(s.nightStartHour, 'nightStartHour');
  requireValidMinute(s.nightStartMinute, 'nightStartMinute');
  requireValidHour(s.nightEndHour, 'nightEndHour');
  requireValidMinute(s.nightEndMinute, 'nightEndMinute');
  requireInRange(s.nightLevel, 'nightLevel', 0, 15);
  requireInRange(s.dayLevel, 'dayLevel', 0, 15);
  requireInRange(s.maxLevel, 'maxLevel', 1, 15);
  if (s.lastManualDayLevel !== undefined) {
    requireInRange(s.lastManualDayLevel, 'lastManualDayLevel', 0, 15);
  }
}

export function validateScreenLightDurationSeconds(seconds: number): void {
  requireInRange(seconds, 'seconds', 1, 600);
}
