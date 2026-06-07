import type { CapabilityContext } from "../capabilities/shared/context";
/**
 * GPS + timezone data pushed to the Band via `setDeviceGPSAndTimezone`.
 * iOS only — Android rejects with `CAPABILITY_UNSUPPORTED`.
 * Gate: check `readDeviceFunctions().package3.agps_function` before calling.
 */
export interface GPSAndTimezoneData {
    /** Latitude in decimal degrees (e.g. 39.904987). Range: -90 to 90. */
    latitude: number;
    /** Longitude in decimal degrees (e.g. 116.405289). Range: -180 to 180. */
    longitude: number;
    /** Altitude in meters. Optional. */
    altitude?: number;
    /** Timezone offset from UTC in minutes (must be multiple of 15). E.g. 480 for UTC+8. */
    timezone_offset_minutes: number;
}
export interface GpsTimezoneNativeMethods {
    setDeviceGPSAndTimezone(data: GPSAndTimezoneData): Promise<void>;
}
export declare class GpsTimezoneCapability {
    private readonly ctx;
    constructor(ctx: CapabilityContext<GpsTimezoneNativeMethods>);
    setDeviceGPSAndTimezone(data: GPSAndTimezoneData): Promise<void>;
}
//# sourceMappingURL=gps-timezone.d.ts.map