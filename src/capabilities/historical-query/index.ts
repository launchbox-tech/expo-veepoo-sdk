import { invokeOrThrow } from "@/bridge/native-invoke-pipeline";
import type { ThrowingInvoke } from "@/bridge/native-invoke-pipeline";
import type { CapabilityContext } from "@/capabilities/shared/context";
import type { HistoricalQueryNativeMethods } from "./native";

export class HistoricalQueryCapability {
  constructor(private readonly ctx: CapabilityContext<HistoricalQueryNativeMethods>) {}

  private call<T>(opts: Omit<ThrowingInvoke<T>, "mapError">): Promise<T> {
    return invokeOrThrow({ ...opts, mapError: (e) => this.ctx.mapError(e) });
  }

  readDeviceAllData(): Promise<boolean> {
    return this.call({
      invoke: () => this.ctx.native.readDeviceAllData(),
    });
  }

  startReadOriginData(): Promise<void> {
    this.ctx.log("info", "read", "read.origin.start", "Starting origin data read", {
      deviceId: this.ctx.connectedDeviceId() ?? undefined,
    });
    return this.call({
      invoke: () => this.ctx.native.startReadOriginData(),
    });
  }
}
