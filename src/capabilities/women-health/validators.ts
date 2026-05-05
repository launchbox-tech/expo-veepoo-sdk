import type {
  WomenHealthBabySex,
  WomenHealthSettings,
  WomenHealthStatus,
} from "@/types/index";
import { requireInRange } from "@/validators/shared";

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
  if (s.menstrual_length_days !== undefined) {
    requireInRange(s.menstrual_length_days, 'menstrualLengthDays', 4, 28);
  }
  if (s.menstrual_cycle_days !== undefined) {
    requireInRange(s.menstrual_cycle_days, 'menstrualCycleDays', 15, 50);
  }
  if (s.last_menstrual_date !== undefined && s.last_menstrual_date !== '' && !YMD.test(s.last_menstrual_date)) {
    throw { code: 'INVALID_ARGUMENT', message: 'lastMenstrualDate must be yyyy-MM-dd' };
  }
  if (s.expected_delivery_date !== undefined && s.expected_delivery_date !== '' && !YMD.test(s.expected_delivery_date)) {
    throw { code: 'INVALID_ARGUMENT', message: 'expectedDeliveryDate must be yyyy-MM-dd' };
  }
  if (s.baby_birthday !== undefined && s.baby_birthday !== '' && !YMD.test(s.baby_birthday)) {
    throw { code: 'INVALID_ARGUMENT', message: 'babyBirthday must be yyyy-MM-dd' };
  }
  if (s.baby_sex !== undefined) {
    const allowed: WomenHealthBabySex[] = ['female', 'male'];
    if (!allowed.includes(s.baby_sex)) {
      throw { code: 'INVALID_ARGUMENT', message: 'babySex must be female or male' };
    }
  }

  switch (s.status) {
    case 'menstrual':
    case 'pregnancy_prep':
      requireYmd(s.last_menstrual_date, 'lastMenstrualDate');
      if (s.menstrual_length_days === undefined) {
        throw { code: 'INVALID_ARGUMENT', message: 'menstrualLengthDays is required for this status' };
      }
      if (s.menstrual_cycle_days === undefined) {
        throw { code: 'INVALID_ARGUMENT', message: 'menstrualCycleDays is required for this status' };
      }
      break;
    case 'pregnancy':
      requireYmd(s.last_menstrual_date, 'lastMenstrualDate');
      requireYmd(s.expected_delivery_date, 'expectedDeliveryDate');
      break;
    case 'postpartum':
      requireYmd(s.last_menstrual_date, 'lastMenstrualDate');
      requireYmd(s.baby_birthday, 'babyBirthday');
      if (s.menstrual_length_days === undefined) {
        throw { code: 'INVALID_ARGUMENT', message: 'menstrualLengthDays is required for postpartum' };
      }
      if (s.menstrual_cycle_days === undefined) {
        throw { code: 'INVALID_ARGUMENT', message: 'menstrualCycleDays is required for postpartum' };
      }
      if (s.baby_sex === undefined) {
        throw { code: 'INVALID_ARGUMENT', message: 'babySex is required for postpartum' };
      }
      break;
    default:
      break;
  }
}
