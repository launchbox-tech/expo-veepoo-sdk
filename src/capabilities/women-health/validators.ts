import type {
  WomenHealthBabySex,
  WomenHealthSettings,
  WomenHealthStatus,
} from "../../types/index.js";
import { requireInRange } from "../../validators/shared.js";

const YMD = /^\d{4}-\d{2}-\d{2}$/;

const VALID_WOMEN_HEALTH_STATUS = new Set<WomenHealthStatus>([
  'none',
  'menstrual',
  'pregnancy_prep',
  'pregnancy',
  'postpartum',
]);

function requireYmd(value: string | undefined, field: string): void {
  if (value === undefined || value === '') {
    throw { code: 'INVALID_ARGUMENT', message: `${field} is required` };
  }
  if (!YMD.test(value)) {
    throw { code: 'INVALID_ARGUMENT', message: `${field} must be yyyy-MM-dd` };
  }
}

/** Validates payload for `setWomenHealthSettings` (native `WomenSetting` / `VPDeviceFemaleModel`). */
export function validateWomenHealthSettings(s: WomenHealthSettings): void {
  if (!VALID_WOMEN_HEALTH_STATUS.has(s.status)) {
    throw { code: 'INVALID_ARGUMENT', message: 'status must be a valid WomenHealthStatus' };
  }
  if (s.menstrualLengthDays !== undefined) {
    requireInRange(s.menstrualLengthDays, 'menstrualLengthDays', 4, 28);
  }
  if (s.menstrualCycleDays !== undefined) {
    requireInRange(s.menstrualCycleDays, 'menstrualCycleDays', 15, 50);
  }
  if (s.lastMenstrualDate !== undefined && s.lastMenstrualDate !== '' && !YMD.test(s.lastMenstrualDate)) {
    throw { code: 'INVALID_ARGUMENT', message: 'lastMenstrualDate must be yyyy-MM-dd' };
  }
  if (
    s.expectedDeliveryDate !== undefined &&
    s.expectedDeliveryDate !== '' &&
    !YMD.test(s.expectedDeliveryDate)
  ) {
    throw { code: 'INVALID_ARGUMENT', message: 'expectedDeliveryDate must be yyyy-MM-dd' };
  }
  if (s.babyBirthday !== undefined && s.babyBirthday !== '' && !YMD.test(s.babyBirthday)) {
    throw { code: 'INVALID_ARGUMENT', message: 'babyBirthday must be yyyy-MM-dd' };
  }
  if (s.babySex !== undefined) {
    const allowed: WomenHealthBabySex[] = ['female', 'male'];
    if (!allowed.includes(s.babySex)) {
      throw { code: 'INVALID_ARGUMENT', message: 'babySex must be female or male' };
    }
  }

  switch (s.status) {
    case 'menstrual':
    case 'pregnancy_prep':
      requireYmd(s.lastMenstrualDate, 'lastMenstrualDate');
      if (s.menstrualLengthDays === undefined) {
        throw { code: 'INVALID_ARGUMENT', message: 'menstrualLengthDays is required for this status' };
      }
      if (s.menstrualCycleDays === undefined) {
        throw { code: 'INVALID_ARGUMENT', message: 'menstrualCycleDays is required for this status' };
      }
      break;
    case 'pregnancy':
      requireYmd(s.lastMenstrualDate, 'lastMenstrualDate');
      requireYmd(s.expectedDeliveryDate, 'expectedDeliveryDate');
      break;
    case 'postpartum':
      requireYmd(s.lastMenstrualDate, 'lastMenstrualDate');
      requireYmd(s.babyBirthday, 'babyBirthday');
      if (s.menstrualLengthDays === undefined) {
        throw { code: 'INVALID_ARGUMENT', message: 'menstrualLengthDays is required for postpartum' };
      }
      if (s.menstrualCycleDays === undefined) {
        throw { code: 'INVALID_ARGUMENT', message: 'menstrualCycleDays is required for postpartum' };
      }
      if (s.babySex === undefined) {
        throw { code: 'INVALID_ARGUMENT', message: 'babySex is required for postpartum' };
      }
      break;
    default:
      break;
  }
}
