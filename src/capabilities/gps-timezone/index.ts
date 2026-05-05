import { invokeOrThrow } from "@/bridge/native-invoke-pipeline";
import type { ThrowingInvoke } from "@/bridge/native-invoke-pipeline";
import type { CapabilityContext } from "@/capabilities/shared/context";
import type { GpsTimezoneNativeMethods } from "./native";
import { validateGPSAndTimezoneData } from "./validators";
import type { GPSAndTimezoneData } from "@/types/index";
import { deepCamelKeys } from "@/normalizers/deep-keys";

export class GpsTimezoneCapability {
  constructor(private readonly ctx: CapabilityContext<GpsTimezoneNativeMethods>) {}

  private call<T>(opts: Omit<ThrowingInvoke<T>, "mapError">): Promise<T> {
    return invokeOrThrow({ ...opts, mapError: (e) => this.ctx.mapError(e) });
  }

  setDeviceGPSAndTimezone(data: GPSAndTimezoneData): Promise<void> {
    return this.call({
      validate: () => validateGPSAndTimezoneData(data),
      invoke: () => this.ctx.native.setDeviceGPSAndTimezone(deepCamelKeys(data) as GPSAndTimezoneData),
    });
  }
}
