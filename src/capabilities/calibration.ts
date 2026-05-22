import type { CapabilityContext } from "@/capabilities/shared/context";
import { requireInRange } from "@/shared/assertions";
import type { BloodGlucoseUnit } from "@/types/settings";
import type { OperationStatus, VeepooError } from "@/types/index";

// ── Types ────────────────────────────────────────────────────────────────────

export interface BloodGlucoseRiskConfig {
  low: number;
  high: number;
  unit: BloodGlucoseUnit;
}

// ── Native methods ──────────────────────────────────────────────────────────

export interface CalibrationNativeMethods {
  calibrateBloodPressure(systolic: number, diastolic: number): Promise<OperationStatus>;
  calibrateBloodGlucose(value: number): Promise<OperationStatus>;
  setBloodGlucoseRiskLevel(low: number, high: number, unit: string): Promise<OperationStatus>;
}

// ── Validators ──────────────────────────────────────────────────────────────

export function validateBloodPressureCalibration(systolic: number, diastolic: number): void {
  requireInRange(systolic, "systolic", 60, 250);
  requireInRange(diastolic, "diastolic", 60, 250);
}

export function validateBloodGlucoseCalibration(value: number): void {
  requireInRange(value, "value", 2, 30);
}

export function validateBloodGlucoseRiskLevel(config: BloodGlucoseRiskConfig): void {
  requireInRange(config.low, "low", 2, 30);
  requireInRange(config.high, "high", 2, 30);
  if (config.low >= config.high) {
    throw { code: "INVALID_ARGUMENT", message: "low must be less than high" } satisfies VeepooError;
  }
}

// ── Capability ──────────────────────────────────────────────────────────────

export class CalibrationCapability {
  constructor(private readonly ctx: CapabilityContext<CalibrationNativeMethods>) {}

  calibrateBloodPressure(systolic: number, diastolic: number): Promise<OperationStatus> {
    return this.ctx.invoke({
      validate: () => validateBloodPressureCalibration(systolic, diastolic),
      invoke: () => this.ctx.native.calibrateBloodPressure(systolic, diastolic),
    });
  }

  calibrateBloodGlucose(value: number): Promise<OperationStatus> {
    return this.ctx.invoke({
      validate: () => validateBloodGlucoseCalibration(value),
      invoke: () => this.ctx.native.calibrateBloodGlucose(value),
    });
  }

  setBloodGlucoseRiskLevel(config: BloodGlucoseRiskConfig): Promise<OperationStatus> {
    return this.ctx.invoke({
      validate: () => validateBloodGlucoseRiskLevel(config),
      invoke: () => this.ctx.native.setBloodGlucoseRiskLevel(config.low, config.high, config.unit),
    });
  }
}
