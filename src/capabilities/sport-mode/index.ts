import { invokeOrThrow } from "@/bridge/native-invoke-pipeline";
import type { ThrowingInvoke } from "@/bridge/native-invoke-pipeline";
import type { CapabilityContext } from "@/capabilities/shared/context";
import type { SportModeNativeMethods } from "./native";
import { normalizeSportModeStatus } from "./normalizers";
import { validateSportMode } from "./validators";
import type { SportMode, SportModeStatus, OperationStatus } from "@/types/index";
import { SPORT_MODE_ORDINALS } from "@/types/index";

export class SportModeCapability {
  constructor(private readonly ctx: CapabilityContext<SportModeNativeMethods>) {}

  private call<T>(opts: Omit<ThrowingInvoke<T>, "mapError">): Promise<T> {
    return invokeOrThrow({ ...opts, mapError: (e) => this.ctx.mapError(e) });
  }

  readSportMode(): Promise<SportModeStatus> {
    return this.call({
      invoke: () => this.ctx.native.readSportMode(),
      normalize: normalizeSportModeStatus,
      afterSuccess: (result) =>
        this.ctx.emit("sport_mode_data", { device_id: this.ctx.connectedDeviceId() ?? "", mode: result.mode }),
    });
  }

  setSportMode(mode: SportMode): Promise<OperationStatus> {
    return this.call({
      validate: () => validateSportMode(mode),
      invoke: () => {
        const ordinal = SPORT_MODE_ORDINALS.indexOf(mode);
        return this.ctx.native.setSportMode(ordinal);
      },
    });
  }

  stopSportMode(): Promise<OperationStatus> {
    return this.call({
      invoke: () => this.ctx.native.stopSportMode(),
    });
  }
}
