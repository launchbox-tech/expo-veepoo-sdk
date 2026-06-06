import type { CapabilityContext } from "../capabilities/shared/context";
export interface DaySummaryData {
    date: string;
    all_step: number;
    sport_list: Array<{
        time: string;
        step: number;
        cal: number;
        dis: number;
    }>;
    rate_list: Array<{
        time: string;
        rate: number;
    }>;
    bp_list: Array<{
        time: string;
        high: number;
        low: number;
    }>;
}
export interface DaySummaryNativeMethods {
    readDaySummaryData(dayOffset?: number): Promise<unknown>;
}
export declare function normalizeDaySummaryData(value: unknown): DaySummaryData;
export declare class DaySummaryCapability {
    private readonly ctx;
    constructor(ctx: CapabilityContext<DaySummaryNativeMethods>);
    readDaySummaryData(dayOffset?: number): Promise<DaySummaryData>;
}
//# sourceMappingURL=day-summary.d.ts.map