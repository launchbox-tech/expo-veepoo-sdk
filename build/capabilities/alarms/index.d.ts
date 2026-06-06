import type { CapabilityContext } from "../../capabilities/shared/context";
import type { AlarmNativeMethods } from "./native";
import type { DeviceAlarm, HeartRateAlarm, OperationStatus, Spo2Alarm } from "../../types/index";
export declare class AlarmsCapability {
    private readonly ctx;
    constructor(ctx: CapabilityContext<AlarmNativeMethods>);
    readAlarms(): Promise<DeviceAlarm[]>;
    setAlarm(alarm: DeviceAlarm): Promise<OperationStatus>;
    deleteAlarm(alarmId: number): Promise<OperationStatus>;
    readHeartRateAlarm(): Promise<HeartRateAlarm>;
    setHeartRateAlarm(alarm: HeartRateAlarm): Promise<OperationStatus>;
    readSpo2Alarm(): Promise<Spo2Alarm>;
    setSpo2Alarm(alarm: Spo2Alarm): Promise<OperationStatus>;
}
//# sourceMappingURL=index.d.ts.map