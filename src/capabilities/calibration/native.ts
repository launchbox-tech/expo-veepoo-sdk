import type { OperationStatus } from "@/types/index";

export interface CalibrationNativeMethods {
  calibrateBloodPressure(systolic: number, diastolic: number): Promise<OperationStatus>;
  calibrateBloodGlucose(value: number): Promise<OperationStatus>;
  setBloodGlucoseRiskLevel(low: number, high: number, unit: string): Promise<OperationStatus>;
}
