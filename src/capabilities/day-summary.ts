import type { CapabilityContext } from "@/capabilities/shared/context";
import { isRecord, toInt, toNumber, toStringValue } from "@/shared/primitives";

// ── Types ────────────────────────────────────────────────────────────────────

export interface DaySummaryData {
  date: string;
  all_step: number;
  sport_list: Array<{
    time: string;
    step: number;
    cal: number;
    dis: number;
  }>;
  rate_list: Array<{
    time: string;
    rate: number;
  }>;
  bp_list: Array<{
    time: string;
    high: number;
    low: number;
  }>;
}

// ── Native methods ──────────────────────────────────────────────────────────

export interface DaySummaryNativeMethods {
  readDaySummaryData(dayOffset?: number): Promise<unknown>;
}

// ── Normalizers ─────────────────────────────────────────────────────────────

function normalizeSportList(value: unknown): DaySummaryData['sport_list'] {
  if (!Array.isArray(value)) return [];
  const items: DaySummaryData['sport_list'] = [];
  for (const item of value) {
    if (!isRecord(item)) continue;
    items.push({
      time: toStringValue(item.time),
      step: toInt(item.step),
      cal: toNumber(item.cal) ?? 0,
      dis: toNumber(item.dis) ?? 0,
    });
  }
  return items;
}

function normalizeRateList(value: unknown): DaySummaryData['rate_list'] {
  if (!Array.isArray(value)) return [];
  const items: DaySummaryData['rate_list'] = [];
  for (const item of value) {
    if (!isRecord(item)) continue;
    items.push({
      time: toStringValue(item.time),
      rate: toInt(item.rate),
    });
  }
  return items;
}

function normalizeBpList(value: unknown): DaySummaryData['bp_list'] {
  if (!Array.isArray(value)) return [];
  const items: DaySummaryData['bp_list'] = [];
  for (const item of value) {
    if (!isRecord(item)) continue;
    items.push({
      time: toStringValue(item.time),
      high: toInt(item.high),
      low: toInt(item.low),
    });
  }
  return items;
}

export function normalizeDaySummaryData(value: unknown): DaySummaryData {
  const record = isRecord(value) ? value : {};
  return {
    date: toStringValue(record.date),
    all_step: toInt(record.allStep ?? record.all_step),
    sport_list: normalizeSportList(record.sportList ?? record.sport_list),
    rate_list: normalizeRateList(record.rateList ?? record.rate_list),
    bp_list: normalizeBpList(record.bpList ?? record.bp_list),
  };
}

// ── Capability ──────────────────────────────────────────────────────────────

export class DaySummaryCapability {
  constructor(private readonly ctx: CapabilityContext<DaySummaryNativeMethods>) {}

  readDaySummaryData(dayOffset: number = 0): Promise<DaySummaryData> {
    return this.ctx.invoke({
      invoke: () => this.ctx.native.readDaySummaryData(dayOffset),
      normalize: normalizeDaySummaryData,
      afterSuccess: (result) => {
        this.ctx.log("debug", "read", "read.summary.result", "Day summary data received", {
          data: { dayOffset, date: result.date },
        });
      },
    });
  }
}
