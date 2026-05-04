import { invokeOrThrow } from "../../bridge/native-invoke-pipeline.js";
import type { ThrowingInvoke } from "../../bridge/native-invoke-pipeline.js";
import type { CapabilityContext } from "../shared/context.js";
import type { DeviceVersionNativeMethods } from "./native.js";
import { normalizeDeviceVersion } from "./normalizers.js";
import type { DeviceVersion } from "../../types/index.js";

export class DeviceVersionCapability {
  constructor(private readonly ctx: CapabilityContext<DeviceVersionNativeMethods>) {}

  private call<T>(opts: Omit<ThrowingInvoke<T>, "mapError">): Promise<T> {
    return invokeOrThrow({ ...opts, mapError: (e) => this.ctx.mapError(e) });
  }

  readDeviceVersion(): Promise<DeviceVersion> {
    return this.call({
      invoke: () => this.ctx.native.readDeviceVersion(),
      normalize: normalizeDeviceVersion,
      afterSuccess: (result) => {
        this.ctx.log("debug", "device", "device.version.read", "Device version received", {
          deviceId: this.ctx.connectedDeviceId() ?? undefined,
          data: result,
        });
      },
    });
  }
}
