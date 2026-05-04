import { invokeOrThrow } from "../../bridge/native-invoke-pipeline.js";
import type { ThrowingInvoke } from "../../bridge/native-invoke-pipeline.js";
import type { CapabilityContext } from "../shared/context.js";
import type { FindDeviceNativeMethods } from "./native.js";

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
