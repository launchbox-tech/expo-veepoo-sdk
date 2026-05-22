import type { CapabilityContext } from "@/capabilities/shared/context";
import type { DeviceSwitchesNativeMethods } from "./native";
import { normalizeDeviceSwitches } from "./normalizers";
import { validateDeviceSwitchType } from "./validators";
import type { DeviceSwitches, DeviceSwitchType, OperationStatus } from "@/types/index";

export class DeviceSwitchesCapability {
  constructor(private readonly ctx: CapabilityContext<DeviceSwitchesNativeMethods>) {}

  readDeviceSwitches(): Promise<DeviceSwitches> {
    return this.ctx.invoke({
      invoke: () => this.ctx.native.readDeviceSwitches(),
      normalize: normalizeDeviceSwitches,
      afterSuccess: (switches) =>
        this.ctx.emit("device_switches_data", { device_id: this.ctx.connectedDeviceId() ?? "", switches }),
    });
  }

  setDeviceSwitch(type: DeviceSwitchType, enabled: boolean): Promise<OperationStatus> {
    return this.ctx.invoke({
      validate: () => validateDeviceSwitchType(type),
      invoke: () => this.ctx.native.setDeviceSwitch(type, enabled),
    });
  }
}
