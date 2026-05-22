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

// ── Capability ──────────────────────────────────────────────────────────────

export class DaySummaryCapability {
  constructor(private readonly ctx: CapabilityContext<DaySummaryNativeMethods>) {}

  readDaySummaryData(dayOffset: number = 0): Promise<DaySummaryData> {
    return this.ctx.invoke({
      invoke: () => this.ctx.native.readDaySummaryData(dayOffset),
      normalize: normalizeDaySummaryData,
      afterSuccess: (result) => {
        this.ctx.log("debug", "read", "read.summary.result", "Day summary data received", {
          deviceId: this.ctx.connectedDeviceId() ?? undefined,
          data: { dayOffset, date: result.date },
        });
      },
    });
  }
}
