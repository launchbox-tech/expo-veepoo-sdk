import { invokeOrThrow } from "../../bridge/native-invoke-pipeline.js";
import type { ThrowingInvoke } from "../../bridge/native-invoke-pipeline.js";
import type { CapabilityContext } from "../shared/context.js";
import type { BtStatusNativeMethods } from "./native.js";
import { normalizeDeviceBTStatus } from "./normalizers.js";
import type { DeviceBTStatus } from "../../types/index.js";

export class BtStatusCapability {
  constructor(private readonly ctx: CapabilityContext<BtStatusNativeMethods>) {}

  private call<T>(opts: Omit<ThrowingInvoke<T>, "mapError">): Promise<T> {
    return invokeOrThrow({ ...opts, mapError: (e) => this.ctx.mapError(e) });
  }

  readDeviceBTStatus(): Promise<DeviceBTStatus> {
    return this.call({
      invoke: () => this.ctx.native.readDeviceBTStatus(),
      normalize: normalizeDeviceBTStatus,
    });
  }

  setDeviceBTSwitch(open: boolean): Promise<void> {
    return this.call({
      invoke: () => this.ctx.native.setDeviceBTSwitch(open),
    });
  }
}
