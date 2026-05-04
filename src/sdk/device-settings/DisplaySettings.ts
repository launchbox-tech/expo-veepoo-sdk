import { invokeNative } from "../../bridge/native-invoke-pipeline.js";
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
    return invokeNative({
      invoke: () => this.rt.native.readScreenLightSettings(),
      normalize: normalizeScreenLightSettings,
      fallbackCode: "OPERATION_FAILED",
      deviceId: this.rt.state.connectedDeviceId ?? undefined,
      throwMapped: (e: unknown) => this.rt.nativeOpFailed(e),
    });
  }

  setScreenLightSettings(settings: ScreenLightSettings): Promise<void> {
    return invokeNative({
      validate: () => validateScreenLightSettings(settings),
      invoke: () => this.rt.native.setScreenLightSettings(settings),
      fallbackCode: "OPERATION_FAILED",
      deviceId: this.rt.state.connectedDeviceId ?? undefined,
      throwMapped: (e: unknown) => this.rt.nativeOpFailed(e),
    });
  }

  readScreenLightDuration(): Promise<ScreenLightDuration> {
    return invokeNative({
      invoke: () => this.rt.native.readScreenLightDuration(),
      normalize: normalizeScreenLightDuration,
      fallbackCode: "OPERATION_FAILED",
      deviceId: this.rt.state.connectedDeviceId ?? undefined,
      throwMapped: (e: unknown) => this.rt.nativeOpFailed(e),
    });
  }

  setScreenLightDuration(seconds: number): Promise<void> {
    return invokeNative({
      validate: () => validateScreenLightDurationSeconds(seconds),
      invoke: () => this.rt.native.setScreenLightDuration(seconds),
      fallbackCode: "OPERATION_FAILED",
      deviceId: this.rt.state.connectedDeviceId ?? undefined,
      throwMapped: (e: unknown) => this.rt.nativeOpFailed(e),
    });
  }

  readWristFlipWakeSettings(): Promise<WristFlipWakeSettings> {
    return invokeNative({
      invoke: () => this.rt.native.readWristFlipWakeSettings(),
      normalize: normalizeWristFlipWakeSettings,
      fallbackCode: "OPERATION_FAILED",
      deviceId: this.rt.state.connectedDeviceId ?? undefined,
      throwMapped: (e: unknown) => this.rt.nativeOpFailed(e),
    });
  }

  setWristFlipWakeSettings(settings: WristFlipWakeSettings): Promise<void> {
    return invokeNative({
      validate: () => validateWristFlipWakeSettings(settings),
      invoke: () => this.rt.native.setWristFlipWakeSettings(settings),
      fallbackCode: "OPERATION_FAILED",
      deviceId: this.rt.state.connectedDeviceId ?? undefined,
      throwMapped: (e: unknown) => this.rt.nativeOpFailed(e),
    });
  }

  readWatchFaceStyle(options?: { dialType?: WatchFaceDialType }): Promise<WatchFaceStyle> {
    return invokeNative({
      validate: () => validateReadWatchFaceStyleOptions(options),
      invoke: () =>
        this.rt.native.readWatchFaceStyle(
          options?.dialType != null ? { dialType: options.dialType } : null,
        ),
      normalize: normalizeWatchFaceStyle,
      fallbackCode: "OPERATION_FAILED",
      deviceId: this.rt.state.connectedDeviceId ?? undefined,
      throwMapped: (e: unknown) => this.rt.nativeOpFailed(e),
    });
  }

  setWatchFaceStyle(settings: WatchFaceStyleSettings): Promise<void> {
    return invokeNative({
      validate: () => validateWatchFaceStyleSettings(settings),
      invoke: () =>
        this.rt.native.setWatchFaceStyle({
          screenIndex: settings.screenIndex,
          dialType: settings.dialType ?? "default",
        }),
      fallbackCode: "OPERATION_FAILED",
      deviceId: this.rt.state.connectedDeviceId ?? undefined,
      throwMapped: (e: unknown) => this.rt.nativeOpFailed(e),
    });
  }
}
