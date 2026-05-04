import { invokeOrThrow } from "../../bridge/native-invoke-pipeline.js";
import {
  normalizeScreenLightSettings,
  normalizeScreenLightDuration,
  normalizeWristFlipWakeSettings,
  normalizeWatchFaceStyle,
} from "../../normalizers/index.js";
import {
  validateScreenLightSettings,
  validateScreenLightDurationSeconds,
  validateWristFlipWakeSettings,
  validateReadWatchFaceStyleOptions,
  validateWatchFaceStyleSettings,
} from "../../validators/index.js";
import type {
  ScreenLightSettings,
  ScreenLightDuration,
  WristFlipWakeSettings,
  WatchFaceDialType,
  WatchFaceStyle,
  WatchFaceStyleSettings,
} from "../../types/index.js";
import type { DisplaySettingsInterface, SubsystemRuntime } from "../subsystem-interfaces.js";

/** Display configuration: screen brightness, duration, wrist-flip wake, and watch face. */
export class DisplaySettings implements DisplaySettingsInterface {
  constructor(private readonly rt: SubsystemRuntime) {}

  readScreenLightSettings(): Promise<ScreenLightSettings> {
    return invokeOrThrow({
      invoke: () => this.rt.native.readScreenLightSettings(),
      normalize: normalizeScreenLightSettings,
      mapError: (e: unknown) => this.rt.nativeOpFailed(e),
    });
  }

  setScreenLightSettings(settings: ScreenLightSettings): Promise<void> {
    return invokeOrThrow({
      validate: () => validateScreenLightSettings(settings),
      invoke: () => this.rt.native.setScreenLightSettings(settings),
      mapError: (e: unknown) => this.rt.nativeOpFailed(e),
    });
  }

  readScreenLightDuration(): Promise<ScreenLightDuration> {
    return invokeOrThrow({
      invoke: () => this.rt.native.readScreenLightDuration(),
      normalize: normalizeScreenLightDuration,
      mapError: (e: unknown) => this.rt.nativeOpFailed(e),
    });
  }

  setScreenLightDuration(seconds: number): Promise<void> {
    return invokeOrThrow({
      validate: () => validateScreenLightDurationSeconds(seconds),
      invoke: () => this.rt.native.setScreenLightDuration(seconds),
      mapError: (e: unknown) => this.rt.nativeOpFailed(e),
    });
  }

  readWristFlipWakeSettings(): Promise<WristFlipWakeSettings> {
    return invokeOrThrow({
      invoke: () => this.rt.native.readWristFlipWakeSettings(),
      normalize: normalizeWristFlipWakeSettings,
      mapError: (e: unknown) => this.rt.nativeOpFailed(e),
    });
  }

  setWristFlipWakeSettings(settings: WristFlipWakeSettings): Promise<void> {
    return invokeOrThrow({
      validate: () => validateWristFlipWakeSettings(settings),
      invoke: () => this.rt.native.setWristFlipWakeSettings(settings),
      mapError: (e: unknown) => this.rt.nativeOpFailed(e),
    });
  }

  readWatchFaceStyle(options?: { dialType?: WatchFaceDialType }): Promise<WatchFaceStyle> {
    return invokeOrThrow({
      validate: () => validateReadWatchFaceStyleOptions(options),
      invoke: () =>
        this.rt.native.readWatchFaceStyle(
          options?.dialType != null ? { dialType: options.dialType } : null,
        ),
      normalize: normalizeWatchFaceStyle,
      mapError: (e: unknown) => this.rt.nativeOpFailed(e),
    });
  }

  setWatchFaceStyle(settings: WatchFaceStyleSettings): Promise<void> {
    return invokeOrThrow({
      validate: () => validateWatchFaceStyleSettings(settings),
      invoke: () =>
        this.rt.native.setWatchFaceStyle({
          screenIndex: settings.screenIndex,
          dialType: settings.dialType ?? "default",
        }),
      mapError: (e: unknown) => this.rt.nativeOpFailed(e),
    });
  }
}
