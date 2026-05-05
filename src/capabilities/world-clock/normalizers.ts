import type { WorldClockEntry } from "@/types/index";
import { isRecord, toInt } from "@/normalizers/primitives";

export function normalizeWorldClockList(value: unknown): WorldClockEntry[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item) => isRecord(item))
    .map((item) => {
      const entry: WorldClockEntry = {
        timezone_offset_minutes: toInt(
          item.timezone_offset_minutes ?? item.timezoneOffsetMinutes,
          0,
        ),
        city_name: typeof item.city_name === 'string'
          ? item.city_name
          : typeof item.cityName === 'string'
            ? item.cityName
            : '',
      };
      const dstRaw = item.dst_offset ?? item.dstOffset;
      if (dstRaw !== undefined && dstRaw !== null) {
        entry.dst_offset = toInt(dstRaw);
      }
      return entry;
    });
}
