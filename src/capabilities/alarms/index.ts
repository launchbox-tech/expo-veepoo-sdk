import { invokeOrThrow } from "@/bridge/native-invoke-pipeline";
import type { ThrowingInvoke } from "@/bridge/native-invoke-pipeline";
import type { CapabilityContext } from "@/capabilities/shared/context";
import type { AlarmNativeMethods } from "./native";
import { normalizeAlarmList, normalizeHeartRateAlarm, normalizeSpo2Alarm } from "./normalizers";
import { validateAlarm, validateDeleteAlarm, validateHeartRateAlarm, validateSpo2Alarm } from "./validators";
import type { DeviceAlarm, HeartRateAlarm, OperationStatus, Spo2Alarm } from "@/types/index";
import { deepCamelKeys } from "@/normalizers/deep-keys";

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
        this.ctx.emit("alarm_data", { device_id: this.ctx.connectedDeviceId(), alarms }),
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
        this.ctx.emit("heart_rate_alarm_data", { device_id: this.ctx.connectedDeviceId() ?? "", data }),
    });
  }

  setHeartRateAlarm(alarm: HeartRateAlarm): Promise<OperationStatus> {
    return this.call({
      validate: () => validateHeartRateAlarm(alarm),
      invoke: () => this.ctx.native.setHeartRateAlarm(deepCamelKeys(alarm) as HeartRateAlarm),
      afterSuccess: () =>
        this.ctx.emit("heart_rate_alarm_data", { device_id: this.ctx.connectedDeviceId() ?? "", data: alarm }),
    });
  }

  readSpo2Alarm(): Promise<Spo2Alarm> {
    return this.call({
      invoke: () => this.ctx.native.readSpo2Alarm(),
      normalize: normalizeSpo2Alarm,
      afterSuccess: (data) =>
        this.ctx.emit("spo2_alarm_data", { device_id: this.ctx.connectedDeviceId() ?? "", data }),
    });
  }

  setSpo2Alarm(alarm: Spo2Alarm): Promise<OperationStatus> {
    return this.call({
      validate: () => validateSpo2Alarm(alarm),
      invoke: () => this.ctx.native.setSpo2Alarm(deepCamelKeys(alarm) as Spo2Alarm),
      afterSuccess: () =>
        this.ctx.emit("spo2_alarm_data", { device_id: this.ctx.connectedDeviceId() ?? "", data: alarm }),
    });
  }
}
