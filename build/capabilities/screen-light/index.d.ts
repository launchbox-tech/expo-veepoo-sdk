import type { CapabilityContext } from "../../capabilities/shared/context";
import type { ScreenLightNativeMethods } from "./native";
import type { ScreenLightDuration, ScreenLightSettings } from "../../types/index";
export declare class ScreenLightCapability {
    private readonly ctx;
    constructor(ctx: CapabilityContext<ScreenLightNativeMethods>);
    readScreenLightSettings(): Promise<ScreenLightSettings>;
    setScreenLightSettings(settings: ScreenLightSettings): Promise<void>;
    readScreenLightDuration(): Promise<ScreenLightDuration>;
    setScreenLightDuration(seconds: number): Promise<void>;
}
//# sourceMappingURL=index.d.ts.map