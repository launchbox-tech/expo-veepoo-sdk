import { invokeOrThrow } from "../../bridge/native-invoke-pipeline.js";
import type { ThrowingInvoke } from "../../bridge/native-invoke-pipeline.js";
import type { CapabilityContext } from "../shared/context.js";
import type { WatchFaceNativeMethods } from "./native.js";
import { normalizeWatchFaceStyle } from "./normalizers.js";
import { validateReadWatchFaceStyleOptions, validateWatchFaceStyleSettings } from "./validators.js";
import type { WatchFaceDialType, WatchFaceStyle, WatchFaceStyleSettings } from "../../types/index.js";

export class WatchFaceCapability {
  constructor(private readonly ctx: CapabilityContext<WatchFaceNativeMethods>) {}

  private call<T>(opts: Omit<ThrowingInvoke<T>, "mapError">): Promise<T> {
    return invokeOrThrow({ ...opts, mapError: (e) => this.ctx.mapError(e) });
  }

  readWatchFaceStyle(options?: { dialType?: WatchFaceDialType }): Promise<WatchFaceStyle> {
    return this.call({
      validate: () => validateReadWatchFaceStyleOptions(options),
      invoke: () =>
        this.ctx.native.readWatchFaceStyle(
          options?.dialType != null ? { dialType: options.dialType } : null,
        ),
      normalize: normalizeWatchFaceStyle,
    });
  }

  setWatchFaceStyle(settings: WatchFaceStyleSettings): Promise<void> {
    return this.call({
      validate: () => validateWatchFaceStyleSettings(settings),
      invoke: () =>
        this.ctx.native.setWatchFaceStyle({
          screenIndex: settings.screenIndex,
          dialType: settings.dialType ?? "default",
        }),
    });
  }
}
