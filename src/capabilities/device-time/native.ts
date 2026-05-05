import type { DeviceTimeSetting } from "@/types/index";

export interface DeviceTimeNativeMethods {
  setDeviceTime(time?: Omit<DeviceTimeSetting, "system">): Promise<boolean>;
}
