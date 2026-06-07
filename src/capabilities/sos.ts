import type { CapabilityContext } from "@/capabilities/shared/context";
import { isRecord, toInt } from "@/shared/primitives";
import type { VeepooError } from "@/types/index";

// ── Types ────────────────────────────────────────────────────────────────────

/** SOS call-attempt count from the Band. Vendor enforces `times` stays within `[min_times, max_times]`. */
export interface SosCallTimesSettings {
  times: number;
  min_times: number;
  max_times: number;
}

// ── Native methods ──────────────────────────────────────────────────────────

export interface SosNativeMethods {
  readSosCallTimes(): Promise<unknown>;
  setSosCallTimes(times: number): Promise<void>;
}

// ── Normalizers ─────────────────────────────────────────────────────────────

export function normalizeSosCallTimesSettings(value: unknown): SosCallTimesSettings {
  const record = isRecord(value) ? value : {};
  return {
    times: toInt(record.times),
    min_times: toInt(record.minTimes ?? record.min_times),
    max_times: toInt(record.maxTimes ?? record.max_times),
  };
}

// ── Validators ──────────────────────────────────────────────────────────────

function validateSosCallTimes(times: number): void {
  if (!Number.isInteger(times) || times < 1) {
    throw { code: "INVALID_ARGUMENT", message: "times must be a positive integer" } satisfies VeepooError;
  }
}

// ── Capability ──────────────────────────────────────────────────────────────

export class SosCapability {
  constructor(private readonly ctx: CapabilityContext<SosNativeMethods>) {}

  readSosCallTimes(): Promise<SosCallTimesSettings> {
    return this.ctx.invoke({
      invoke: () => this.ctx.native.readSosCallTimes(),
      normalize: normalizeSosCallTimesSettings,
      afterSuccess: (data) => this.ctx.emitDeviceEvent("sos_call_times_data", { data }),
    });
  }

  setSosCallTimes(times: number): Promise<void> {
    return this.ctx.invoke({
      validate: () => validateSosCallTimes(times),
      invoke: () => this.ctx.native.setSosCallTimes(times),
    });
  }
}
