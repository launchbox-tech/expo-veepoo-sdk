import { invokeOrThrow } from "@/bridge/native-invoke-pipeline";
import type { ThrowingInvoke } from "@/bridge/native-invoke-pipeline";
import type { CapabilityContext } from "@/capabilities/shared/context";
import type { FindDeviceNativeMethods } from "./native";

export class FindDeviceCapability {
  constructor(private readonly ctx: CapabilityContext<FindDeviceNativeMethods>) {}

  private call<T>(opts: Omit<ThrowingInvoke<T>, "mapError">): Promise<T> {
    return invokeOrThrow({ ...opts, mapError: (e) => this.ctx.mapError(e) });
  }

  startFindDevice(): Promise<void> {
    return this.call({
      invoke: () => this.ctx.native.startFindDevice(),
    });
  }

  stopFindDevice(): Promise<void> {
    return this.call({
      invoke: () => this.ctx.native.stopFindDevice(),
    });
  }
}
