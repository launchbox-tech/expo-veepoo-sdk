import type { CapabilityContext } from "../capabilities/shared/context";
/** SOS call-attempt count from the Band. Vendor enforces `times` stays within `[min_times, max_times]`. */
export interface SosCallTimesSettings {
    times: number;
    min_times: number;
    max_times: number;
}
export interface SosNativeMethods {
    readSosCallTimes(): Promise<unknown>;
    setSosCallTimes(times: number): Promise<void>;
}
export declare function normalizeSosCallTimesSettings(value: unknown): SosCallTimesSettings;
export declare function validateSosCallTimes(times: number): void;
export declare class SosCapability {
    private readonly ctx;
    constructor(ctx: CapabilityContext<SosNativeMethods>);
    readSosCallTimes(): Promise<SosCallTimesSettings>;
    setSosCallTimes(times: number): Promise<void>;
}
//# sourceMappingURL=sos.d.ts.map