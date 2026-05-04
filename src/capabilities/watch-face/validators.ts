import type { WatchFaceDialType, WatchFaceStyleSettings } from "../../types/index.js";
import { requireInRange } from "../../validators/shared.js";

const WATCH_FACE_DIAL_TYPES = new Set<WatchFaceDialType>(['default', 'market', 'photo']);

function requireWatchFaceDialType(value: unknown, field: string): asserts value is WatchFaceDialType {
  if (typeof value !== 'string' || !WATCH_FACE_DIAL_TYPES.has(value as WatchFaceDialType)) {
    throw { code: 'INVALID_ARGUMENT', message: `${field} must be 'default', 'market', or 'photo'` };
  }
}

/** Optional filter for read; native may still return a unified snapshot (Android). */
export function validateReadWatchFaceStyleOptions(options?: { dialType?: WatchFaceDialType }): void {
  if (options?.dialType !== undefined) {
    requireWatchFaceDialType(options.dialType, 'dialType');
  }
}

/** Vendor slot index; cap loosely — some Bands expose large enumerations. */
export function validateWatchFaceStyleSettings(s: WatchFaceStyleSettings): void {
  requireInRange(s.screenIndex, 'screenIndex', 0, 65_535);
  if (s.dialType !== undefined) {
    requireWatchFaceDialType(s.dialType, 'dialType');
  }
}
