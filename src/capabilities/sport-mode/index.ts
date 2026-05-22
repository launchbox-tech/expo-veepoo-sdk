import type { CapabilityContext } from "@/capabilities/shared/context";
import type { SportModeNativeMethods } from "./native";
import { normalizeSportModeStatus } from "./normalizers";
import { validateSportMode } from "./validators";
import type { SportMode, SportModeStatus, OperationStatus } from "@/types/index";
import { SPORT_MODE_ORDINALS } from "@/types/index";

export class SportModeCapability {
  constructor(private readonly ctx: CapabilityContext<SportModeNativeMethods>) {}

  readSportMode(): Promise<SportModeStatus> {
    return this.ctx.invoke({
      invoke: () => this.ctx.native.readSportMode(),
      normalize: normalizeSportModeStatus,
      afterSuccess: (result) => this.ctx.emitDeviceEvent("sport_mode_data", { mode: result.mode }),
    });
  }

  setSportMode(mode: SportMode): Promise<OperationStatus> {
    return this.ctx.invoke({
      validate: () => validateSportMode(mode),
      invoke: () => {
        const ordinal = SPORT_MODE_ORDINALS.indexOf(mode);
        return this.ctx.native.setSportMode(ordinal);
      },
    });
  }

  stopSportMode(): Promise<OperationStatus> {
    return this.ctx.invoke({
      invoke: () => this.ctx.native.stopSportMode(),
    });
  }
}
