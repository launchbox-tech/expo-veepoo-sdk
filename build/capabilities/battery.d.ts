import type { CapabilityContext } from "../capabilities/shared/context";
export type ChargeState = "normal" | "charging" | "low_pressure" | "full";
export interface BatteryInfo {
    level: number;
    percent: number;
    power_model: number;
    state: number;
    bat: number;
    is_percent: boolean;
    is_low_battery: boolean;
    charge_state?: ChargeState;
}
export interface BatteryNativeMethods {
    readBattery(): Promise<unknown>;
}
export declare function normalizeBatteryInfo(value: unknown): BatteryInfo;
export declare class BatteryCapability {
    private readonly ctx;
    constructor(ctx: CapabilityContext<BatteryNativeMethods>);
    readBattery(): Promise<BatteryInfo>;
}
//# sourceMappingURL=battery.d.ts.map