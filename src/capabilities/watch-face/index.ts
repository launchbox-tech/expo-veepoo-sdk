import { invokeOrThrow } from "@/bridge/native-invoke-pipeline";
import type { ThrowingInvoke } from "@/bridge/native-invoke-pipeline";
import type { CapabilityContext } from "@/capabilities/shared/context";
import type { WatchFaceNativeMethods } from "./native";
import { normalizeWatchFaceStyle } from "./normalizers";
import { validateReadWatchFaceStyleOptions, validateWatchFaceStyleSettings } from "./validators";
import type { WatchFaceDialType, WatchFaceStyle, WatchFaceStyleSettings } from "@/types/index";
import { deepCamelKeys } from "@/normalizers/deep-keys";

export class WatchFaceCapability {
  constructor(private readonly ctx: CapabilityContext<WatchFaceNativeMethods>) {}

  private call<T>(opts: Omit<ThrowingInvoke<T>, "mapError">): Promise<T> {
    return invokeOrThrow({ ...opts, mapError: (e) => this.ctx.mapError(e) });
  }

  readWatchFaceStyle(options?: { dial_type?: WatchFaceDialType }): Promise<WatchFaceStyle> {
    return this.call({
      validate: () => validateReadWatchFaceStyleOptions(options),
      invoke: () =>
        this.ctx.native.readWatchFaceStyle(
          options?.dial_type != null ? { dialType: options.dial_type } : null,
        ),
      normalize: normalizeWatchFaceStyle,
    });
  }

  setWatchFaceStyle(settings: WatchFaceStyleSettings): Promise<void> {
    return this.call({
      validate: () => validateWatchFaceStyleSettings(settings),
      invoke: () =>
        this.ctx.native.setWatchFaceStyle(deepCamelKeys({
          screen_index: settings.screen_index,
          dial_type: settings.dial_type ?? "default",
        }) as WatchFaceStyleSettings),
    });
  }
}
