import type { SportStepData } from "@/types/index";
import { isRecord, toInt, toNumber, toStringValue } from "@/normalizers/primitives";

export function normalizeSportStepData(value: unknown): SportStepData {
  const record = isRecord(value) ? value : {};
  return {
    date: toStringValue(record.date),
    step_count: toInt(record.stepCount ?? record.step_count ?? record.step),
    distance: toNumber(record.distance ?? record.dis) ?? 0,
    calories: toNumber(record.calories ?? record.kcal ?? record.cal) ?? 0,
  };
}
