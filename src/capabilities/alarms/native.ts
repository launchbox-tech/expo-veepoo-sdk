import type { DeviceAlarm, HeartRateAlarm, OperationStatus, Spo2Alarm } from "@/types/index";

export interface AlarmNativeMethods {
  readAlarms(): Promise<unknown>;
  setAlarm(alarm: DeviceAlarm): Promise<OperationStatus>;
  deleteAlarm(alarmId: number): Promise<OperationStatus>;
  readHeartRateAlarm(): Promise<unknown>;
  setHeartRateAlarm(alarm: HeartRateAlarm): Promise<OperationStatus>;
  readSpo2Alarm(): Promise<unknown>;
  setSpo2Alarm(alarm: Spo2Alarm): Promise<OperationStatus>;
}
