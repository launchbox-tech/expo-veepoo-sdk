import type { CapabilityContext } from "../capabilities/shared/context";
/** Sedentary / long-sit reminder window and threshold. Vendor `LongSeatSetting` / `VPDeviceLongSeatModel`. */
export interface SedentaryReminderSettings {
    start_hour: number;
    start_minute: number;
    end_hour: number;
    end_minute: number;
    /** Minutes still before the Band reminds (vendor gate; typically 30–240). */
    threshold_minutes: number;
    enabled: boolean;
}
export interface SedentaryReminderNativeMethods {
    readSedentaryReminder(): Promise<unknown>;
    setSedentaryReminder(settings: SedentaryReminderSettings): Promise<void>;
}
export declare function normalizeSedentaryReminderSettings(value: unknown): SedentaryReminderSettings;
export declare class SedentaryReminderCapability {
    private readonly ctx;
    constructor(ctx: CapabilityContext<SedentaryReminderNativeMethods>);
    readSedentaryReminder(): Promise<SedentaryReminderSettings>;
    setSedentaryReminder(settings: SedentaryReminderSettings): Promise<void>;
}
//# sourceMappingURL=sedentary-reminder.d.ts.map