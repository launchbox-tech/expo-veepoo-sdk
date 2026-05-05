import type { WomenHealthSettings, WomenHealthStatus } from "../../types/index.js";
import { isRecord, toInt, toStringValue } from "../../normalizers/primitives.js";

const WH_STATUSES: readonly WomenHealthStatus[] = [
  'none',
  'menstrual',
  'pregnancy_prep',
  'pregnancy',
  'postpartum',
];

function normalizeWomenHealthStatus(raw: unknown): WomenHealthStatus {
  const k = String(raw ?? 'none')
    .trim()
    .toLowerCase();
  const aliases: Record<string, WomenHealthStatus> = {
    menes: 'menstrual',
    preready: 'pregnancy_prep',
    preing: 'pregnancy',
    gestation: 'pregnancy',
    mamami: 'postpartum',
    baoma: 'postpartum',
    mommy: 'postpartum',
  };
  const mapped = aliases[k] ?? (WH_STATUSES.includes(k as WomenHealthStatus) ? (k as WomenHealthStatus) : null);
  return mapped ?? 'none';
}

export function normalizeWomenHealthSettings(value: unknown): WomenHealthSettings {
  const record = isRecord(value) ? value : {};
  const out: WomenHealthSettings = {
    status: normalizeWomenHealthStatus(record.status),
  };
  const mld = record.menstrualLengthDays ?? record.menstrual_length_days;
  if (mld !== undefined && mld !== null) {
    out.menstrual_length_days = toInt(mld);
  }
  const mcd = record.menstrualCycleDays ?? record.menstrual_cycle_days;
  if (mcd !== undefined && mcd !== null) {
    out.menstrual_cycle_days = toInt(mcd);
  }
  const lmd = toStringValue(record.lastMenstrualDate ?? record.last_menstrual_date, '');
  if (lmd !== '') out.last_menstrual_date = lmd;
  const edd = toStringValue(record.expectedDeliveryDate ?? record.expected_delivery_date, '');
  if (edd !== '') out.expected_delivery_date = edd;
  const bb = toStringValue(record.babyBirthday ?? record.baby_birthday, '');
  if (bb !== '') out.baby_birthday = bb;
  const sexRaw = toStringValue(record.babySex ?? record.baby_sex, '').toLowerCase();
  if (sexRaw === 'male' || sexRaw === 'man') {
    out.baby_sex = 'male';
  } else if (sexRaw === 'female' || sexRaw === 'woman') {
    out.baby_sex = 'female';
  }
  const cmd = record.currentMenstrualDays ?? record.current_menstrual_days;
  if (cmd !== undefined && cmd !== null) {
    out.current_menstrual_days = toInt(cmd);
  }
  const op = toStringValue(record.operationStatus ?? record.operation_status, '');
  if (op !== '') out.operation_status = op;
  return out;
}
