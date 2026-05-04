import type { WristFlipWakeSettings } from "../../types/index.js";
import { requireInRange, requireValidHour, requireValidMinute } from "../../validators/shared.js";

export function validateWristFlipWakeSettings(s: WristFlipWakeSettings): void {
  requireValidHour(s.startHour, 'startHour');
  requireValidMinute(s.startMinute, 'startMinute');
  requireValidHour(s.endHour, 'endHour');
  requireValidMinute(s.endMinute, 'endMinute');
  requireInRange(s.sensitivityLevel, 'sensitivityLevel', 1, 10);
}
