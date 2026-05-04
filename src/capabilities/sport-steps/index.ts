import { invokeOrThrow } from "../../bridge/native-invoke-pipeline.js";
import type { ThrowingInvoke } from "../../bridge/native-invoke-pipeline.js";
import type { CapabilityContext } from "../shared/context.js";
import type { SportStepsNativeMethods } from "./native.js";
import { normalizeSportStepData } from "./normalizers.js";
import type { SportStepData } from "../../types/index.js";

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
