import { invokeOrThrow } from "../../bridge/native-invoke-pipeline.js";
import type { ThrowingInvoke } from "../../bridge/native-invoke-pipeline.js";
import type { CapabilityContext } from "../shared/context.js";
import type { DaySummaryNativeMethods } from "./native.js";
import { normalizeDaySummaryData } from "./normalizers.js";
import type { DaySummaryData } from "../../types/index.js";

export class DaySummaryCapability {
  constructor(private readonly ctx: CapabilityContext<DaySummaryNativeMethods>) {}

  private call<T>(opts: Omit<ThrowingInvoke<T>, "mapError">): Promise<T> {
    return invokeOrThrow({ ...opts, mapError: (e) => this.ctx.mapError(e) });
  }

  readDaySummaryData(dayOffset: number = 0): Promise<DaySummaryData> {
    return this.call({
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
