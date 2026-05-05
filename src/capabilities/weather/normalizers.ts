import type { WeatherSettings, WeatherUnit } from "@/types/index";
import { isRecord, toInt, toBoolean, toStringValue } from "@/normalizers/primitives";

/** Normalizes native `WeatherStatusData` / `VPWeatherConfigModel` read result. */
export function normalizeWeatherSettings(value: unknown): WeatherSettings {
  const record = isRecord(value) ? value : {};
  const unitRaw = toStringValue(record.unit, 'C').toUpperCase();
  const unit: WeatherUnit = unitRaw === 'F' ? 'F' : 'C';
  return {
    is_open: toBoolean(record.isOpen ?? record.is_open),
    unit,
    crc: toInt(record.crc),
  };
}
