import { invokeOrThrow } from "../../bridge/native-invoke-pipeline.js";
import type { ThrowingInvoke } from "../../bridge/native-invoke-pipeline.js";
import type { CapabilityContext } from "../shared/context.js";
import type { SleepDataNativeMethods } from "./native.js";
import { normalizeSleepDataList } from "./normalizers.js";
import type { SleepData } from "../../types/index.js";

export class SleepDataCapability {
  constructor(private readonly ctx: CapabilityContext<SleepDataNativeMethods>) {}

  private call<T>(opts: Omit<ThrowingInvoke<T>, "mapError">): Promise<T> {
    return invokeOrThrow({ ...opts, mapError: (e) => this.ctx.mapError(e) });
  }

  readSleepData(date?: string): Promise<SleepData[]> {
    return this.call({
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
