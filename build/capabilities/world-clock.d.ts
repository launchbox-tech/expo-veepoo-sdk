import type { CapabilityContext } from "../capabilities/shared/context";
import type { OperationStatus } from "../types/index";
export interface WorldClockEntry {
    timezone_offset_minutes: number;
    city_name: string;
    dst_offset?: number;
}
export interface WorldClockNativeMethods {
    readWorldClock(): Promise<unknown>;
    setWorldClock(clocks: WorldClockEntry[]): Promise<OperationStatus>;
}
export declare class WorldClockCapability {
    private readonly ctx;
    constructor(ctx: CapabilityContext<WorldClockNativeMethods>);
    readWorldClock(): Promise<WorldClockEntry[]>;
    setWorldClock(clocks: WorldClockEntry[]): Promise<OperationStatus>;
}
//# sourceMappingURL=world-clock.d.ts.map