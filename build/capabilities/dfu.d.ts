import type { CapabilityContext } from "../capabilities/shared/context";
import type { VeepooEventPayload } from "../types/index";
export interface DfuNativeMethods {
    startLocalFirmwareDfu(filePath: string): Promise<void>;
}
export declare function normalizeFirmwareDfuProgress(value: unknown): VeepooEventPayload["firmware_dfu_progress"];
export declare class DfuCapability {
    private readonly ctx;
    constructor(ctx: CapabilityContext<DfuNativeMethods>);
    /**
     * Local-file firmware DFU. Listen to `firmwareDfuProgress`. **High risk:** can brick a Band if misused.
     * Android: JL-platform Bands only (`VPOperateManager.isJLDevice`). iOS: `VPDFUOperation` local file path.
     */
    startLocalFirmwareDfu(filePath: string): Promise<void>;
}
//# sourceMappingURL=dfu.d.ts.map