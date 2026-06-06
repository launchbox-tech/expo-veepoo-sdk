import type { CapabilityContext } from "../capabilities/shared/context";
import type { DeviceTimeSetting } from "../types/index";
export interface DeviceTimeNativeMethods {
    setDeviceTime(time?: Omit<DeviceTimeSetting, "system">): Promise<boolean>;
}
export declare function validateDeviceTime(time?: Date): void;
export declare class DeviceTimeCapability {
    private readonly ctx;
    constructor(ctx: CapabilityContext<DeviceTimeNativeMethods>);
    setDeviceTime(time?: Date): Promise<boolean>;
}
//# sourceMappingURL=device-time.d.ts.map