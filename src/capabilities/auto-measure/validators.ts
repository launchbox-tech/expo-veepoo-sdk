import type { AutoMeasureSetting } from "@/types/index";
import { requireInRange } from "@/validators/shared";

export function validateAutoMeasureSetting(setting: Partial<AutoMeasureSetting>): void {
  if (setting.measure_interval !== undefined) {
    requireInRange(setting.measure_interval, 'measureInterval', 1, 120);
  }
  if (setting.current_start_minute !== undefined) {
    requireInRange(setting.current_start_minute, 'currentStartMinute', 0, 1_439);
  }
  if (setting.current_end_minute !== undefined) {
    requireInRange(setting.current_end_minute, 'currentEndMinute', 0, 1_439);
  }
}
