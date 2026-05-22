import type { CapabilityContext } from "@/capabilities/shared/context";
import { deepCamelKeys } from "@/shared/deep-keys";
import { requireInRange, requireValidHour, requireValidMinute } from "@/shared/assertions";
import { isRecord, toInt, toBoolean } from "@/shared/primitives";

// ── Types ────────────────────────────────────────────────────────────────────

/** Sedentary / long-sit reminder window and threshold. Vendor `LongSeatSetting` / `VPDeviceLongSeatModel`. */
export interface SedentaryReminderSettings {
  start_hour: number;
  start_minute: number;
  end_hour: number;
  end_minute: number;
  /** Minutes still before the Band reminds (vendor gate; typically 30–240). */
  threshold_minutes: number;
  enabled: boolean;
}

// ── Native methods ──────────────────────────────────────────────────────────

export interface SedentaryReminderNativeMethods {
  readSedentaryReminder(): Promise<unknown>;
  setSedentaryReminder(settings: SedentaryReminderSettings): Promise<void>;
}

// ── Normalizers ─────────────────────────────────────────────────────────────

export function normalizeSedentaryReminderSettings(value: unknown): SedentaryReminderSettings {
  const record = isRecord(value) ? value : {};
  return {
    start_hour: toInt(record.startHour ?? record.start_hour),
    start_minute: toInt(record.startMinute ?? record.start_minute),
    end_hour: toInt(record.endHour ?? record.end_hour),
    end_minute: toInt(record.endMinute ?? record.end_minute),
    threshold_minutes: toInt(record.thresholdMinutes ?? record.threshold_minutes, 60),
    enabled: toBoolean(record.enabled, false),
  };
}

// ── Validators ──────────────────────────────────────────────────────────────

/** Vendor long-sit gate is 30–240 minutes (iOS `longSeatGateValue`). */
export function validateSedentaryReminderSettings(s: SedentaryReminderSettings): void {
  requireValidHour(s.start_hour, "startHour");
  requireValidMinute(s.start_minute, "startMinute");
  requireValidHour(s.end_hour, "endHour");
  requireValidMinute(s.end_minute, "endMinute");
  requireInRange(s.threshold_minutes, "thresholdMinutes", 30, 240);
}

// ── Capability ──────────────────────────────────────────────────────────────

export class SedentaryReminderCapability {
  constructor(private readonly ctx: CapabilityContext<SedentaryReminderNativeMethods>) {}

  readSedentaryReminder(): Promise<SedentaryReminderSettings> {
    return this.ctx.invoke({
      invoke: () => this.ctx.native.readSedentaryReminder(),
      normalize: normalizeSedentaryReminderSettings,
    });
  }

  setSedentaryReminder(settings: SedentaryReminderSettings): Promise<void> {
    return this.ctx.invoke({
      validate: () => validateSedentaryReminderSettings(settings),
      invoke: () => this.ctx.native.setSedentaryReminder(deepCamelKeys(settings) as SedentaryReminderSettings),
    });
  }
}
