import { invokeOrThrow } from "../../bridge/native-invoke-pipeline.js";
import type { ThrowingInvoke } from "../../bridge/native-invoke-pipeline.js";
import type { CapabilityContext } from "../shared/context.js";
import type { AlarmNativeMethods } from "./native.js";
import { normalizeAlarmList, normalizeHeartRateAlarm } from "./normalizers.js";
import { validateAlarm, validateDeleteAlarm, validateHeartRateAlarm } from "./validators.js";
import type { DeviceAlarm, HeartRateAlarm, OperationStatus } from "../../types/index.js";
import { deepCamelKeys } from "../../normalizers/deep-keys.js";

export class AlarmsCapability {
  constructor(private readonly ctx: CapabilityContext<AlarmNativeMethods>) {}

  private call<T>(opts: Omit<ThrowingInvoke<T>, "mapError">): Promise<T> {
    return invokeOrThrow({ ...opts, mapError: (e) => this.ctx.mapError(e) });
  }

  readAlarms(): Promise<DeviceAlarm[]> {
    return this.call({
      invoke: () => this.ctx.native.readAlarms(),
      normalize: normalizeAlarmList,
      afterSuccess: (alarms) =>
        this.ctx.emit("alarmData", { device_id: this.ctx.connectedDeviceId(), alarms }),
    });
  }

  setAlarm(alarm: DeviceAlarm): Promise<OperationStatus> {
    return this.call({
      validate: () => validateAlarm(alarm),
      invoke: () => this.ctx.native.setAlarm(deepCamelKeys(alarm) as DeviceAlarm),
    });
  }

  deleteAlarm(alarmId: number): Promise<OperationStatus> {
    return this.call({
      validate: () => validateDeleteAlarm(alarmId),
      invoke: () => this.ctx.native.deleteAlarm(alarmId),
    });
  }

  readHeartRateAlarm(): Promise<HeartRateAlarm> {
    return this.call({
      invoke: () => this.ctx.native.readHeartRateAlarm(),
      normalize: normalizeHeartRateAlarm,
      afterSuccess: (data) =>
        this.ctx.emit("heartRateAlarmData", { device_id: this.ctx.connectedDeviceId() ?? "", data }),
    });
  }

  setHeartRateAlarm(alarm: HeartRateAlarm): Promise<OperationStatus> {
    return this.call({
      validate: () => validateHeartRateAlarm(alarm),
      invoke: () => this.ctx.native.setHeartRateAlarm(deepCamelKeys(alarm) as HeartRateAlarm),
      afterSuccess: () =>
        this.ctx.emit("heartRateAlarmData", { device_id: this.ctx.connectedDeviceId() ?? "", data: alarm }),
    });
  }
}
