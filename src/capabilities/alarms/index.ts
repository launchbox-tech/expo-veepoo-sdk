import type { CapabilityContext } from "@/capabilities/shared/context";
import type { AlarmNativeMethods } from "./native";
import { normalizeAlarmList, normalizeHeartRateAlarm, normalizeSpo2Alarm } from "./normalizers";
import { validateAlarm, validateDeleteAlarm, validateHeartRateAlarm, validateSpo2Alarm } from "./validators";
import type { DeviceAlarm, HeartRateAlarm, OperationStatus, Spo2Alarm } from "@/types/index";
import { deepCamelKeys } from "@/shared/deep-keys";

export class AlarmsCapability {
  constructor(private readonly ctx: CapabilityContext<AlarmNativeMethods>) {}

  readAlarms(): Promise<DeviceAlarm[]> {
    return this.ctx.invoke({
      invoke: () => this.ctx.native.readAlarms(),
      normalize: normalizeAlarmList,
      afterSuccess: (alarms) =>
        this.ctx.emit("alarm_data", { device_id: this.ctx.connectedDeviceId(), alarms }),
    });
  }

  setAlarm(alarm: DeviceAlarm): Promise<OperationStatus> {
    return this.ctx.invoke({
      validate: () => validateAlarm(alarm),
      invoke: () => this.ctx.native.setAlarm(deepCamelKeys(alarm) as DeviceAlarm),
    });
  }

  deleteAlarm(alarmId: number): Promise<OperationStatus> {
    return this.ctx.invoke({
      validate: () => validateDeleteAlarm(alarmId),
      invoke: () => this.ctx.native.deleteAlarm(alarmId),
    });
  }

  readHeartRateAlarm(): Promise<HeartRateAlarm> {
    return this.ctx.invoke({
      invoke: () => this.ctx.native.readHeartRateAlarm(),
      normalize: normalizeHeartRateAlarm,
      afterSuccess: (data) =>
        this.ctx.emit("heart_rate_alarm_data", { device_id: this.ctx.connectedDeviceId() ?? "", data }),
    });
  }

  setHeartRateAlarm(alarm: HeartRateAlarm): Promise<OperationStatus> {
    return this.ctx.invoke({
      validate: () => validateHeartRateAlarm(alarm),
      invoke: () => this.ctx.native.setHeartRateAlarm(deepCamelKeys(alarm) as HeartRateAlarm),
      afterSuccess: () =>
        this.ctx.emit("heart_rate_alarm_data", { device_id: this.ctx.connectedDeviceId() ?? "", data: alarm }),
    });
  }

  readSpo2Alarm(): Promise<Spo2Alarm> {
    return this.ctx.invoke({
      invoke: () => this.ctx.native.readSpo2Alarm(),
      normalize: normalizeSpo2Alarm,
      afterSuccess: (data) =>
        this.ctx.emit("spo2_alarm_data", { device_id: this.ctx.connectedDeviceId() ?? "", data }),
    });
  }

  setSpo2Alarm(alarm: Spo2Alarm): Promise<OperationStatus> {
    return this.ctx.invoke({
      validate: () => validateSpo2Alarm(alarm),
      invoke: () => this.ctx.native.setSpo2Alarm(deepCamelKeys(alarm) as Spo2Alarm),
      afterSuccess: () =>
        this.ctx.emit("spo2_alarm_data", { device_id: this.ctx.connectedDeviceId() ?? "", data: alarm }),
    });
  }
}
