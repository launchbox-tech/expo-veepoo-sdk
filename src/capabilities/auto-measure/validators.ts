import type { AutoMeasureSetting } from "../../types/index.js";
import { requireInRange } from "../../validators/shared.js";

export function validateAutoMeasureSetting(setting: Partial<AutoMeasureSetting>): void {
  if (setting.measureInterval !== undefined) {
    requireInRange(setting.measureInterval, 'measureInterval', 1, 120);
  }
  if (setting.currentStartMinute !== undefined) {
    requireInRange(setting.currentStartMinute, 'currentStartMinute', 0, 1_439);
  }
  if (setting.currentEndMinute !== undefined) {
    requireInRange(setting.currentEndMinute, 'currentEndMinute', 0, 1_439);
  }
}
