export interface FindDeviceNativeMethods {
  startFindDevice(): Promise<void>;
  stopFindDevice(): Promise<void>;
}
