import { invokeNative } from "../../bridge/native-invoke-pipeline.js";
import {
  normalizeAlarmList,
  normalizeHeartRateAlarm,
} from "../../normalizers/index.js";
import {
  validateAlarm,
  validateDeleteAlarm,
  validateHeartRateAlarm,
} from "../../validators/index.js";
import type {
  DeviceAlarm,
  HeartRateAlarm,
  OperationStatus,
} from "../../types/index.js";
import type { AlarmSettingsInterface, SubsystemRuntime } from "../subsystem-interfaces.js";

/** Alarm configuration: device alarms and heart-rate alarm thresholds. */
export class AlarmSettings implements AlarmSettingsInterface {
  constructor(private readonly rt: SubsystemRuntime) {}

  async readAlarms(): Promise<DeviceAlarm[]> {
    return invokeNative({
      invoke: () => this.rt.native.readAlarms(),
      normalize: normalizeAlarmList,
      fallbackCode: "OPERATION_FAILED",
      deviceId: this.rt.state.connectedDeviceId ?? undefined,
      throwMapped: (e: unknown) => this.rt.nativeOpFailed(e),
      afterSuccess: (alarms: DeviceAlarm[]) => {
        this.rt.emitLocal("alarmData", { deviceId: this.rt.state.connectedDeviceId, alarms });
      },
    });
  }

  async setAlarm(alarm: DeviceAlarm): Promise<OperationStatus> {
    return invokeNative({
      validate: () => validateAlarm(alarm),
      invoke: () => this.rt.native.setAlarm(alarm),
      fallbackCode: "OPERATION_FAILED",
      deviceId: this.rt.state.connectedDeviceId ?? undefined,
      throwMapped: (e: unknown) => this.rt.nativeOpFailed(e),
    });
  }

  async deleteAlarm(alarmId: number): Promise<OperationStatus> {
    return invokeNative({
      validate: () => validateDeleteAlarm(alarmId),
      invoke: () => this.rt.native.deleteAlarm(alarmId),
      fallbackCode: "OPERATION_FAILED",
      deviceId: this.rt.state.connectedDeviceId ?? undefined,
      throwMapped: (e: unknown) => this.rt.nativeOpFailed(e),
    });
  }

  async readHeartRateAlarm(): Promise<HeartRateAlarm> {
    return invokeNative({
      invoke: () => this.rt.native.readHeartRateAlarm(),
      normalize: normalizeHeartRateAlarm,
      fallbackCode: "OPERATION_FAILED",
      deviceId: this.rt.state.connectedDeviceId ?? undefined,
      throwMapped: (e: unknown) => this.rt.nativeOpFailed(e),
      afterSuccess: (data: HeartRateAlarm) => {
        this.rt.emitLocal("heartRateAlarmData", {
          deviceId: this.rt.state.connectedDeviceId ?? "",
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
      deviceId: this.rt.state.connectedDeviceId ?? undefined,
      throwMapped: (e: unknown) => this.rt.nativeOpFailed(e),
      afterSuccess: () => {
        this.rt.emitLocal("heartRateAlarmData", {
          deviceId: this.rt.state.connectedDeviceId ?? "",
          data: alarm,
        });
      },
    });
  }
}
