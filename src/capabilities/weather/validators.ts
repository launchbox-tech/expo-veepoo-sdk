import type {
  WeatherData,
  WeatherDailyForecast,
  WeatherHourlyForecast,
  WeatherSettings,
} from "@/types/index";
import { requireInRange } from "@/validators/shared";

const DATETIME_RE = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function requireDatetime(value: string, field: string): void {
  if (!DATETIME_RE.test(value)) {
    throw { code: 'INVALID_ARGUMENT', message: `${field} must be "YYYY-MM-DD HH:mm"` };
  }
}

function requireDate(value: string, field: string): void {
  if (!DATE_RE.test(value)) {
    throw { code: 'INVALID_ARGUMENT', message: `${field} must be "YYYY-MM-DD"` };
  }
}

function validateHourlyForecast(h: WeatherHourlyForecast, i: number): void {
  requireDatetime(h.time, `hourly[${i}].time`);
  requireInRange(h.weather_state, `hourly[${i}].weatherState`, 0, 155);
  requireInRange(h.uv_index, `hourly[${i}].uvIndex`, 0, 20);
  if (h.visibility_m < 0) {
    throw { code: 'INVALID_ARGUMENT', message: `hourly[${i}].visibilityM must be >= 0` };
  }
}

function validateDailyForecast(d: WeatherDailyForecast, i: number): void {
  requireDate(d.date, `daily[${i}].date`);
  requireInRange(d.weather_state_day, `daily[${i}].weatherStateDay`, 0, 155);
  requireInRange(d.weather_state_night, `daily[${i}].weatherStateNight`, 0, 155);
  if (d.uv_index !== undefined) {
    requireInRange(d.uv_index, `daily[${i}].uvIndex`, 0, 20);
  }
  if (d.visibility_m !== undefined && d.visibility_m < 0) {
    throw { code: 'INVALID_ARGUMENT', message: `daily[${i}].visibilityM must be >= 0` };
  }
}

export function validateWeatherSettings(s: WeatherSettings): void {
  if (s.unit !== 'C' && s.unit !== 'F') {
    throw { code: 'INVALID_ARGUMENT', message: 'unit must be "C" or "F"' };
  }
  if (!Number.isInteger(s.crc) || s.crc < 0) {
    throw { code: 'INVALID_ARGUMENT', message: 'crc must be a non-negative integer' };
  }
}

export function validateWeatherData(d: WeatherData): void {
  if (!d.city_name || d.city_name.trim().length === 0) {
    throw { code: 'INVALID_ARGUMENT', message: 'cityName is required' };
  }
  if (new TextEncoder().encode(d.city_name).byteLength > 64) {
    throw { code: 'INVALID_ARGUMENT', message: 'cityName exceeds 64 bytes' };
  }
  if (!Number.isInteger(d.crc) || d.crc < 0) {
    throw { code: 'INVALID_ARGUMENT', message: 'crc must be a non-negative integer' };
  }
  if (!Array.isArray(d.hourly) || d.hourly.length === 0) {
    throw { code: 'INVALID_ARGUMENT', message: 'hourly must be a non-empty array' };
  }
  if (!Array.isArray(d.daily) || d.daily.length === 0) {
    throw { code: 'INVALID_ARGUMENT', message: 'daily must be a non-empty array' };
  }
  d.hourly.forEach((h, i) => validateHourlyForecast(h, i));
  d.daily.forEach((day, i) => validateDailyForecast(day, i));
}
