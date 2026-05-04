import { invokeOrThrow } from "../../bridge/native-invoke-pipeline.js";
import type { ThrowingInvoke } from "../../bridge/native-invoke-pipeline.js";
import type { CapabilityContext } from "../shared/context.js";
import type { DeviceFunctionsNativeMethods } from "./native.js";
import { normalizeDeviceFunctions } from "./normalizers/index.js";
import type { DeviceFunctions } from "../../types/index.js";

export class DeviceFunctionsCapability {
  constructor(private readonly ctx: CapabilityContext<DeviceFunctionsNativeMethods>) {}

  private call<T>(opts: Omit<ThrowingInvoke<T>, "mapError">): Promise<T> {
    return invokeOrThrow({ ...opts, mapError: (e) => this.ctx.mapError(e) });
  }

  readDeviceFunctions(): Promise<DeviceFunctions> {
    return this.call({
      invoke: () => this.ctx.native.readDeviceFunctions(),
      normalize: normalizeDeviceFunctions,
      afterSuccess: (result) => {
        this.ctx.log("debug", "device", "device.functions.read", "Device functions received", {
          deviceId: this.ctx.connectedDeviceId() ?? undefined,
          data: result,
        });
      },
    });
  }
}
