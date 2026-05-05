import { invokeOrThrow } from "../../bridge/native-invoke-pipeline.js";
import type { ThrowingInvoke } from "../../bridge/native-invoke-pipeline.js";
import type { CapabilityContext } from "../shared/context.js";
import type { GpsTimezoneNativeMethods } from "./native.js";
import { validateGPSAndTimezoneData } from "./validators.js";
import type { GPSAndTimezoneData } from "../../types/index.js";
import { deepCamelKeys } from "../../normalizers/deep-keys.js";

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
