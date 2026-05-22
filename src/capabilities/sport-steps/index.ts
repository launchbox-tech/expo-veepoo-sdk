import type { CapabilityContext } from "@/capabilities/shared/context";
import type { SportStepsNativeMethods } from "./native";
import { normalizeSportStepData } from "./normalizers";
import type { SportStepData } from "@/types/index";

export class SportStepsCapability {
  constructor(private readonly ctx: CapabilityContext<SportStepsNativeMethods>) {}

  readSportStepData(date?: string): Promise<SportStepData> {
    return this.ctx.invoke({
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
