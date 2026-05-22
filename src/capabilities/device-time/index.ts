import type { CapabilityContext } from "@/capabilities/shared/context";
import type { DeviceTimeNativeMethods } from "./native";
import { validateDeviceTime } from "./validators";

export class DeviceTimeCapability {
  constructor(private readonly ctx: CapabilityContext<DeviceTimeNativeMethods>) {}

  async setDeviceTime(time?: Date): Promise<boolean> {
    validateDeviceTime(time);
    return this.ctx.invoke({
      invoke: () =>
        this.ctx.native.setDeviceTime(
          time === undefined ? undefined : {
            year: time.getFullYear(),
            month: time.getMonth() + 1,
            day: time.getDate(),
            hour: time.getHours(),
            minute: time.getMinutes(),
            second: time.getSeconds(),
          },
        ),
    });
  }
}
