import type { SedentaryReminderSettings } from "@/types/index";
import { requireInRange, requireValidHour, requireValidMinute } from "@/validators/shared";

/** Vendor long-sit gate is 30–240 minutes (iOS `longSeatGateValue`). */
export function validateSedentaryReminderSettings(s: SedentaryReminderSettings): void {
  requireValidHour(s.start_hour, 'startHour');
  requireValidMinute(s.start_minute, 'startMinute');
  requireValidHour(s.end_hour, 'endHour');
  requireValidMinute(s.end_minute, 'endMinute');
  requireInRange(s.threshold_minutes, 'thresholdMinutes', 30, 240);
}
