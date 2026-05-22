import type { CapabilityContext } from "@/capabilities/shared/context";
import { isRecord, toInt, toBoolean } from "@/shared/primitives";

// ── Types ────────────────────────────────────────────────────────────────────

export type ChargeState = "normal" | "charging" | "low_pressure" | "full";

export interface BatteryInfo {
  level: number;
  percent: number;
  power_model: number;
  state: number;
  bat: number;
  is_percent: boolean;
  is_low_battery: boolean;
  charge_state?: ChargeState;
}

// ── Native methods ──────────────────────────────────────────────────────────

export interface BatteryNativeMethods {
  readBattery(): Promise<unknown>;
}

// ── Normalizers ─────────────────────────────────────────────────────────────

export function normalizeBatteryInfo(value: unknown): BatteryInfo {
  const record = isRecord(value) ? value : {};
  const state = toInt(record.state);
  const charge_state =
    state === 0 ? "normal"
    : state === 1 ? "charging"
    : state === 2 ? "low_pressure"
    : state === 3 ? "full"
    : undefined;

  return {
    level: toInt(record.level, toInt(record.percent)),
    percent: toInt(record.percent, toInt(record.level)),
    power_model: toInt(record.powerModel ?? record.power_model),
    state,
    bat: toInt(record.bat),
    is_percent: toBoolean(record.isPercent ?? record.is_percent, true),
    is_low_battery: toBoolean(record.isLowBattery ?? record.is_low_battery),
    charge_state,
  };
}

// ── Capability ──────────────────────────────────────────────────────────────

export class BatteryCapability {
  constructor(private readonly ctx: CapabilityContext<BatteryNativeMethods>) {}

  readBattery(): Promise<BatteryInfo> {
    this.ctx.log("debug", "device", "battery.read.start", "Reading battery info", {
    });
    return this.ctx.invoke({
      invoke: () => this.ctx.native.readBattery(),
      normalize: normalizeBatteryInfo,
      afterSuccess: (result) => {
        this.ctx.log("debug", "device", "battery.read.result", "Battery info received", {
          data: result,
        });
      },
    });
  }
}
