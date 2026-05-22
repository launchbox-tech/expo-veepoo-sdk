import type { CapabilityContext } from "@/capabilities/shared/context";
import type { DaySummaryNativeMethods } from "./native";
import { normalizeDaySummaryData } from "./normalizers";
import type { DaySummaryData } from "@/types/index";

export class DaySummaryCapability {
  constructor(private readonly ctx: CapabilityContext<DaySummaryNativeMethods>) {}

  readDaySummaryData(dayOffset: number = 0): Promise<DaySummaryData> {
    return this.ctx.invoke({
      invoke: () => this.ctx.native.readDaySummaryData(dayOffset),
      normalize: normalizeDaySummaryData,
      afterSuccess: (result) => {
        this.ctx.log("debug", "read", "read.summary.result", "Day summary data received", {
          deviceId: this.ctx.connectedDeviceId() ?? undefined,
          data: { dayOffset, date: result.date },
        });
      },
    });
  }
}
