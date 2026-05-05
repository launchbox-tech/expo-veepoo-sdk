import { invokeOrThrow } from "@/bridge/native-invoke-pipeline";
import type { ThrowingInvoke } from "@/bridge/native-invoke-pipeline";
import type { CapabilityContext } from "@/capabilities/shared/context";
import type { OriginDataNativeMethods } from "./native";
import { normalizeOriginDataList } from "./normalizers";
import type { OriginData } from "@/types/index";

export class OriginDataCapability {
  constructor(private readonly ctx: CapabilityContext<OriginDataNativeMethods>) {}

  private call<T>(opts: Omit<ThrowingInvoke<T>, "mapError">): Promise<T> {
    return invokeOrThrow({ ...opts, mapError: (e) => this.ctx.mapError(e) });
  }

  readOriginData(dayOffset: number = 0): Promise<OriginData[]> {
    return this.call({
      invoke: () => this.ctx.native.readOriginData(dayOffset),
      normalize: normalizeOriginDataList,
      afterSuccess: (result) => {
        this.ctx.log("debug", "read", "read.origin.result", "Origin data received", {
          deviceId: this.ctx.connectedDeviceId() ?? undefined,
          data: { dayOffset, count: result.length },
        });
      },
    });
  }
}
