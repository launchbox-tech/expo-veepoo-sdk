import type { CameraShutterStatus } from "../../types/index.js";

/**
 * Normalizes camera shutter status from native.
 * Android: ECameraStatus string (TAKEPHOTO_CAN / TAKEPHOTO_CAN_NOT or already mapped).
 * iOS: 'canTake' / 'cannotTake' passed directly.
 */
export function normalizeCameraShutterStatus(value: unknown): CameraShutterStatus {
  const s = typeof value === 'string' ? value : '';
  if (s === 'canTake' || s === 'TAKEPHOTO_CAN') return 'canTake';
  return 'cannotTake';
}
