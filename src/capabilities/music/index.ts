import { invokeOrThrow } from "../../bridge/native-invoke-pipeline.js";
import type { ThrowingInvoke } from "../../bridge/native-invoke-pipeline.js";
import type { CapabilityContext } from "../shared/context.js";
import type { MusicNativeMethods } from "./native.js";
import { validateMusicData } from "./validators.js";
import type { MusicData } from "../../types/index.js";
import { deepCamelKeys } from "../../normalizers/deep-keys.js";

export class MusicCapability {
  constructor(private readonly ctx: CapabilityContext<MusicNativeMethods>) {}

  private call<T>(opts: Omit<ThrowingInvoke<T>, "mapError">): Promise<T> {
    return invokeOrThrow({ ...opts, mapError: (e) => this.ctx.mapError(e) });
  }

  setMusicControlEnabled(enabled: boolean): Promise<void> {
    return this.call({
      invoke: () => this.ctx.native.setMusicControlEnabled(enabled),
    });
  }

  pushMusicData(data: MusicData): Promise<void> {
    return this.call({
      validate: () => validateMusicData(data),
      invoke: () => this.ctx.native.pushMusicData(deepCamelKeys(data) as MusicData),
    });
  }
}
