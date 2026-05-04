import type { HalfHourData, OriginData, Spo2OriginData } from "../../types/index.js";
import { isRecord, toInt, toNumber, toStringValue } from "../../normalizers/primitives.js";

function normalizeOriginItem(value: Record<string, unknown>): OriginData {
  const rawBloodGlucose = toNumber(value.bloodGlucose ?? value.glucose);
  return {
    time: toStringValue(value.time),
    heartValue: toInt(value.heartValue),
    stepValue: toInt(value.stepValue),
    calValue: toNumber(value.calValue) ?? 0,
    disValue: toNumber(value.disValue) ?? 0,
    sportValue: toInt(value.sportValue),
    systolic: toInt(value.systolic ?? value.highValue),
    diastolic: toInt(value.diastolic ?? value.lowValue),
    spo2Value: toInt(value.spo2Value),
    tempValue: toNumber(value.tempValue) ?? 0,
    stressValue: toInt(value.stressValue ?? value.stress ?? value.pressure),
    met: toNumber(value.met) ?? 0,
    oxygens: Array.isArray(value.oxygens) ? value.oxygens.map((item) => toInt(item)) : undefined,
    ppgs: Array.isArray(value.ppgs) ? value.ppgs.map((item) => toInt(item)) : undefined,
    ecgs: Array.isArray(value.ecgs) ? value.ecgs.map((item) => toInt(item)) : undefined,
    resRates: Array.isArray(value.resRates) ? value.resRates.map((item) => toInt(item)) : undefined,
    sleepStates: Array.isArray(value.sleepStates)
      ? value.sleepStates.map((item) => toInt(item))
      : undefined,
    apneaResults: Array.isArray(value.apneaResults)
      ? value.apneaResults.map((item) => toInt(item))
      : undefined,
    hypoxiaTimes: Array.isArray(value.hypoxiaTimes)
      ? value.hypoxiaTimes.map((item) => toInt(item))
      : undefined,
    cardiacLoads: Array.isArray(value.cardiacLoads)
      ? value.cardiacLoads.map((item) => toInt(item))
      : undefined,
    bloodGlucose: rawBloodGlucose === undefined ? undefined : rawBloodGlucose,
  };
}

export function normalizeOriginDataList(value: unknown): OriginData[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter(isRecord)
    .map((item) => normalizeOriginItem(item))
    .sort((a, b) => a.time.localeCompare(b.time));
}

export function normalizeHalfHourData(value: unknown): HalfHourData {
  const record = isRecord(value) ? value : {};
  return {
    time: toStringValue(record.time),
    heartValue: toInt(record.heartValue),
    sportValue: toInt(record.sportValue),
    stepValue: toInt(record.stepValue),
    calValue: toNumber(record.calValue) ?? 0,
    disValue: toNumber(record.disValue) ?? 0,
    diastolic: toInt(record.diastolic),
    systolic: toInt(record.systolic),
    spo2Value: toInt(record.spo2Value),
    tempValue: toNumber(record.tempValue),
    stressValue: toInt(record.stressValue),
    met: toNumber(record.met),
  };
}

export function normalizeSpo2OriginData(value: unknown): Spo2OriginData {
  const record = isRecord(value) ? value : {};
  return {
    time: toStringValue(record.time),
    date: toStringValue(record.date),
    heartValue: toInt(record.heartValue),
    value: toInt(record.value),
    rate: toInt(record.rate),
    isHypoxia: toInt(record.isHypoxia),
    cardiacLoad: toInt(record.cardiacLoad),
    temp1: toInt(record.temp1),
    sportValue: toInt(record.sportValue),
    apneaResult: toInt(record.apneaResult),
    hypoxiaTime: toInt(record.hypoxiaTime),
    hypopnea: toInt(record.hypopnea),
    stepValue: toInt(record.stepValue),
    allPackNumber: toInt(record.allPackNumber),
    currentPackNumber: toInt(record.currentPackNumber),
  };
}
