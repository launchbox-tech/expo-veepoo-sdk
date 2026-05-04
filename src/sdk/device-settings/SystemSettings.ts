import { invokeNative } from "../../bridge/native-invoke-pipeline.js";
import {
  normalizeDeviceBTStatus,
  normalizeWeatherSettings,
} from "../../normalizers/index.js";
import {
  validateDeviceTime,
  validateFirmwareDfuFilePath,
  validateGPSAndTimezoneData,
  validateWeatherData,
  validateWeatherSettings,
} from "../../validators/index.js";
import type {
  DeviceBTStatus,
  GPSAndTimezoneData,
  Language,
  WeatherData,
  WeatherSettings,
} from "../../types/index.js";
import type { SubsystemRuntime, SystemSettingsInterface } from "../subsystem-interfaces.js";

/** System-level settings: language, time, GPS/timezone, Bluetooth, weather, and firmware DFU. */
export class SystemSettings implements SystemSettingsInterface {
  constructor(private readonly rt: SubsystemRuntime) {}

  setLanguage(language: Language): Promise<boolean> {
    return invokeNative({
      invoke: () => this.rt.native.setLanguage(language),
      fallbackCode: "OPERATION_FAILED",
      deviceId: this.rt.state.connectedDeviceId ?? undefined,
      throwMapped: (e: unknown) => this.rt.nativeOpFailed(e),
    });
  }

  async setDeviceTime(time?: Date): Promise<boolean> {
    validateDeviceTime(time);
    return invokeNative({
      invoke: () =>
        this.rt.native.setDeviceTime(
          time === undefined ? undefined : {
            year: time.getFullYear(),
            month: time.getMonth() + 1,
            day: time.getDate(),
            hour: time.getHours(),
            minute: time.getMinutes(),
            second: time.getSeconds(),
          },
        ),
      fallbackCode: "OPERATION_FAILED",
      deviceId: this.rt.state.connectedDeviceId ?? undefined,
      throwMapped: (e: unknown) => this.rt.nativeOpFailed(e),
    });
  }

  setDeviceGPSAndTimezone(data: GPSAndTimezoneData): Promise<void> {
    return invokeNative({
      validate: () => validateGPSAndTimezoneData(data),
      invoke: () => this.rt.native.setDeviceGPSAndTimezone(data),
      fallbackCode: "OPERATION_FAILED",
      deviceId: this.rt.state.connectedDeviceId ?? undefined,
      throwMapped: (e: unknown) => this.rt.nativeOpFailed(e),
    });
  }

  readDeviceBTStatus(): Promise<DeviceBTStatus> {
    return invokeNative({
      invoke: () => this.rt.native.readDeviceBTStatus(),
      normalize: normalizeDeviceBTStatus,
      fallbackCode: "OPERATION_FAILED",
      deviceId: this.rt.state.connectedDeviceId ?? undefined,
      throwMapped: (e: unknown) => this.rt.nativeOpFailed(e),
    });
  }

  setDeviceBTSwitch(open: boolean): Promise<void> {
    return invokeNative({
      invoke: () => this.rt.native.setDeviceBTSwitch(open),
      fallbackCode: "OPERATION_FAILED",
      deviceId: this.rt.state.connectedDeviceId ?? undefined,
      throwMapped: (e: unknown) => this.rt.nativeOpFailed(e),
    });
  }

  readWeatherSettings(): Promise<WeatherSettings> {
    return invokeNative({
      invoke: () => this.rt.native.readWeatherSettings(),
      normalize: normalizeWeatherSettings,
      fallbackCode: "OPERATION_FAILED",
      deviceId: this.rt.state.connectedDeviceId ?? undefined,
      throwMapped: (e: unknown) => this.rt.nativeOpFailed(e),
    });
  }

  setWeatherSettings(settings: WeatherSettings): Promise<void> {
    return invokeNative({
      validate: () => validateWeatherSettings(settings),
      invoke: () => this.rt.native.setWeatherSettings(settings),
      fallbackCode: "OPERATION_FAILED",
      deviceId: this.rt.state.connectedDeviceId ?? undefined,
      throwMapped: (e: unknown) => this.rt.nativeOpFailed(e),
    });
  }

  pushWeatherData(data: WeatherData): Promise<void> {
    return invokeNative({
      validate: () => validateWeatherData(data),
      invoke: () => this.rt.native.pushWeatherData(data),
      fallbackCode: "OPERATION_FAILED",
      deviceId: this.rt.state.connectedDeviceId ?? undefined,
      throwMapped: (e: unknown) => this.rt.nativeOpFailed(e),
    });
  }

  /**
   * Local-file firmware DFU. Listen to `firmwareDfuProgress`. **High risk:** can brick a Band if misused.
   * Android: JL-platform Bands only (`VPOperateManager.isJLDevice`). iOS: `VPDFUOperation` local file path.
   */
  startLocalFirmwareDfu(filePath: string): Promise<void> {
    return invokeNative({
      validate: () => validateFirmwareDfuFilePath(filePath),
      invoke: () => this.rt.native.startLocalFirmwareDfu(filePath.trim()),
      fallbackCode: "OPERATION_FAILED",
      deviceId: this.rt.state.connectedDeviceId ?? undefined,
      throwMapped: (e: unknown) => this.rt.nativeOpFailed(e),
    });
  }
}
