import type { SportStepData } from "../../types/index.js";
import { isRecord, toInt, toNumber, toStringValue } from "../../normalizers/primitives.js";

export function normalizeSportStepData(value: unknown): SportStepData {
  const record = isRecord(value) ? value : {};
  return {
    date: toStringValue(record.date),
    stepCount: toInt(record.stepCount ?? record.step),
    distance: toNumber(record.distance ?? record.dis) ?? 0,
    calories: toNumber(record.calories ?? record.kcal ?? record.cal) ?? 0,
  };
}
