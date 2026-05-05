import type { WatchFaceDialType, WatchFaceStyleSettings } from "@/types/index";
import { requireInRange } from "@/validators/shared";

const WATCH_FACE_DIAL_TYPES = new Set<WatchFaceDialType>(['default', 'market', 'photo']);

function requireWatchFaceDialType(value: unknown, field: string): asserts value is WatchFaceDialType {
  if (typeof value !== 'string' || !WATCH_FACE_DIAL_TYPES.has(value as WatchFaceDialType)) {
    throw { code: 'INVALID_ARGUMENT', message: `${field} must be 'default', 'market', or 'photo'` };
  }
}

/** Optional filter for read; native may still return a unified snapshot (Android). */
export function validateReadWatchFaceStyleOptions(options?: { dial_type?: WatchFaceDialType } | { dialType?: WatchFaceDialType }): void {
  const dialType = (options as any)?.dial_type ?? (options as any)?.dialType;
  if (dialType !== undefined) {
    requireWatchFaceDialType(dialType, 'dialType');
  }
}

/** Vendor slot index; cap loosely — some Bands expose large enumerations. */
export function validateWatchFaceStyleSettings(s: WatchFaceStyleSettings): void {
  const r = s as any;
  requireInRange(s.screen_index ?? r.screenIndex, 'screenIndex', 0, 65_535);
  const dialType = s.dial_type ?? r.dialType;
  if (dialType !== undefined) {
    requireWatchFaceDialType(dialType, 'dialType');
  }
}
