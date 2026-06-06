import type { CapabilityContext } from "../../capabilities/shared/context";
import type { OriginDataNativeMethods } from "./native";
import type { OriginData } from "../../types/index";
export declare class OriginDataCapability {
    private readonly ctx;
    constructor(ctx: CapabilityContext<OriginDataNativeMethods>);
    readOriginData(dayOffset?: number): Promise<OriginData[]>;
}
//# sourceMappingURL=index.d.ts.map