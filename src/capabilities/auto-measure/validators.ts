import type { AutoMeasureSetting } from "../../types/index.js";
import { requireInRange } from "../../validators/shared.js";

export function validateAutoMeasureSetting(setting: Partial<AutoMeasureSetting>): void {
  const s = setting as any;
  const measureInterval = setting.measure_interval ?? s.measureInterval;
  if (measureInterval !== undefined) {
    requireInRange(measureInterval, 'measureInterval', 1, 120);
  }
  const currentStartMinute = setting.current_start_minute ?? s.currentStartMinute;
  if (currentStartMinute !== undefined) {
    requireInRange(currentStartMinute, 'currentStartMinute', 0, 1_439);
  }
  const currentEndMinute = setting.current_end_minute ?? s.currentEndMinute;
  if (currentEndMinute !== undefined) {
    requireInRange(currentEndMinute, 'currentEndMinute', 0, 1_439);
  }
}
