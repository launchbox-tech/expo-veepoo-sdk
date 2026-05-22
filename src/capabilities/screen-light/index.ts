import type { CapabilityContext } from "@/capabilities/shared/context";
import type { ScreenLightNativeMethods } from "./native";
import { normalizeScreenLightSettings, normalizeScreenLightDuration } from "./normalizers";
import { validateScreenLightSettings, validateScreenLightDurationSeconds } from "./validators";
import type { ScreenLightDuration, ScreenLightSettings } from "@/types/index";
import { deepCamelKeys } from "@/shared/deep-keys";

export class ScreenLightCapability {
  constructor(private readonly ctx: CapabilityContext<ScreenLightNativeMethods>) {}

  readScreenLightSettings(): Promise<ScreenLightSettings> {
    return this.ctx.invoke({
      invoke: () => this.ctx.native.readScreenLightSettings(),
      normalize: normalizeScreenLightSettings,
    });
  }

  setScreenLightSettings(settings: ScreenLightSettings): Promise<void> {
    return this.ctx.invoke({
      validate: () => validateScreenLightSettings(settings),
      invoke: () => this.ctx.native.setScreenLightSettings(deepCamelKeys(settings) as ScreenLightSettings),
    });
  }

  readScreenLightDuration(): Promise<ScreenLightDuration> {
    return this.ctx.invoke({
      invoke: () => this.ctx.native.readScreenLightDuration(),
      normalize: normalizeScreenLightDuration,
    });
  }

  setScreenLightDuration(seconds: number): Promise<void> {
    return this.ctx.invoke({
      validate: () => validateScreenLightDurationSeconds(seconds),
      invoke: () => this.ctx.native.setScreenLightDuration(seconds),
    });
  }
}
