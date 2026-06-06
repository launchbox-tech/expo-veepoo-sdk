import type { CapabilityContext } from "../../capabilities/shared/context";
import type { WomenHealthNativeMethods } from "./native";
import type { WomenHealthSettings } from "../../types/index";
export declare class WomenHealthCapability {
    private readonly ctx;
    constructor(ctx: CapabilityContext<WomenHealthNativeMethods>);
    readWomenHealthSettings(): Promise<WomenHealthSettings>;
    setWomenHealthSettings(settings: WomenHealthSettings): Promise<void>;
}
//# sourceMappingURL=index.d.ts.map