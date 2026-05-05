import type { BatteryInfo } from "../../types/index.js";
import { isRecord, toInt, toBoolean } from "../../normalizers/primitives.js";

export function normalizeBatteryInfo(value: unknown): BatteryInfo {
  const record = isRecord(value) ? value : {};
  const state = toInt(record.state);
  const charge_state =
    state === 0 ? 'normal'
    : state === 1 ? 'charging'
    : state === 2 ? 'low_pressure'
    : state === 3 ? 'full'
    : undefined;

  return {
    level: toInt(record.level, toInt(record.percent)),
    percent: toInt(record.percent, toInt(record.level)),
    power_model: toInt(record.powerModel ?? record.power_model),
    state,
    bat: toInt(record.bat),
    is_percent: toBoolean(record.isPercent ?? record.is_percent, true),
    is_low_battery: toBoolean(record.isLowBattery ?? record.is_low_battery),
    charge_state,
  };
}
