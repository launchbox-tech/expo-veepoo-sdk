import type { CapabilityContext } from "@/capabilities/shared/context";
import type { DeviceVersionNativeMethods } from "./native";
import { normalizeDeviceVersion } from "./normalizers";
import type { DeviceVersion } from "@/types/index";

export class DeviceVersionCapability {
  constructor(private readonly ctx: CapabilityContext<DeviceVersionNativeMethods>) {}

  readDeviceVersion(): Promise<DeviceVersion> {
    return this.ctx.invoke({
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
