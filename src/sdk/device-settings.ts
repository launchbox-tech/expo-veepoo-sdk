import { invokeNative } from "../bridge/native-invoke-pipeline.js";
import {
  normalizeAlarmList,
  normalizeAutoMeasureSettings,
  normalizeHeartRateAlarm,
} from "../normalizers/index.js";
import {
  validatePersonalInfo,
  validateAutoMeasureSetting,
  validateAlarm,
  validateDeleteAlarm,
  validateDeviceTime,
  validateHeartRateAlarm,
} from "../validators/index.js";
import type {
  AutoMeasureSetting,
  DeviceAlarm,
  HeartRateAlarm,
  Language,
  OperationStatus,
  PersonalInfo,
} from "../types/index.js";
import type { VeepooSDKRuntime } from "./veepoo-sdk-runtime.js";

/** Device configuration: personal info, auto-measure, language, time, alarms. */
export class DeviceSettings {
  constructor(private readonly rt: VeepooSDKRuntime) {}

  syncPersonalInfo(info: PersonalInfo): Promise<boolean> {
    return invokeNative({
      validate: () => validatePersonalInfo(info),
      invoke: () => this.rt.native.syncPersonalInfo(info),
      fallbackCode: "OPERATION_FAILED",
      deviceId: this.rt.connectedDeviceId ?? undefined,
      throwMapped: (e: unknown) => this.rt.nativeOpFailed(e),
    });
  }

  async readAutoMeasureSetting(): Promise<AutoMeasureSetting[]> {
    return invokeNative({
      invoke: () => this.rt.native.readAutoMeasureSetting(),
      normalize: normalizeAutoMeasureSettings,
      fallbackCode: "OPERATION_FAILED",
      deviceId: this.rt.connectedDeviceId ?? undefined,
      throwMapped: (e: unknown) => this.rt.nativeOpFailed(e),
      afterSuccess: (result: AutoMeasureSetting[]) => {
        this.rt.log("debug", "device", "autoMeasure.read", "Auto measure settings received", {
          deviceId: this.rt.connectedDeviceId ?? undefined,
          data: { count: result.length },
        });
      },
    });
  }

  async modifyAutoMeasureSetting(
    setting: Partial<AutoMeasureSetting>,
  ): Promise<AutoMeasureSetting[]> {
    validateAutoMeasureSetting(setting);
    this.rt.log(
      "info",
      "device",
      "autoMeasure.modify.start",
      "Modifying auto measure settings",
      {
        deviceId: this.rt.connectedDeviceId ?? undefined,
        data: setting,
      },
    );
    return invokeNative({
      invoke: () => this.rt.native.modifyAutoMeasureSetting(setting),
      normalize: normalizeAutoMeasureSettings,
      fallbackCode: "OPERATION_FAILED",
      deviceId: this.rt.connectedDeviceId ?? undefined,
      throwMapped: (e: unknown) => this.rt.nativeOpFailed(e),
      afterSuccess: (result: AutoMeasureSetting[]) => {
        this.rt.log(
          "info",
          "device",
          "autoMeasure.modify.result",
          "Auto measure settings updated",
          {
            deviceId: this.rt.connectedDeviceId ?? undefined,
            data: { count: result.length },
          },
        );
      },
    });
  }

  setLanguage(language: Language): Promise<boolean> {
    return invokeNative({
      invoke: () => this.rt.native.setLanguage(language),
      fallbackCode: "OPERATION_FAILED",
      deviceId: this.rt.connectedDeviceId ?? undefined,
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
      deviceId: this.rt.connectedDeviceId ?? undefined,
      throwMapped: (e: unknown) => this.rt.nativeOpFailed(e),
    });
  }

  async readAlarms(): Promise<DeviceAlarm[]> {
    return invokeNative({
      invoke: () => this.rt.native.readAlarms(),
      normalize: normalizeAlarmList,
      fallbackCode: "OPERATION_FAILED",
      deviceId: this.rt.connectedDeviceId ?? undefined,
      throwMapped: (e: unknown) => this.rt.nativeOpFailed(e),
      afterSuccess: (alarms: DeviceAlarm[]) => {
        this.rt.emitLocal("alarmData", { deviceId: this.rt.connectedDeviceId, alarms });
      },
    });
  }

  async setAlarm(alarm: DeviceAlarm): Promise<OperationStatus> {
    return invokeNative({
      validate: () => validateAlarm(alarm),
      invoke: () => this.rt.native.setAlarm(alarm),
      fallbackCode: "OPERATION_FAILED",
      deviceId: this.rt.connectedDeviceId ?? undefined,
      throwMapped: (e: unknown) => this.rt.nativeOpFailed(e),
    });
  }

  async deleteAlarm(alarmId: number): Promise<OperationStatus> {
    return invokeNative({
      validate: () => validateDeleteAlarm(alarmId),
      invoke: () => this.rt.native.deleteAlarm(alarmId),
      fallbackCode: "OPERATION_FAILED",
      deviceId: this.rt.connectedDeviceId ?? undefined,
      throwMapped: (e: unknown) => this.rt.nativeOpFailed(e),
    });
  }

  async readHeartRateAlarm(): Promise<HeartRateAlarm> {
    return invokeNative({
      invoke: () => this.rt.native.readHeartRateAlarm(),
      normalize: normalizeHeartRateAlarm,
      fallbackCode: "OPERATION_FAILED",
      deviceId: this.rt.connectedDeviceId ?? undefined,
      throwMapped: (e: unknown) => this.rt.nativeOpFailed(e),
      afterSuccess: (data: HeartRateAlarm) => {
        this.rt.emitLocal("heartRateAlarmData", {
          deviceId: this.rt.connectedDeviceId ?? "",
          data,
        });
      },
    });
  }

  async setHeartRateAlarm(alarm: HeartRateAlarm): Promise<OperationStatus> {
    return invokeNative({
      validate: () => validateHeartRateAlarm(alarm),
      invoke: () => this.rt.native.setHeartRateAlarm(alarm),
      fallbackCode: "OPERATION_FAILED",
      deviceId: this.rt.connectedDeviceId ?? undefined,
      throwMapped: (e: unknown) => this.rt.nativeOpFailed(e),
      afterSuccess: () => {
        this.rt.emitLocal("heartRateAlarmData", {
          deviceId: this.rt.connectedDeviceId ?? "",
          data: alarm,
        });
      },
    });
  }
}
