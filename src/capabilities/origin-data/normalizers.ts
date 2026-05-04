import type { OriginData } from "../../types/index.js";
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
