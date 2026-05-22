export type ChargeState = 'normal' | 'charging' | 'low_pressure' | 'full';

export interface BatteryInfo {
  level: number;
  percent: number;
  power_model: number;
  state: number;
  bat: number;
  is_percent: boolean;
  is_low_battery: boolean;
  charge_state?: ChargeState;
}
