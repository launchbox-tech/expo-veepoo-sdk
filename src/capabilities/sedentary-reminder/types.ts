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
