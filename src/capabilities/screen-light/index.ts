import { invokeOrThrow } from "../../bridge/native-invoke-pipeline.js";
import type { ThrowingInvoke } from "../../bridge/native-invoke-pipeline.js";
import type { CapabilityContext } from "../shared/context.js";
import type { ScreenLightNativeMethods } from "./native.js";
import { normalizeScreenLightSettings, normalizeScreenLightDuration } from "./normalizers.js";
import { validateScreenLightSettings, validateScreenLightDurationSeconds } from "./validators.js";
import type { ScreenLightDuration, ScreenLightSettings } from "../../types/index.js";

export class ScreenLightCapability {
  constructor(private readonly ctx: CapabilityContext<ScreenLightNativeMethods>) {}

  private call<T>(opts: Omit<ThrowingInvoke<T>, "mapError">): Promise<T> {
    return invokeOrThrow({ ...opts, mapError: (e) => this.ctx.mapError(e) });
  }

  readScreenLightSettings(): Promise<ScreenLightSettings> {
    return this.call({
      invoke: () => this.ctx.native.readScreenLightSettings(),
      normalize: normalizeScreenLightSettings,
    });
  }

  setScreenLightSettings(settings: ScreenLightSettings): Promise<void> {
    return this.call({
      validate: () => validateScreenLightSettings(settings),
      invoke: () => this.ctx.native.setScreenLightSettings(settings),
    });
  }

  readScreenLightDuration(): Promise<ScreenLightDuration> {
    return this.call({
      invoke: () => this.ctx.native.readScreenLightDuration(),
      normalize: normalizeScreenLightDuration,
    });
  }

  setScreenLightDuration(seconds: number): Promise<void> {
    return this.call({
      validate: () => validateScreenLightDurationSeconds(seconds),
      invoke: () => this.ctx.native.setScreenLightDuration(seconds),
    });
  }
}
