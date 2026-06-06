import type { CapabilityContext } from "../../capabilities/shared/context";
import type { SleepDataNativeMethods } from "./native";
import type { SleepData } from "../../types/index";
export declare class SleepDataCapability {
    private readonly ctx;
    constructor(ctx: CapabilityContext<SleepDataNativeMethods>);
    readSleepData(date?: string): Promise<SleepData[]>;
}
//# sourceMappingURL=index.d.ts.map