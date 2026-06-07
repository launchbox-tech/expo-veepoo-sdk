import type { CapabilityContext } from "@/capabilities/shared/context";
import { deepCamelKeys } from "@/shared/deep-keys";
import { requireInRange, requireValidHour, requireValidMinute } from "@/shared/assertions";
import { isRecord, toInt, toBoolean } from "@/shared/primitives";

// ── Types ────────────────────────────────────────────────────────────────────

/** Raise-to-wake / wrist-flip screen. Vendor `NightTurnWristSetting` / `VPDeviceRaiseHandModel`. */
export interface WristFlipWakeSettings {
  enabled: boolean;
  start_hour: number;
  start_minute: number;
  end_hour: number;
  end_minute: number;
  /** Sensitivity 1–10 (`level` / `sensitive`); 0 on read may mean not supported. */
  sensitivity_level: number;
  /** Android read: `isSupportCustomSettingTime`. */
  supports_custom_time_window?: boolean;
  /** Vendor default sensitivity when non-zero. */
  default_sensitivity_level?: number;
}

// ── Native methods ──────────────────────────────────────────────────────────

export interface WristFlipNativeMethods {
  readWristFlipWakeSettings(): Promise<unknown>;
  setWristFlipWakeSettings(settings: WristFlipWakeSettings): Promise<void>;
}

// ── Normalizers ─────────────────────────────────────────────────────────────

export function normalizeWristFlipWakeSettings(value: unknown): WristFlipWakeSettings {
  const record = isRecord(value) ? value : {};
  const base: WristFlipWakeSettings = {
    enabled: toBoolean(record.enabled, false),
    start_hour: toInt(record.startHour ?? record.start_hour),
    start_minute: toInt(record.startMinute ?? record.start_minute),
    end_hour: toInt(record.endHour ?? record.end_hour),
    end_minute: toInt(record.endMinute ?? record.end_minute),
    sensitivity_level: toInt(record.sensitivityLevel ?? record.sensitivity_level, 5),
  };
  const sctw = record.supportsCustomTimeWindow ?? record.supports_custom_time_window;
  if (sctw !== undefined && sctw !== null) {
    base.supports_custom_time_window = toBoolean(sctw, false);
  }
  const dsl = record.defaultSensitivityLevel ?? record.default_sensitivity_level;
  if (dsl !== undefined && dsl !== null) {
    base.default_sensitivity_level = toInt(dsl);
  }
  return base;
}

// ── Validators ──────────────────────────────────────────────────────────────

function validateWristFlipWakeSettings(s: WristFlipWakeSettings): void {
  requireValidHour(s.start_hour, "startHour");
  requireValidMinute(s.start_minute, "startMinute");
  requireValidHour(s.end_hour, "endHour");
  requireValidMinute(s.end_minute, "endMinute");
  requireInRange(s.sensitivity_level, "sensitivityLevel", 1, 10);
}

// ── Capability ──────────────────────────────────────────────────────────────

export class WristFlipCapability {
  constructor(private readonly ctx: CapabilityContext<WristFlipNativeMethods>) {}

  readWristFlipWakeSettings(): Promise<WristFlipWakeSettings> {
    return this.ctx.invoke({
      invoke: () => this.ctx.native.readWristFlipWakeSettings(),
      normalize: normalizeWristFlipWakeSettings,
    });
  }

  setWristFlipWakeSettings(settings: WristFlipWakeSettings): Promise<void> {
    return this.ctx.invoke({
      validate: () => validateWristFlipWakeSettings(settings),
      invoke: () => this.ctx.native.setWristFlipWakeSettings(deepCamelKeys(settings) as WristFlipWakeSettings),
    });
  }
}
