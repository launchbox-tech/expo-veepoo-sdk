import type { CapabilityContext } from "../capabilities/shared/context";
export interface AutoMeasureSetting {
    protocol_type: number;
    fun_type: number;
    is_switch_open: boolean;
    step_unit: number;
    is_slot_modify: boolean;
    is_interval_modify: boolean;
    support_start_minute: number;
    support_end_minute: number;
    measure_interval: number;
    current_start_minute: number;
    current_end_minute: number;
}
export interface AutoMeasureNativeMethods {
    readAutoMeasureSetting(): Promise<unknown>;
    modifyAutoMeasureSetting(setting: Partial<AutoMeasureSetting>): Promise<unknown>;
}
export declare class AutoMeasureCapability {
    private readonly ctx;
    constructor(ctx: CapabilityContext<AutoMeasureNativeMethods>);
    readAutoMeasureSetting(): Promise<AutoMeasureSetting[]>;
    modifyAutoMeasureSetting(setting: Partial<AutoMeasureSetting>): Promise<AutoMeasureSetting[]>;
}
//# sourceMappingURL=auto-measure.d.ts.map