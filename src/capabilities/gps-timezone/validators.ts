import type { GPSAndTimezoneData } from "@/types/index";

export function validateGPSAndTimezoneData(data: GPSAndTimezoneData): void {
  if (typeof data.latitude !== 'number' || !Number.isFinite(data.latitude) || data.latitude < -90 || data.latitude > 90) {
    throw { code: 'INVALID_ARGUMENT', message: 'latitude must be a number between -90 and 90' };
  }
  if (typeof data.longitude !== 'number' || !Number.isFinite(data.longitude) || data.longitude < -180 || data.longitude > 180) {
    throw { code: 'INVALID_ARGUMENT', message: 'longitude must be a number between -180 and 180' };
  }
  if (data.altitude !== undefined && (typeof data.altitude !== 'number' || !Number.isFinite(data.altitude))) {
    throw { code: 'INVALID_ARGUMENT', message: 'altitude must be a finite number when provided' };
  }
  const timezoneOffsetMinutes = data.timezone_offset_minutes;
  if (!Number.isInteger(timezoneOffsetMinutes) || timezoneOffsetMinutes % 15 !== 0) {
    throw { code: 'INVALID_ARGUMENT', message: 'timezoneOffsetMinutes must be an integer multiple of 15' };
  }
}
