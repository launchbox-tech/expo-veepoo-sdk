import { invokeNative } from "../bridge/native-invoke-pipeline.js";
import {
  normalizePermissionsResult,
} from "../normalizers/index.js";
import type { ScanOptions, PermissionsResult } from "../types/index.js";
import type { VeepooSDKRuntime } from "./veepoo-sdk-runtime.js";

/** Band Discovery: Bluetooth, permissions, scan start/stop. */
export class BandDiscovery {
  constructor(private readonly rt: VeepooSDKRuntime) {}

  async checkBluetoothStatus(): Promise<boolean> {
    return invokeNative({
      invoke: () => this.rt.native.isBluetoothEnabled(),
      fallbackCode: "UNKNOWN",
      recover: (error: unknown) => {
        this.rt.handleError(error, "UNKNOWN");
        return false;
      },
      afterSuccess: (enabled: boolean) => {
        this.rt.log(
          "debug",
          "bluetooth",
          "bluetooth.check",
          "Checked Bluetooth status",
          {
            data: { enabled },
          },
        );
      },
    });
  }

  async requestPermissions(): Promise<PermissionsResult> {
    return invokeNative({
      invoke: () => this.rt.native.requestPermissions(),
      normalize: normalizePermissionsResult,
      fallbackCode: "PERMISSION_DENIED",
      recover: (error: unknown) => {
        this.rt.handleError(error, "PERMISSION_DENIED");
        return { granted: false, status: "denied", canAskAgain: true };
      },
      afterSuccess: (result: PermissionsResult) => {
        this.rt.log(
          "info",
          "permissions",
          "permissions.request",
          "Requested Bluetooth permissions",
          {
            data: result,
          },
        );
      },
    });
  }

  async startScan(options?: ScanOptions): Promise<void> {
    if (this.rt.state.isScanning) return;

    this.rt.state.setScanning(true);
    try {
      this.rt.log("info", "scan", "scan.start", "Starting device scan", {
        data: options,
      });
      await invokeNative({
        invoke: () => this.rt.native.startScan(options),
        fallbackCode: "UNKNOWN",
        throwMapped: (error: unknown) => {
          throw this.rt.handleError(error, "UNKNOWN");
        },
      });
    } catch (e) {
      this.rt.state.setScanning(false);
      throw e;
    }
  }

  async stopScan(): Promise<void> {
    if (!this.rt.state.isScanning) return;

    try {
      await invokeNative({
        invoke: () => this.rt.native.stopScan(),
        fallbackCode: "UNKNOWN",
        throwMapped: (error: unknown) => {
          throw this.rt.handleError(error, "UNKNOWN");
        },
      });
      this.rt.state.setScanning(false);
      this.rt.log("info", "scan", "scan.stop", "Stopped device scan");
    } catch (e) {
      this.rt.state.setScanning(false);
      throw e;
    }
  }
}
