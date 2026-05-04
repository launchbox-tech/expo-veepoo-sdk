import type { WatchFaceDialType, WatchFaceStyle } from "../../types/index.js";
import { isRecord, toInt, toStringValue } from "../../normalizers/primitives.js";

export function normalizeWatchFaceStyle(value: unknown): WatchFaceStyle {
  const record = isRecord(value) ? value : {};
  const raw = String(toStringValue(record.dialType, 'default')).toLowerCase();
  const dialType: WatchFaceDialType =
    raw === 'market' || raw === 'photo' ? raw : 'default';
  const op = record.operationSuccess;
  return {
    dialType,
    screenIndex: toInt(record.screenIndex),
    ...(typeof op === 'boolean' ? { operationSuccess: op } : {}),
  };
}
