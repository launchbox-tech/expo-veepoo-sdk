import type { CapabilityContext } from "@/capabilities/shared/context";
import type { FindDeviceNativeMethods } from "./native";

export class FindDeviceCapability {
  constructor(private readonly ctx: CapabilityContext<FindDeviceNativeMethods>) {}

  startFindDevice(): Promise<void> {
    return this.ctx.invoke({
      invoke: () => this.ctx.native.startFindDevice(),
    });
  }

  stopFindDevice(): Promise<void> {
    return this.ctx.invoke({
      invoke: () => this.ctx.native.stopFindDevice(),
    });
  }
}
