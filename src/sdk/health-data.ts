import { invokeOrThrow } from "../bridge/native-invoke-pipeline.js";
import {
  normalizeBatteryInfo,
  normalizeDaySummaryData,
  normalizeDeviceFunctions,
  normalizeDeviceVersion,
  normalizeOriginDataList,
  normalizeSleepDataList,
  normalizeSocialMsgData,
  normalizeSportStepData,
} from "../normalizers/index.js";
import { validateSocialMsgData } from "../validators/index.js";
import type {
  BatteryInfo,
  DaySummaryData,
  DeviceFunctions,
  DeviceVersion,
  OperationStatus,
  OriginData,
  SleepData,
  SocialMsgData,
  SportStepData,
} from "../types/index.js";
import type { HealthDataInterface, SubsystemRuntime } from "./subsystem-interfaces.js";

/** Historical and device read APIs (battery, functions, origin, sleep, sport, social). */
export class HealthData implements HealthDataInterface {
  constructor(private readonly rt: SubsystemRuntime) {}

  async readBattery(): Promise<BatteryInfo> {
    this.rt.log("debug", "device", "battery.read.start", "Reading battery info", {
      deviceId: this.rt.state.connectedDeviceId ?? undefined,
    });
    return invokeOrThrow({
      invoke: () => this.rt.native.readBattery(),
      normalize: normalizeBatteryInfo,
      mapError: (e: unknown) => this.rt.nativeOpFailed(e),
      afterSuccess: (result: BatteryInfo) => {
        this.rt.log("debug", "device", "battery.read.result", "Battery info received", {
          deviceId: this.rt.state.connectedDeviceId ?? undefined,
          data: result,
        });
      },
    });
  }

  async readDeviceFunctions(): Promise<DeviceFunctions> {
    return invokeOrThrow({
      invoke: () => this.rt.native.readDeviceFunctions(),
      normalize: normalizeDeviceFunctions,
      mapError: (e: unknown) => this.rt.nativeOpFailed(e),
      afterSuccess: (result: DeviceFunctions) => {
        this.rt.log("debug", "device", "device.functions.read", "Device functions received", {
          deviceId: this.rt.state.connectedDeviceId ?? undefined,
          data: result,
        });
      },
    });
  }

  async readSocialMsgData(): Promise<SocialMsgData> {
    return invokeOrThrow({
      invoke: () => this.rt.native.readSocialMsgData(),
      normalize: normalizeSocialMsgData,
      mapError: (e: unknown) => this.rt.nativeOpFailed(e),
      afterSuccess: (result: SocialMsgData) => {
        this.rt.log("debug", "device", "device.social.read", "Social message settings received", {
          deviceId: this.rt.state.connectedDeviceId ?? undefined,
          data: result,
        });
      },
    });
  }

  async writeSocialMsgData(data: Partial<SocialMsgData>): Promise<OperationStatus> {
    return invokeOrThrow({
      validate: () => validateSocialMsgData(data),
      invoke: () => this.rt.native.writeSocialMsgData(data),
      mapError: (e: unknown) => this.rt.nativeOpFailed(e),
    });
  }

  async readDeviceVersion(): Promise<DeviceVersion> {
    return invokeOrThrow({
      invoke: () => this.rt.native.readDeviceVersion(),
      normalize: normalizeDeviceVersion,
      mapError: (e: unknown) => this.rt.nativeOpFailed(e),
      afterSuccess: (result: DeviceVersion) => {
        this.rt.log("debug", "device", "device.version.read", "Device version received", {
          deviceId: this.rt.state.connectedDeviceId ?? undefined,
          data: result,
        });
      },
    });
  }

  startReadOriginData(): Promise<void> {
    this.rt.log("info", "read", "read.origin.start", "Starting origin data read", {
      deviceId: this.rt.state.connectedDeviceId ?? undefined,
    });
    return invokeOrThrow({
      invoke: () => this.rt.native.startReadOriginData(),
      mapError: (e: unknown) => this.rt.nativeOpFailed(e),
    });
  }

  readDeviceAllData(): Promise<boolean> {
    return invokeOrThrow({
      invoke: () => this.rt.native.readDeviceAllData(),
      mapError: (e: unknown) => this.rt.nativeOpFailed(e),
    });
  }

  async readSleepData(date?: string): Promise<SleepData[]> {
    return invokeOrThrow({
      invoke: () => this.rt.native.readSleepData(date),
      normalize: normalizeSleepDataList,
      mapError: (e: unknown) => this.rt.nativeOpFailed(e),
      afterSuccess: (result: SleepData[]) => {
        this.rt.log("debug", "read", "read.sleep.result", "Sleep data received", {
          deviceId: this.rt.state.connectedDeviceId ?? undefined,
          data: { date, count: result.length },
        });
      },
    });
  }

  async readSportStepData(date?: string): Promise<SportStepData> {
    return invokeOrThrow({
      invoke: () => this.rt.native.readSportStepData(date),
      normalize: normalizeSportStepData,
      mapError: (e: unknown) => this.rt.nativeOpFailed(e),
      afterSuccess: (result: SportStepData) => {
        this.rt.log("debug", "read", "read.sport.result", "Sport step data received", {
          deviceId: this.rt.state.connectedDeviceId ?? undefined,
          data: result,
        });
      },
    });
  }

  async readOriginData(dayOffset: number = 0): Promise<OriginData[]> {
    return invokeOrThrow({
      invoke: () => this.rt.native.readOriginData(dayOffset),
      normalize: normalizeOriginDataList,
      mapError: (e: unknown) => this.rt.nativeOpFailed(e),
      afterSuccess: (result: OriginData[]) => {
        this.rt.log("debug", "read", "read.origin.result", "Origin data received", {
          deviceId: this.rt.state.connectedDeviceId ?? undefined,
          data: { dayOffset, count: result.length },
        });
      },
    });
  }

  async readDaySummaryData(dayOffset: number = 0): Promise<DaySummaryData> {
    return invokeOrThrow({
      invoke: () => this.rt.native.readDaySummaryData(dayOffset),
      normalize: normalizeDaySummaryData,
      mapError: (e: unknown) => this.rt.nativeOpFailed(e),
      afterSuccess: (result: DaySummaryData) => {
        this.rt.log("debug", "read", "read.summary.result", "Day summary data received", {
          deviceId: this.rt.state.connectedDeviceId ?? undefined,
          data: { dayOffset, date: result.date },
        });
      },
    });
  }
}
