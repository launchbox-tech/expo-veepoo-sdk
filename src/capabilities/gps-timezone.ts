import type { CapabilityContext } from "@/capabilities/shared/context";
import { deepCamelKeys } from "@/shared/deep-keys";
import type { VeepooError } from "@/types/index";

// ── Types ────────────────────────────────────────────────────────────────────

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

// ── Native methods ──────────────────────────────────────────────────────────

export interface GpsTimezoneNativeMethods {
  setDeviceGPSAndTimezone(data: GPSAndTimezoneData): Promise<void>;
}

// ── Validators ──────────────────────────────────────────────────────────────

function validateGPSAndTimezoneData(data: GPSAndTimezoneData): void {
  if (typeof data.latitude !== "number" || !Number.isFinite(data.latitude) || data.latitude < -90 || data.latitude > 90) {
    throw { code: "INVALID_ARGUMENT", message: "latitude must be a number between -90 and 90" } satisfies VeepooError;
  }
  if (typeof data.longitude !== "number" || !Number.isFinite(data.longitude) || data.longitude < -180 || data.longitude > 180) {
    throw { code: "INVALID_ARGUMENT", message: "longitude must be a number between -180 and 180" } satisfies VeepooError;
  }
  if (data.altitude !== undefined && (typeof data.altitude !== "number" || !Number.isFinite(data.altitude))) {
    throw { code: "INVALID_ARGUMENT", message: "altitude must be a finite number when provided" } satisfies VeepooError;
  }
  const timezoneOffsetMinutes = data.timezone_offset_minutes;
  if (!Number.isInteger(timezoneOffsetMinutes) || timezoneOffsetMinutes % 15 !== 0) {
    throw { code: "INVALID_ARGUMENT", message: "timezoneOffsetMinutes must be an integer multiple of 15" } satisfies VeepooError;
  }
}

// ── Capability ──────────────────────────────────────────────────────────────

export class GpsTimezoneCapability {
  constructor(private readonly ctx: CapabilityContext<GpsTimezoneNativeMethods>) {}

  setDeviceGPSAndTimezone(data: GPSAndTimezoneData): Promise<void> {
    return this.ctx.invoke({
      validate: () => validateGPSAndTimezoneData(data),
      invoke: () => this.ctx.native.setDeviceGPSAndTimezone(deepCamelKeys(data) as GPSAndTimezoneData),
    });
  }
}
