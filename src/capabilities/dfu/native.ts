export interface DfuNativeMethods {
  startLocalFirmwareDfu(filePath: string): Promise<void>;
}
