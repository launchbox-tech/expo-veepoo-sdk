import type { CapabilityContext } from "../../capabilities/shared/context";
import type { BandDiscoveryNativeMethods } from "./native";
import type { PermissionsResult, ScanOptions } from "../../types/index";
export declare class BandDiscoveryCapability {
    private readonly ctx;
    constructor(ctx: CapabilityContext<BandDiscoveryNativeMethods>);
    checkBluetoothStatus(): Promise<boolean>;
    requestPermissions(): Promise<PermissionsResult>;
    startScan(options?: ScanOptions): Promise<void>;
    stopScan(): Promise<void>;
    private endScan;
}
//# sourceMappingURL=index.d.ts.map