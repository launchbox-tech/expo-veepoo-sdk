import type { DaySummaryData } from "@/types/index";
import { isRecord, toInt, toNumber, toStringValue } from "@/normalizers/primitives";

export function normalizeDaySummaryData(value: unknown): DaySummaryData {
  const record = isRecord(value) ? value : {};
  return {
    date: toStringValue(record.date),
    all_step: toInt(record.allStep ?? record.all_step),
    sport_list: Array.isArray(record.sportList ?? record.sport_list)
      ? ((record.sportList ?? record.sport_list) as unknown[])
          .filter(isRecord)
          .map((item) => ({
            time: toStringValue(item.time),
            step: toInt(item.step),
            cal: toNumber(item.cal) ?? 0,
            dis: toNumber(item.dis) ?? 0,
          }))
      : [],
    rate_list: Array.isArray(record.rateList ?? record.rate_list)
      ? ((record.rateList ?? record.rate_list) as unknown[])
          .filter(isRecord)
          .map((item) => ({
            time: toStringValue(item.time),
            rate: toInt(item.rate),
          }))
      : [],
    bp_list: Array.isArray(record.bpList ?? record.bp_list)
      ? ((record.bpList ?? record.bp_list) as unknown[])
          .filter(isRecord)
          .map((item) => ({
            time: toStringValue(item.time),
            high: toInt(item.high),
            low: toInt(item.low),
          }))
      : [],
  };
}
