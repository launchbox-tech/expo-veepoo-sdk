import type { BatteryInfo } from "../../types/index.js";
import { isRecord, toInt, toBoolean } from "../../normalizers/primitives.js";

export function normalizeBatteryInfo(value: unknown): BatteryInfo {
  const record = isRecord(value) ? value : {};
  const state = toInt(record.state);
  const chargeState =
    state === 0 ? 'normal'
    : state === 1 ? 'charging'
    : state === 2 ? 'lowPressure'
    : state === 3 ? 'full'
    : undefined;

  return {
    level: toInt(record.level, toInt(record.percent)),
    percent: toInt(record.percent, toInt(record.level)),
    powerModel: toInt(record.powerModel),
    state,
    bat: toInt(record.bat),
    isPercent: toBoolean(record.isPercent, true),
    isLowBattery: toBoolean(record.isLowBattery),
    chargeState,
  };
}
