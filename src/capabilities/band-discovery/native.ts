import type { PermissionsResult, ScanOptions } from "../../types/index.js";

export interface BandDiscoveryNativeMethods {
  isBluetoothEnabled(): Promise<boolean>;
  requestPermissions(): Promise<PermissionsResult>;
  startScan(options?: ScanOptions): Promise<void>;
  stopScan(): Promise<void>;
}
