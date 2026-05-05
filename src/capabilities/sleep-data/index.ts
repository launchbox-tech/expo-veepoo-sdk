import { invokeOrThrow } from "@/bridge/native-invoke-pipeline";
import type { ThrowingInvoke } from "@/bridge/native-invoke-pipeline";
import type { CapabilityContext } from "@/capabilities/shared/context";
import type { SleepDataNativeMethods } from "./native";
import { normalizeSleepDataList } from "./normalizers";
import type { SleepData } from "@/types/index";

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
