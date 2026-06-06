import type { CapabilityContext } from "../capabilities/shared/context";
import type { BloodGlucoseUnit } from "../types/settings";
import type { OperationStatus } from "../types/index";
export interface BloodGlucoseRiskConfig {
    low: number;
    high: number;
    unit: BloodGlucoseUnit;
}
export interface CalibrationNativeMethods {
    calibrateBloodPressure(systolic: number, diastolic: number): Promise<OperationStatus>;
    calibrateBloodGlucose(value: number): Promise<OperationStatus>;
    setBloodGlucoseRiskLevel(low: number, high: number, unit: string): Promise<OperationStatus>;
}
export declare function validateBloodPressureCalibration(systolic: number, diastolic: number): void;
export declare function validateBloodGlucoseCalibration(value: number): void;
export declare function validateBloodGlucoseRiskLevel(config: BloodGlucoseRiskConfig): void;
export declare class CalibrationCapability {
    private readonly ctx;
    constructor(ctx: CapabilityContext<CalibrationNativeMethods>);
    calibrateBloodPressure(systolic: number, diastolic: number): Promise<OperationStatus>;
    calibrateBloodGlucose(value: number): Promise<OperationStatus>;
    setBloodGlucoseRiskLevel(config: BloodGlucoseRiskConfig): Promise<OperationStatus>;
}
//# sourceMappingURL=calibration.d.ts.map