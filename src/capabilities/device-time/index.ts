import { invokeOrThrow } from "@/bridge/native-invoke-pipeline";
import type { ThrowingInvoke } from "@/bridge/native-invoke-pipeline";
import type { CapabilityContext } from "@/capabilities/shared/context";
import type { DeviceTimeNativeMethods } from "./native";
import { validateDeviceTime } from "./validators";

export class DeviceTimeCapability {
  constructor(private readonly ctx: CapabilityContext<DeviceTimeNativeMethods>) {}

  private call<T>(opts: Omit<ThrowingInvoke<T>, "mapError">): Promise<T> {
    return invokeOrThrow({ ...opts, mapError: (e) => this.ctx.mapError(e) });
  }

  async setDeviceTime(time?: Date): Promise<boolean> {
    validateDeviceTime(time);
    return this.call({
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
