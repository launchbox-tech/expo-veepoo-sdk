import type { CapabilityContext } from "@/capabilities/shared/context";
import { isRecord, toInt, toNumber, toStringValue } from "@/shared/primitives";

// ── Types ────────────────────────────────────────────────────────────────────

export interface SportStepData {
  date: string;
  step_count: number;
  distance: number;
  calories: number;
}

// ── Native methods ──────────────────────────────────────────────────────────

export interface SportStepsNativeMethods {
  readSportStepData(date?: string): Promise<unknown>;
}

// ── Normalizers ─────────────────────────────────────────────────────────────

export function normalizeSportStepData(value: unknown): SportStepData {
  const record = isRecord(value) ? value : {};
  return {
    date: toStringValue(record.date),
    step_count: toInt(record.stepCount ?? record.step_count ?? record.step),
    distance: toNumber(record.distance ?? record.dis) ?? 0,
    calories: toNumber(record.calories ?? record.kcal ?? record.cal) ?? 0,
  };
}

// ── Capability ──────────────────────────────────────────────────────────────

export class SportStepsCapability {
  constructor(private readonly ctx: CapabilityContext<SportStepsNativeMethods>) {}

  readSportStepData(date?: string): Promise<SportStepData> {
    return this.ctx.invoke({
      invoke: () => this.ctx.native.readSportStepData(date),
      normalize: normalizeSportStepData,
      afterSuccess: (result) => {
        this.ctx.log("debug", "read", "read.sport.result", "Sport step data received", {
          data: result,
        });
      },
    });
  }
}
