import type { SedentaryReminderSettings } from "@/types/index";
import { requireInRange, requireValidHour, requireValidMinute } from "@/validators/shared";

/** Vendor long-sit gate is 30–240 minutes (iOS `longSeatGateValue`). */
export function validateSedentaryReminderSettings(s: SedentaryReminderSettings): void {
  const r = s as any;
  requireValidHour(s.start_hour ?? r.startHour, 'startHour');
  requireValidMinute(s.start_minute ?? r.startMinute, 'startMinute');
  requireValidHour(s.end_hour ?? r.endHour, 'endHour');
  requireValidMinute(s.end_minute ?? r.endMinute, 'endMinute');
  requireInRange(s.threshold_minutes ?? r.thresholdMinutes, 'thresholdMinutes', 30, 240);
}
