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
  const r = s as any;
  const menstrualLengthDays = s.menstrual_length_days ?? r.menstrualLengthDays;
  const menstrualCycleDays = s.menstrual_cycle_days ?? r.menstrualCycleDays;
  const lastMenstrualDate = s.last_menstrual_date ?? r.lastMenstrualDate;
  const expectedDeliveryDate = s.expected_delivery_date ?? r.expectedDeliveryDate;
  const babyBirthday = s.baby_birthday ?? r.babyBirthday;
  const babySex = s.baby_sex ?? r.babySex;

  if (menstrualLengthDays !== undefined) {
    requireInRange(menstrualLengthDays, 'menstrualLengthDays', 4, 28);
  }
  if (menstrualCycleDays !== undefined) {
    requireInRange(menstrualCycleDays, 'menstrualCycleDays', 15, 50);
  }
  if (lastMenstrualDate !== undefined && lastMenstrualDate !== '' && !YMD.test(lastMenstrualDate)) {
    throw { code: 'INVALID_ARGUMENT', message: 'lastMenstrualDate must be yyyy-MM-dd' };
  }
  if (expectedDeliveryDate !== undefined && expectedDeliveryDate !== '' && !YMD.test(expectedDeliveryDate)) {
    throw { code: 'INVALID_ARGUMENT', message: 'expectedDeliveryDate must be yyyy-MM-dd' };
  }
  if (babyBirthday !== undefined && babyBirthday !== '' && !YMD.test(babyBirthday)) {
    throw { code: 'INVALID_ARGUMENT', message: 'babyBirthday must be yyyy-MM-dd' };
  }
  if (babySex !== undefined) {
    const allowed: WomenHealthBabySex[] = ['female', 'male'];
    if (!allowed.includes(babySex)) {
      throw { code: 'INVALID_ARGUMENT', message: 'babySex must be female or male' };
    }
  }

  switch (s.status) {
    case 'menstrual':
    case 'pregnancy_prep':
      requireYmd(lastMenstrualDate, 'lastMenstrualDate');
      if (menstrualLengthDays === undefined) {
        throw { code: 'INVALID_ARGUMENT', message: 'menstrualLengthDays is required for this status' };
      }
      if (menstrualCycleDays === undefined) {
        throw { code: 'INVALID_ARGUMENT', message: 'menstrualCycleDays is required for this status' };
      }
      break;
    case 'pregnancy':
      requireYmd(lastMenstrualDate, 'lastMenstrualDate');
      requireYmd(expectedDeliveryDate, 'expectedDeliveryDate');
      break;
    case 'postpartum':
      requireYmd(lastMenstrualDate, 'lastMenstrualDate');
      requireYmd(babyBirthday, 'babyBirthday');
      if (menstrualLengthDays === undefined) {
        throw { code: 'INVALID_ARGUMENT', message: 'menstrualLengthDays is required for postpartum' };
      }
      if (menstrualCycleDays === undefined) {
        throw { code: 'INVALID_ARGUMENT', message: 'menstrualCycleDays is required for postpartum' };
      }
      if (babySex === undefined) {
        throw { code: 'INVALID_ARGUMENT', message: 'babySex is required for postpartum' };
      }
      break;
    default:
      break;
  }
}
