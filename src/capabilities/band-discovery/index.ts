import type { CapabilityContext } from "@/capabilities/shared/context";
import type { BandDiscoveryNativeMethods } from "./native";
import { normalizePermissionsResult } from "./normalizers";
import type { PermissionsResult, ScanOptions } from "@/types/index";

export class BandDiscoveryCapability {
  constructor(private readonly ctx: CapabilityContext<BandDiscoveryNativeMethods>) {}

  async checkBluetoothStatus(): Promise<boolean> {
    return this.ctx.invokeWithRecovery({
      invoke: () => this.ctx.native.isBluetoothEnabled(),
      errorCode: "UNKNOWN",
      recoverWith: false,
      afterSuccess: (enabled: boolean) => {
        this.ctx.log("debug", "bluetooth", "bluetooth.check", "Checked Bluetooth status", {
          data: { enabled },
        });
      },
    });
  }

  async requestPermissions(): Promise<PermissionsResult> {
    return this.ctx.invokeWithRecovery({
      invoke: () => this.ctx.native.requestPermissions(),
      normalize: normalizePermissionsResult,
      errorCode: "PERMISSION_DENIED",
      recoverWith: { granted: false, status: "denied", can_ask_again: true },
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
    this.ctx.emit("scan_started", {});
    this.ctx.log("info", "scan", "scan.start", "Starting device scan", { data: options });
    try {
      await this.ctx.invoke({
        invoke: () => this.ctx.native.startScan(options),
        errorCode: "UNKNOWN",
      });
    } catch (e) {
      this.endScan();
      throw e;
    }
  }

  async stopScan(): Promise<void> {
    if (!this.ctx.isScanning()) return;

    try {
      await this.ctx.invoke({
        invoke: () => this.ctx.native.stopScan(),
        errorCode: "UNKNOWN",
      });
      this.ctx.log("info", "scan", "scan.stop", "Stopped device scan");
    } finally {
      this.endScan();
    }
  }

  private endScan(): void {
    this.ctx.setScanning(false);
    this.ctx.emit("scan_stopped", {});
  }
}
