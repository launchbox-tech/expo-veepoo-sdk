import type { CapabilityContext } from "@/capabilities/shared/context";
import { deepCamelKeys } from "@/shared/deep-keys";
import { requireInRange } from "@/shared/assertions";
import { isRecord, toInt, toBoolean } from "@/shared/primitives";

// ── Types ────────────────────────────────────────────────────────────────────

export interface AutoMeasureSetting {
  protocol_type: number;
  fun_type: number;
  is_switch_open: boolean;
  step_unit: number;
  is_slot_modify: boolean;
  is_interval_modify: boolean;
  support_start_minute: number;
  support_end_minute: number;
  measure_interval: number;
  current_start_minute: number;
  current_end_minute: number;
}

// ── Native methods ──────────────────────────────────────────────────────────

export interface AutoMeasureNativeMethods {
  readAutoMeasureSetting(): Promise<unknown>;
  modifyAutoMeasureSetting(setting: Partial<AutoMeasureSetting>): Promise<unknown>;
}

// ── Normalizers ─────────────────────────────────────────────────────────────

function normalizeAutoMeasureSetting(item: Record<string, unknown>): AutoMeasureSetting {
  return {
    protocol_type: toInt(item.protocolType ?? item.protocol_type),
    fun_type: toInt(item.funType ?? item.fun_type),
    is_switch_open: toBoolean(item.isSwitchOpen ?? item.is_switch_open),
    step_unit: toInt(item.stepUnit ?? item.step_unit),
    is_slot_modify: toBoolean(item.isSlotModify ?? item.is_slot_modify),
    is_interval_modify: toBoolean(item.isIntervalModify ?? item.is_interval_modify),
    support_start_minute: toInt(item.supportStartMinute ?? item.support_start_minute),
    support_end_minute: toInt(item.supportEndMinute ?? item.support_end_minute),
    measure_interval: toInt(item.measureInterval ?? item.measure_interval),
    current_start_minute: toInt(item.currentStartMinute ?? item.current_start_minute),
    current_end_minute: toInt(item.currentEndMinute ?? item.current_end_minute),
  };
}

function normalizeAutoMeasureSettings(value: unknown): AutoMeasureSetting[] {
  if (!Array.isArray(value)) return [];
  const settings: AutoMeasureSetting[] = [];
  for (const item of value) {
    if (isRecord(item)) settings.push(normalizeAutoMeasureSetting(item));
  }
  return settings;
}

// ── Validators ──────────────────────────────────────────────────────────────

function validateAutoMeasureSetting(setting: Partial<AutoMeasureSetting>): void {
  if (setting.measure_interval !== undefined) {
    requireInRange(setting.measure_interval, "measureInterval", 1, 120);
  }
  if (setting.current_start_minute !== undefined) {
    requireInRange(setting.current_start_minute, "currentStartMinute", 0, 1_439);
  }
  if (setting.current_end_minute !== undefined) {
    requireInRange(setting.current_end_minute, "currentEndMinute", 0, 1_439);
  }
}

// ── Capability ──────────────────────────────────────────────────────────────

export class AutoMeasureCapability {
  constructor(private readonly ctx: CapabilityContext<AutoMeasureNativeMethods>) {}

  readAutoMeasureSetting(): Promise<AutoMeasureSetting[]> {
    return this.ctx.invoke({
      invoke: () => this.ctx.native.readAutoMeasureSetting(),
      normalize: normalizeAutoMeasureSettings,
      afterSuccess: (result) => {
        this.ctx.log("debug", "device", "autoMeasure.read", "Auto measure settings received", {
          data: { count: result.length },
        });
      },
    });
  }

  modifyAutoMeasureSetting(setting: Partial<AutoMeasureSetting>): Promise<AutoMeasureSetting[]> {
    return this.ctx.invoke({
      validate: () => {
        validateAutoMeasureSetting(setting);
        this.ctx.log("info", "device", "autoMeasure.modify.start", "Modifying auto measure settings", {
          data: setting,
        });
      },
      invoke: () => this.ctx.native.modifyAutoMeasureSetting(deepCamelKeys(setting) as Partial<AutoMeasureSetting>),
      normalize: normalizeAutoMeasureSettings,
      afterSuccess: (result) => {
        this.ctx.log("info", "device", "autoMeasure.modify.result", "Auto measure settings updated", {
          data: { count: result.length },
        });
      },
    });
  }
}
