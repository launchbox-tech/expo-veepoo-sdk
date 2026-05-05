import { invokeOrThrow } from "@/bridge/native-invoke-pipeline";
import type { ThrowingInvoke } from "@/bridge/native-invoke-pipeline";
import type { CapabilityContext } from "@/capabilities/shared/context";
import type { DeviceVersionNativeMethods } from "./native";
import { normalizeDeviceVersion } from "./normalizers";
import type { DeviceVersion } from "@/types/index";

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
