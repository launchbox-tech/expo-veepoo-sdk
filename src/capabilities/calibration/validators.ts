import type { BloodGlucoseRiskConfig } from "@/types/index";
import { requireInRange } from "@/validators/shared";

export function validateBloodPressureCalibration(systolic: number, diastolic: number): void {
  requireInRange(systolic, 'systolic', 60, 250);
  requireInRange(diastolic, 'diastolic', 60, 250);
}

export function validateBloodGlucoseCalibration(value: number): void {
  requireInRange(value, 'value', 2, 30);
}

export function validateBloodGlucoseRiskLevel(config: BloodGlucoseRiskConfig): void {
  requireInRange(config.low, 'low', 2, 30);
  requireInRange(config.high, 'high', 2, 30);
  if (config.low >= config.high) {
    throw { code: 'INVALID_ARGUMENT', message: 'low must be less than high' };
  }
}
