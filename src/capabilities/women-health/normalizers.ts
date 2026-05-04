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
  if (record.menstrualLengthDays !== undefined && record.menstrualLengthDays !== null) {
    out.menstrualLengthDays = toInt(record.menstrualLengthDays);
  }
  if (record.menstrualCycleDays !== undefined && record.menstrualCycleDays !== null) {
    out.menstrualCycleDays = toInt(record.menstrualCycleDays);
  }
  const lmd = toStringValue(record.lastMenstrualDate, '');
  if (lmd !== '') out.lastMenstrualDate = lmd;
  const edd = toStringValue(record.expectedDeliveryDate, '');
  if (edd !== '') out.expectedDeliveryDate = edd;
  const bb = toStringValue(record.babyBirthday, '');
  if (bb !== '') out.babyBirthday = bb;
  const sexRaw = toStringValue(record.babySex, '').toLowerCase();
  if (sexRaw === 'male' || sexRaw === 'man') {
    out.babySex = 'male';
  } else if (sexRaw === 'female' || sexRaw === 'woman') {
    out.babySex = 'female';
  }
  if (record.currentMenstrualDays !== undefined && record.currentMenstrualDays !== null) {
    out.currentMenstrualDays = toInt(record.currentMenstrualDays);
  }
  const op = toStringValue(record.operationStatus, '');
  if (op !== '') out.operationStatus = op;
  return out;
}
