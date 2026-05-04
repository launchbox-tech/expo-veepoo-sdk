import { invokeOrThrow, invokeWithRecovery } from "../../bridge/native-invoke-pipeline.js";
import type { CapabilityContext } from "../shared/context.js";
import type { BandDiscoveryNativeMethods } from "./native.js";
import { normalizePermissionsResult } from "./normalizers.js";
import type { PermissionsResult, ScanOptions } from "../../types/index.js";

export class BandDiscoveryCapability {
  constructor(private readonly ctx: CapabilityContext<BandDiscoveryNativeMethods>) {}

  async checkBluetoothStatus(): Promise<boolean> {
    return invokeWithRecovery({
      invoke: () => this.ctx.native.isBluetoothEnabled(),
      recover: (error: unknown) => {
        this.ctx.mapError(error, { code: "UNKNOWN" });
        return false;
      },
      afterSuccess: (enabled: boolean) => {
        this.ctx.log("debug", "bluetooth", "bluetooth.check", "Checked Bluetooth status", {
          data: { enabled },
        });
      },
    });
  }

  async requestPermissions(): Promise<PermissionsResult> {
    return invokeWithRecovery({
      invoke: () => this.ctx.native.requestPermissions(),
      normalize: normalizePermissionsResult,
      recover: (error: unknown) => {
        this.ctx.mapError(error, { code: "PERMISSION_DENIED" });
        return { granted: false, status: "denied", canAskAgain: true };
      },
      afterSuccess: (result: PermissionsResult) => {
        this.ctx.log("info", "permissions", "permissions.request", "Requested Bluetooth permissions", {
          data: result,
        });
      },
    });
  }

  async startScan(options?: ScanOptions): Promise<void> {
    if (this.ctx.isScanning()) return;

    this.ctx.setScanning(true);
    try {
      this.ctx.log("info", "scan", "scan.start", "Starting device scan", { data: options });
      await invokeOrThrow({
        invoke: () => this.ctx.native.startScan(options),
        mapError: (error: unknown) => this.ctx.mapError(error, { code: "UNKNOWN" }),
      });
    } catch (e) {
      this.ctx.setScanning(false);
      throw e;
    }
  }

  async stopScan(): Promise<void> {
    if (!this.ctx.isScanning()) return;

    try {
      await invokeOrThrow({
        invoke: () => this.ctx.native.stopScan(),
        mapError: (error: unknown) => this.ctx.mapError(error, { code: "UNKNOWN" }),
      });
      this.ctx.setScanning(false);
      this.ctx.log("info", "scan", "scan.stop", "Stopped device scan");
    } catch (e) {
      this.ctx.setScanning(false);
      throw e;
    }
  }
}
