/** Screen brightness schedule (night window + day levels). Vendor `ScreenSetting` / `VPDeviceBrightModel`. */
export interface ScreenLightSettings {
  night_start_hour: number;
  night_start_minute: number;
  night_end_hour: number;
  night_end_minute: number;
  night_level: number;
  day_level: number;
  auto_adjust: boolean;
  max_level: number;
  /** iOS: last manual day brightness gear */
  last_manual_day_level?: number;
}

/** Bright screen duration (seconds). */
export interface ScreenLightDuration {
  current_seconds: number;
  min_seconds: number;
  max_seconds: number;
  recommend_seconds?: number;
}
