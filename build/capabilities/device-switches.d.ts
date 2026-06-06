import type { CapabilityContext } from "../capabilities/shared/context";
import type { OperationStatus } from "../types/index";
export type DeviceSwitchType = "auto_hr" | "auto_bp" | "auto_spo2" | "auto_temperature" | "auto_hrv" | "auto_blood_glucose" | "auto_ppg" | "wear_detection" | "disconnect_remind" | "sos_remind" | "auto_answer" | "exercise_detection" | "accurate_sleep" | "ecg_normally_open" | "met" | "stress" | "music_control";
export type DeviceSwitches = Record<DeviceSwitchType, boolean>;
export interface DeviceSwitchesNativeMethods {
    readDeviceSwitches(): Promise<unknown>;
    setDeviceSwitch(type: string, enabled: boolean): Promise<OperationStatus>;
}
export declare function normalizeDeviceSwitches(value: unknown): DeviceSwitches;
export declare function validateDeviceSwitchType(type: unknown): asserts type is DeviceSwitchType;
export declare class DeviceSwitchesCapability {
    private readonly ctx;
    constructor(ctx: CapabilityContext<DeviceSwitchesNativeMethods>);
    readDeviceSwitches(): Promise<DeviceSwitches>;
    setDeviceSwitch(type: DeviceSwitchType, enabled: boolean): Promise<OperationStatus>;
}
//# sourceMappingURL=device-switches.d.ts.map