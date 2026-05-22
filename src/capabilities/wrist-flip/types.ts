/** Raise-to-wake / wrist-flip screen. Vendor `NightTurnWristSetting` / `VPDeviceRaiseHandModel`. */
export interface WristFlipWakeSettings {
  enabled: boolean;
  start_hour: number;
  start_minute: number;
  end_hour: number;
  end_minute: number;
  /** Sensitivity 1–10 (`level` / `sensitive`); 0 on read may mean not supported. */
  sensitivity_level: number;
  /** Android read: `isSupportCustomSettingTime`. */
  supports_custom_time_window?: boolean;
  /** Vendor default sensitivity when non-zero. */
  default_sensitivity_level?: number;
}
