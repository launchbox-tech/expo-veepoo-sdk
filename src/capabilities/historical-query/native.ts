export interface HistoricalQueryNativeMethods {
  readDeviceAllData(): Promise<boolean>;
  startReadOriginData(): Promise<void>;
}
