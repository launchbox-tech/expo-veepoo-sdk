import type { CapabilityContext } from "@/capabilities/shared/context";
import type { GpsTimezoneNativeMethods } from "./native";
import { validateGPSAndTimezoneData } from "./validators";
import type { GPSAndTimezoneData } from "@/types/index";
import { deepCamelKeys } from "@/shared/deep-keys";

export class GpsTimezoneCapability {
  constructor(private readonly ctx: CapabilityContext<GpsTimezoneNativeMethods>) {}

  setDeviceGPSAndTimezone(data: GPSAndTimezoneData): Promise<void> {
    return this.ctx.invoke({
      validate: () => validateGPSAndTimezoneData(data),
      invoke: () => this.ctx.native.setDeviceGPSAndTimezone(deepCamelKeys(data) as GPSAndTimezoneData),
    });
  }
}
