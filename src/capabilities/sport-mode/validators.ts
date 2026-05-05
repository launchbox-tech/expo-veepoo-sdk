import type { SportMode } from "@/types/index";
import { SPORT_MODE_ORDINALS } from "@/types/index";

export function validateSportMode(mode: unknown): asserts mode is SportMode {
  const idx = typeof mode === 'string' ? SPORT_MODE_ORDINALS.indexOf(mode) : -1;
  if (idx <= 0) {
    throw { code: 'INVALID_ARGUMENT', message: `mode must be a valid SportMode (not 'common' or unknown value)` };
  }
}
