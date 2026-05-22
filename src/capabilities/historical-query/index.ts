import type { CapabilityContext } from "@/capabilities/shared/context";
import type { HistoricalQueryNativeMethods } from "./native";

export class HistoricalQueryCapability {
  constructor(private readonly ctx: CapabilityContext<HistoricalQueryNativeMethods>) {}

  readDeviceAllData(): Promise<boolean> {
    return this.ctx.invoke({
      invoke: () => this.ctx.native.readDeviceAllData(),
    });
  }

  startReadOriginData(): Promise<void> {
    this.ctx.log("info", "read", "read.origin.start", "Starting origin data read", {
      deviceId: this.ctx.connectedDeviceId() ?? undefined,
    });
    return this.ctx.invoke({
      invoke: () => this.ctx.native.startReadOriginData(),
    });
  }
}
