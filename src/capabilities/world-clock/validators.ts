import type { WorldClockEntry } from "@/types/index";
import { requireInRange, requireNonEmptyString } from "@/validators/shared";

export function validateWorldClockList(clocks: WorldClockEntry[]): void {
  if (clocks.length > 4) {
    throw { code: 'INVALID_ARGUMENT', message: 'Maximum 4 world clock entries allowed' };
  }
  for (const clock of clocks) {
    requireInRange(clock.timezone_offset_minutes, 'timezone_offset_minutes', -720, 840);
    requireNonEmptyString(clock.city_name, 'city_name');
  }
}
