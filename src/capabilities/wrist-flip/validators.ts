import type { WristFlipWakeSettings } from "@/types/index";
import { requireInRange, requireValidHour, requireValidMinute } from "@/validators/shared";

export function validateWristFlipWakeSettings(s: WristFlipWakeSettings): void {
  requireValidHour(s.start_hour, 'startHour');
  requireValidMinute(s.start_minute, 'startMinute');
  requireValidHour(s.end_hour, 'endHour');
  requireValidMinute(s.end_minute, 'endMinute');
  requireInRange(s.sensitivity_level, 'sensitivityLevel', 1, 10);
}
