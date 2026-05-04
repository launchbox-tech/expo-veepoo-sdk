import type { SedentaryReminderSettings } from "../../types/index.js";
import { requireInRange, requireValidHour, requireValidMinute } from "../../validators/shared.js";

/** Vendor long-sit gate is 30–240 minutes (iOS `longSeatGateValue`). */
export function validateSedentaryReminderSettings(s: SedentaryReminderSettings): void {
  requireValidHour(s.startHour, 'startHour');
  requireValidMinute(s.startMinute, 'startMinute');
  requireValidHour(s.endHour, 'endHour');
  requireValidMinute(s.endMinute, 'endMinute');
  requireInRange(s.thresholdMinutes, 'thresholdMinutes', 30, 240);
}
