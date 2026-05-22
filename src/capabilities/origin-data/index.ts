import type { CapabilityContext } from "@/capabilities/shared/context";
import type { OriginDataNativeMethods } from "./native";
import { normalizeOriginDataList } from "./normalizers";
import type { OriginData } from "@/types/index";

export class OriginDataCapability {
  constructor(private readonly ctx: CapabilityContext<OriginDataNativeMethods>) {}

  readOriginData(dayOffset: number = 0): Promise<OriginData[]> {
    return this.ctx.invoke({
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
