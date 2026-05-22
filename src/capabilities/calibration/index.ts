import type { CapabilityContext } from "@/capabilities/shared/context";
import type { CalibrationNativeMethods } from "./native";
import { validateBloodPressureCalibration, validateBloodGlucoseCalibration, validateBloodGlucoseRiskLevel } from "./validators";
import type { BloodGlucoseRiskConfig, OperationStatus } from "@/types/index";

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
