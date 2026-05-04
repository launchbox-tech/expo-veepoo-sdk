import type { GPSAndTimezoneData } from "../../types/index.js";

export interface GpsTimezoneNativeMethods {
  setDeviceGPSAndTimezone(data: GPSAndTimezoneData): Promise<void>;
}
