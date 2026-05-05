import type { SportMode, SportModeStatus } from "@/types/index";
import { SPORT_MODE_ORDINALS } from "@/types/index";
import { isRecord, toBoolean } from "@/normalizers/primitives";

export function normalizeSportModeStatus(value: unknown): SportModeStatus {
  const record = isRecord(value) ? value : {};

  const rawMode = record.mode ?? record.sportMode ?? record.sport_mode;

  let mode: SportMode | null = null;
  let is_active = false;

  if (typeof rawMode === 'number') {
    if (rawMode === 0) {
      mode = null;
      is_active = false;
    } else {
      const name = SPORT_MODE_ORDINALS[rawMode];
      if (name && name !== 'common') {
        mode = name as SportMode;
        is_active = true;
      }
    }
  } else if (typeof rawMode === 'string') {
    if (rawMode === 'common' || rawMode === '') {
      mode = null;
      is_active = false;
    } else {
      mode = rawMode as SportMode;
      is_active = true;
    }
  }

  // Override is_active with explicit field if present
  const rawIsActive = record.isActive ?? record.is_active;
  if (rawIsActive !== undefined) {
    is_active = toBoolean(rawIsActive, is_active);
  }

  return { mode, is_active };
}
