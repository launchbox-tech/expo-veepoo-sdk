import type { PersonalInfo, VeepooError } from "../../types/index.js";
import { requireInRange } from "../../validators/shared.js";

export function validatePersonalInfo(info: PersonalInfo): void {
  if (info.sex !== 0 && info.sex !== 1) {
    throw { code: 'INVALID_ARGUMENT', message: 'sex must be 0 or 1' } satisfies VeepooError;
  }
  requireInRange(info.height, 'height', 50, 300);
  requireInRange(info.weight, 'weight', 1, 500);
  requireInRange(info.age, 'age', 1, 120);
  requireInRange(info.stepAim, 'stepAim', 1, 100_000);
  requireInRange(info.sleepAim, 'sleepAim', 0, 1_440);
}
