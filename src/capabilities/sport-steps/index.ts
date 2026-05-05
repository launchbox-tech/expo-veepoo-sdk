import { invokeOrThrow } from "@/bridge/native-invoke-pipeline";
import type { ThrowingInvoke } from "@/bridge/native-invoke-pipeline";
import type { CapabilityContext } from "@/capabilities/shared/context";
import type { SportStepsNativeMethods } from "./native";
import { normalizeSportStepData } from "./normalizers";
import type { SportStepData } from "@/types/index";

export class SportStepsCapability {
  constructor(private readonly ctx: CapabilityContext<SportStepsNativeMethods>) {}

  private call<T>(opts: Omit<ThrowingInvoke<T>, "mapError">): Promise<T> {
    return invokeOrThrow({ ...opts, mapError: (e) => this.ctx.mapError(e) });
  }

  readSportStepData(date?: string): Promise<SportStepData> {
    return this.call({
      invoke: () => this.ctx.native.readSportStepData(date),
      normalize: normalizeSportStepData,
      afterSuccess: (result) => {
        this.ctx.log("debug", "read", "read.sport.result", "Sport step data received", {
          deviceId: this.ctx.connectedDeviceId() ?? undefined,
          data: result,
        });
      },
    });
  }
}
