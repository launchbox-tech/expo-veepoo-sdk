import type { DeviceAlarm, HeartRateAlarm, OperationStatus } from "../../types/index.js";

export interface AlarmNativeMethods {
  readAlarms(): Promise<unknown>;
  setAlarm(alarm: DeviceAlarm): Promise<OperationStatus>;
  deleteAlarm(alarmId: number): Promise<OperationStatus>;
  readHeartRateAlarm(): Promise<unknown>;
  setHeartRateAlarm(alarm: HeartRateAlarm): Promise<OperationStatus>;
}
