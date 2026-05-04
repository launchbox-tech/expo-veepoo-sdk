import type { DaySummaryData } from "../../types/index.js";
import { isRecord, toInt, toNumber, toStringValue } from "../../normalizers/primitives.js";

export function normalizeDaySummaryData(value: unknown): DaySummaryData {
  const record = isRecord(value) ? value : {};
  return {
    date: toStringValue(record.date),
    allStep: toInt(record.allStep),
    sportList: Array.isArray(record.sportList)
      ? record.sportList
          .filter(isRecord)
          .map((item) => ({
            time: toStringValue(item.time),
            step: toInt(item.step),
            cal: toNumber(item.cal) ?? 0,
            dis: toNumber(item.dis) ?? 0,
          }))
      : [],
    rateList: Array.isArray(record.rateList)
      ? record.rateList
          .filter(isRecord)
          .map((item) => ({
            time: toStringValue(item.time),
            rate: toInt(item.rate),
          }))
      : [],
    bpList: Array.isArray(record.bpList)
      ? record.bpList
          .filter(isRecord)
          .map((item) => ({
            time: toStringValue(item.time),
            high: toInt(item.high),
            low: toInt(item.low),
          }))
      : [],
  };
}
