import type { WristFlipWakeSettings } from "../../types/index.js";
import { requireInRange, requireValidHour, requireValidMinute } from "../../validators/shared.js";

export function validateWristFlipWakeSettings(s: WristFlipWakeSettings): void {
  const r = s as any;
  requireValidHour(s.start_hour ?? r.startHour, 'startHour');
  requireValidMinute(s.start_minute ?? r.startMinute, 'startMinute');
  requireValidHour(s.end_hour ?? r.endHour, 'endHour');
  requireValidMinute(s.end_minute ?? r.endMinute, 'endMinute');
  requireInRange(s.sensitivity_level ?? r.sensitivityLevel, 'sensitivityLevel', 1, 10);
}
