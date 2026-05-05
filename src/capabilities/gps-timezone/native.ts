import type { GPSAndTimezoneData } from "@/types/index";

export interface GpsTimezoneNativeMethods {
  setDeviceGPSAndTimezone(data: GPSAndTimezoneData): Promise<void>;
}
