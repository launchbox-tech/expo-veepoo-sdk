import { invokeOrThrow } from "../../bridge/native-invoke-pipeline.js";
import type { ThrowingInvoke } from "../../bridge/native-invoke-pipeline.js";
import type { CapabilityContext } from "../shared/context.js";
import type { BatteryNativeMethods } from "./native.js";
import { normalizeBatteryInfo } from "./normalizers.js";
import type { BatteryInfo } from "../../types/index.js";

export class BatteryCapability {
  constructor(private readonly ctx: CapabilityContext<BatteryNativeMethods>) {}

  private call<T>(opts: Omit<ThrowingInvoke<T>, "mapError">): Promise<T> {
    return invokeOrThrow({ ...opts, mapError: (e) => this.ctx.mapError(e) });
  }

  readBattery(): Promise<BatteryInfo> {
    this.ctx.log("debug", "device", "battery.read.start", "Reading battery info", {
      deviceId: this.ctx.connectedDeviceId() ?? undefined,
    });
    return this.call({
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
