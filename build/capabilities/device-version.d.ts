import type { CapabilityContext } from "../capabilities/shared/context";
export interface DeviceVersion {
    hardware_version: string;
    firmware_version: string;
    software_version: string;
    device_number: string;
    new_version: string;
    description: string;
}
export interface DeviceVersionNativeMethods {
    readDeviceVersion(): Promise<unknown>;
}
export declare function normalizeDeviceVersion(value: unknown): DeviceVersion;
export declare class DeviceVersionCapability {
    private readonly ctx;
    constructor(ctx: CapabilityContext<DeviceVersionNativeMethods>);
    readDeviceVersion(): Promise<DeviceVersion>;
}
//# sourceMappingURL=device-version.d.ts.map