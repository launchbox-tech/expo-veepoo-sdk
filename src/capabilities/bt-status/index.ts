import type { CapabilityContext } from "@/capabilities/shared/context";
import type { BtStatusNativeMethods } from "./native";
import { normalizeDeviceBTStatus } from "./normalizers";
import type { DeviceBTStatus } from "@/types/index";

export class BtStatusCapability {
  constructor(private readonly ctx: CapabilityContext<BtStatusNativeMethods>) {}

  readDeviceBTStatus(): Promise<DeviceBTStatus> {
    return this.ctx.invoke({
      invoke: () => this.ctx.native.readDeviceBTStatus(),
      normalize: normalizeDeviceBTStatus,
    });
  }

  setDeviceBTSwitch(open: boolean): Promise<void> {
    return this.ctx.invoke({
      invoke: () => this.ctx.native.setDeviceBTSwitch(open),
    });
  }
}
