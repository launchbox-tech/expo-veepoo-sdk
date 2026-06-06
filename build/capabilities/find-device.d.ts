import type { CapabilityContext } from "../capabilities/shared/context";
/** Phone → Band find / anti-loss (vibrate, screen on). Emitted on `findDeviceState`. */
export type FindDevicePhase = "unsupported" | "searching" | "found" | "timeout" | "stopped";
export interface FindDeviceNativeMethods {
    startFindDevice(): Promise<void>;
    stopFindDevice(): Promise<void>;
}
export declare function normalizeFindDeviceStatePayload(value: unknown): {
    device_id: string;
    phase: FindDevicePhase;
    raw_state?: number;
};
export declare class FindDeviceCapability {
    private readonly ctx;
    constructor(ctx: CapabilityContext<FindDeviceNativeMethods>);
    startFindDevice(): Promise<void>;
    stopFindDevice(): Promise<void>;
}
//# sourceMappingURL=find-device.d.ts.map