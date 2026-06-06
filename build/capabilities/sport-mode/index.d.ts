import type { CapabilityContext } from "../../capabilities/shared/context";
import type { SportModeNativeMethods } from "./native";
import type { SportMode, SportModeStatus, OperationStatus } from "../../types/index";
export declare class SportModeCapability {
    private readonly ctx;
    constructor(ctx: CapabilityContext<SportModeNativeMethods>);
    readSportMode(): Promise<SportModeStatus>;
    setSportMode(mode: SportMode): Promise<OperationStatus>;
    stopSportMode(): Promise<OperationStatus>;
}
//# sourceMappingURL=index.d.ts.map