import { invokeOrThrow } from "@/bridge/native-invoke-pipeline";
import type { ThrowingInvoke } from "@/bridge/native-invoke-pipeline";
import type { CapabilityContext } from "@/capabilities/shared/context";
import type { BtStatusNativeMethods } from "./native";
import { normalizeDeviceBTStatus } from "./normalizers";
import type { DeviceBTStatus } from "@/types/index";

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
