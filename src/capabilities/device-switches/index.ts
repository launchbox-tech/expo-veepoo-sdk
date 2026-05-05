import { invokeOrThrow } from "@/bridge/native-invoke-pipeline";
import type { ThrowingInvoke } from "@/bridge/native-invoke-pipeline";
import type { CapabilityContext } from "@/capabilities/shared/context";
import type { DeviceSwitchesNativeMethods } from "./native";
import { normalizeDeviceSwitches } from "./normalizers";
import { validateDeviceSwitchType } from "./validators";
import type { DeviceSwitches, DeviceSwitchType, OperationStatus } from "@/types/index";

export class DeviceSwitchesCapability {
  constructor(private readonly ctx: CapabilityContext<DeviceSwitchesNativeMethods>) {}

  private call<T>(opts: Omit<ThrowingInvoke<T>, "mapError">): Promise<T> {
    return invokeOrThrow({ ...opts, mapError: (e) => this.ctx.mapError(e) });
  }

  readDeviceSwitches(): Promise<DeviceSwitches> {
    return this.call({
      invoke: () => this.ctx.native.readDeviceSwitches(),
      normalize: normalizeDeviceSwitches,
      afterSuccess: (switches) =>
        this.ctx.emit("device_switches_data", { device_id: this.ctx.connectedDeviceId() ?? "", switches }),
    });
  }

  setDeviceSwitch(type: DeviceSwitchType, enabled: boolean): Promise<OperationStatus> {
    return this.call({
      validate: () => validateDeviceSwitchType(type),
      invoke: () => this.ctx.native.setDeviceSwitch(type, enabled),
    });
  }
}
