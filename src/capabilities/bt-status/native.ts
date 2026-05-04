export interface BtStatusNativeMethods {
  readDeviceBTStatus(): Promise<unknown>;
  setDeviceBTSwitch(open: boolean): Promise<void>;
}
