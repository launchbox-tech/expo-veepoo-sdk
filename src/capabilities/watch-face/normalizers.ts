import type { WatchFaceDialType, WatchFaceStyle } from "@/types/index";
import { isRecord, toInt, toStringValue } from "@/normalizers/primitives";

export function normalizeWatchFaceStyle(value: unknown): WatchFaceStyle {
  const record = isRecord(value) ? value : {};
  const raw = String(toStringValue(record.dialType ?? record.dial_type, 'default')).toLowerCase();
  const dial_type: WatchFaceDialType =
    raw === 'market' || raw === 'photo' ? raw : 'default';
  const op = record.operationSuccess ?? record.operation_success;
  return {
    dial_type,
    screen_index: toInt(record.screenIndex ?? record.screen_index),
    ...(typeof op === 'boolean' ? { operation_success: op } : {}),
  };
}
