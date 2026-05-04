import type { DeviceTimeSetting } from "../../types/index.js";

export interface DeviceTimeNativeMethods {
  setDeviceTime(time?: Omit<DeviceTimeSetting, "system">): Promise<boolean>;
}
