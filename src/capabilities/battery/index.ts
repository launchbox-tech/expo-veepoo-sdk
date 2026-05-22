import type { CapabilityContext } from "@/capabilities/shared/context";
import type { BatteryNativeMethods } from "./native";
import { normalizeBatteryInfo } from "./normalizers";
import type { BatteryInfo } from "@/types/index";

export class BatteryCapability {
  constructor(private readonly ctx: CapabilityContext<BatteryNativeMethods>) {}

  readBattery(): Promise<BatteryInfo> {
    this.ctx.log("debug", "device", "battery.read.start", "Reading battery info", {
      deviceId: this.ctx.connectedDeviceId() ?? undefined,
    });
    return this.ctx.invoke({
      invoke: () => this.ctx.native.readBattery(),
      normalize: normalizeBatteryInfo,
      afterSuccess: (result) => {
        this.ctx.log("debug", "device", "battery.read.result", "Battery info received", {
          deviceId: this.ctx.connectedDeviceId() ?? undefined,
          data: result,
        });
      },
    });
  }
}
