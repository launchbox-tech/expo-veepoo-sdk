import { invokeOrThrow } from "@/bridge/native-invoke-pipeline";
import type { ThrowingInvoke } from "@/bridge/native-invoke-pipeline";
import type { CapabilityContext } from "@/capabilities/shared/context";
import type { CalibrationNativeMethods } from "./native";
import { validateBloodPressureCalibration, validateBloodGlucoseCalibration, validateBloodGlucoseRiskLevel } from "./validators";
import type { BloodGlucoseRiskConfig, OperationStatus } from "@/types/index";

export class CalibrationCapability {
  constructor(private readonly ctx: CapabilityContext<CalibrationNativeMethods>) {}

  private call<T>(opts: Omit<ThrowingInvoke<T>, "mapError">): Promise<T> {
    return invokeOrThrow({ ...opts, mapError: (e) => this.ctx.mapError(e) });
  }

  calibrateBloodPressure(systolic: number, diastolic: number): Promise<OperationStatus> {
    return this.call({
      validate: () => validateBloodPressureCalibration(systolic, diastolic),
      invoke: () => this.ctx.native.calibrateBloodPressure(systolic, diastolic),
    });
  }

  calibrateBloodGlucose(value: number): Promise<OperationStatus> {
    return this.call({
      validate: () => validateBloodGlucoseCalibration(value),
      invoke: () => this.ctx.native.calibrateBloodGlucose(value),
    });
  }

  setBloodGlucoseRiskLevel(config: BloodGlucoseRiskConfig): Promise<OperationStatus> {
    return this.call({
      validate: () => validateBloodGlucoseRiskLevel(config),
      invoke: () => this.ctx.native.setBloodGlucoseRiskLevel(config.low, config.high, config.unit),
    });
  }
}
