import type { CapabilityContext } from "@/capabilities/shared/context";
import type { DeviceFunctionsNativeMethods } from "./native";
import { normalizeDeviceFunctions } from "./normalizers/index";
import type { DeviceFunctions } from "@/types/index";

export class DeviceFunctionsCapability {
  constructor(private readonly ctx: CapabilityContext<DeviceFunctionsNativeMethods>) {}

  readDeviceFunctions(): Promise<DeviceFunctions> {
    return this.ctx.invoke({
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
