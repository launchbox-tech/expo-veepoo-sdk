import type { WeatherSettings, WeatherUnit } from "../../types/index.js";
import { isRecord, toInt, toBoolean, toStringValue } from "../../normalizers/primitives.js";

/** Normalizes native `WeatherStatusData` / `VPWeatherConfigModel` read result. */
export function normalizeWeatherSettings(value: unknown): WeatherSettings {
  const record = isRecord(value) ? value : {};
  const unitRaw = toStringValue(record.unit, 'C').toUpperCase();
  const unit: WeatherUnit = unitRaw === 'F' ? 'F' : 'C';
  return {
    isOpen: toBoolean(record.isOpen),
    unit,
    crc: toInt(record.crc),
  };
}
