import type { OperationStatus } from "@/types/index";

export interface DeviceSwitchesNativeMethods {
  readDeviceSwitches(): Promise<unknown>;
  setDeviceSwitch(type: string, enabled: boolean): Promise<OperationStatus>;
}
