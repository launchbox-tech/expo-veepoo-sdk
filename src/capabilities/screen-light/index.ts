import { invokeOrThrow } from "@/bridge/native-invoke-pipeline";
import type { ThrowingInvoke } from "@/bridge/native-invoke-pipeline";
import type { CapabilityContext } from "@/capabilities/shared/context";
import type { ScreenLightNativeMethods } from "./native";
import { normalizeScreenLightSettings, normalizeScreenLightDuration } from "./normalizers";
import { validateScreenLightSettings, validateScreenLightDurationSeconds } from "./validators";
import type { ScreenLightDuration, ScreenLightSettings } from "@/types/index";
import { deepCamelKeys } from "@/normalizers/deep-keys";

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
      invoke: () => this.ctx.native.setScreenLightSettings(deepCamelKeys(settings) as ScreenLightSettings),
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
