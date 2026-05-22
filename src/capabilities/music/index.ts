import type { CapabilityContext } from "@/capabilities/shared/context";
import type { MusicNativeMethods } from "./native";
import { validateMusicData } from "./validators";
import type { MusicData } from "@/types/index";
import { deepCamelKeys } from "@/normalizers/deep-keys";

export class MusicCapability {
  constructor(private readonly ctx: CapabilityContext<MusicNativeMethods>) {}

  setMusicControlEnabled(enabled: boolean): Promise<void> {
    return this.ctx.invoke({
      invoke: () => this.ctx.native.setMusicControlEnabled(enabled),
    });
  }

  pushMusicData(data: MusicData): Promise<void> {
    return this.ctx.invoke({
      validate: () => validateMusicData(data),
      invoke: () => this.ctx.native.pushMusicData(deepCamelKeys(data) as MusicData),
    });
  }
}
