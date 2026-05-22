import type { CapabilityContext } from "@/capabilities/shared/context";
import { deepCamelKeys } from "@/shared/deep-keys";
import { requireInRange } from "@/shared/assertions";
import { isRecord, toInt, toStringValue } from "@/shared/primitives";
import type { VeepooError } from "@/types/index";

// ── Types ────────────────────────────────────────────────────────────────────

/** Dial / watch-face category from vendor screen-style APIs (`EUIFromType` / `VPDeviceDialType`). */
export type WatchFaceDialType = "default" | "market" | "photo";

/** Current watch face selection from the Band (read). */
export interface WatchFaceStyle {
  dial_type: WatchFaceDialType;
  /** Style slot index (vendor-specific). */
  screen_index: number;
  /** Native read includes this flag; omitted after normalization if unknown. */
  operation_success?: boolean;
}

/** Arguments for `setWatchFaceStyle`. */
export interface WatchFaceStyleSettings {
  screen_index: number;
  dial_type?: WatchFaceDialType;
}

// ── Native methods ──────────────────────────────────────────────────────────

export interface WatchFaceNativeMethods {
  readWatchFaceStyle(options?: { dialType?: WatchFaceDialType } | null): Promise<unknown>;
  setWatchFaceStyle(settings: WatchFaceStyleSettings): Promise<void>;
}

// ── Normalizers ─────────────────────────────────────────────────────────────

export function normalizeWatchFaceStyle(value: unknown): WatchFaceStyle {
  const record = isRecord(value) ? value : {};
  const raw = String(toStringValue(record.dialType ?? record.dial_type, "default")).toLowerCase();
  const dial_type: WatchFaceDialType =
    raw === "market" || raw === "photo" ? raw : "default";
  const op = record.operationSuccess ?? record.operation_success;
  return {
    dial_type,
    screen_index: toInt(record.screenIndex ?? record.screen_index),
    ...(typeof op === "boolean" ? { operation_success: op } : {}),
  };
}

// ── Validators ──────────────────────────────────────────────────────────────

const WATCH_FACE_DIAL_TYPES = new Set<WatchFaceDialType>(["default", "market", "photo"]);

function requireWatchFaceDialType(value: unknown, field: string): asserts value is WatchFaceDialType {
  if (typeof value !== "string" || !WATCH_FACE_DIAL_TYPES.has(value as WatchFaceDialType)) {
    throw { code: "INVALID_ARGUMENT", message: `${field} must be 'default', 'market', or 'photo'` } satisfies VeepooError;
  }
}

/** Optional filter for read; native may still return a unified snapshot (Android). */
export function validateReadWatchFaceStyleOptions(options?: { dial_type?: WatchFaceDialType }): void {
  if (options?.dial_type !== undefined) {
    requireWatchFaceDialType(options.dial_type, "dialType");
  }
}

/** Vendor slot index; cap loosely — some Bands expose large enumerations. */
export function validateWatchFaceStyleSettings(s: WatchFaceStyleSettings): void {
  requireInRange(s.screen_index, "screenIndex", 0, 65_535);
  if (s.dial_type !== undefined) {
    requireWatchFaceDialType(s.dial_type, "dialType");
  }
}

// ── Capability ──────────────────────────────────────────────────────────────

export class WatchFaceCapability {
  constructor(private readonly ctx: CapabilityContext<WatchFaceNativeMethods>) {}

  readWatchFaceStyle(options?: { dial_type?: WatchFaceDialType }): Promise<WatchFaceStyle> {
    return this.ctx.invoke({
      validate: () => validateReadWatchFaceStyleOptions(options),
      invoke: () =>
        this.ctx.native.readWatchFaceStyle(
          options?.dial_type != null ? { dialType: options.dial_type } : null,
        ),
      normalize: normalizeWatchFaceStyle,
    });
  }

  setWatchFaceStyle(settings: WatchFaceStyleSettings): Promise<void> {
    return this.ctx.invoke({
      validate: () => validateWatchFaceStyleSettings(settings),
      invoke: () =>
        this.ctx.native.setWatchFaceStyle(deepCamelKeys({
          screen_index: settings.screen_index,
          dial_type: settings.dial_type ?? "default",
        }) as WatchFaceStyleSettings),
    });
  }
}
