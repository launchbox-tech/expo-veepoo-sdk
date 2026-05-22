import type { CapabilityContext } from "@/capabilities/shared/context";
import type { SleepDataNativeMethods } from "./native";
import { normalizeSleepDataList } from "./normalizers";
import type { SleepData } from "@/types/index";

export class SleepDataCapability {
  constructor(private readonly ctx: CapabilityContext<SleepDataNativeMethods>) {}

  readSleepData(date?: string): Promise<SleepData[]> {
    return this.ctx.invoke({
      invoke: () => this.ctx.native.readSleepData(date),
      normalize: normalizeSleepDataList,
      afterSuccess: (result) => {
        this.ctx.log("debug", "read", "read.sleep.result", "Sleep data received", {
          deviceId: this.ctx.connectedDeviceId() ?? undefined,
          data: { date, count: result.length },
        });
      },
    });
  }
}
