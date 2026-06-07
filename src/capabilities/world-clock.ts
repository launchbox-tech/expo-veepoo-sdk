import type { CapabilityContext } from "@/capabilities/shared/context";
import { deepCamelKeys } from "@/shared/deep-keys";
import { requireInRange, requireNonEmptyString } from "@/shared/assertions";
import { isRecord, toInt } from "@/shared/primitives";
import type { OperationStatus, VeepooError } from "@/types/index";

// ── Types ────────────────────────────────────────────────────────────────────

export interface WorldClockEntry {
  timezone_offset_minutes: number;
  city_name: string;
  dst_offset?: number;
}

// ── Native methods ──────────────────────────────────────────────────────────

export interface WorldClockNativeMethods {
  readWorldClock(): Promise<unknown>;
  setWorldClock(clocks: WorldClockEntry[]): Promise<OperationStatus>;
}

// ── Normalizers ─────────────────────────────────────────────────────────────

function normalizeWorldClockEntry(item: Record<string, unknown>): WorldClockEntry {
  const entry: WorldClockEntry = {
    timezone_offset_minutes: toInt(
      item.timezone_offset_minutes ?? item.timezoneOffsetMinutes,
      0,
    ),
    city_name:
      typeof item.city_name === "string"
        ? item.city_name
        : typeof item.cityName === "string"
          ? item.cityName
          : "",
  };
  const dstRaw = item.dst_offset ?? item.dstOffset;
  if (dstRaw !== undefined && dstRaw !== null) {
    entry.dst_offset = toInt(dstRaw);
  }
  return entry;
}

function normalizeWorldClockList(value: unknown): WorldClockEntry[] {
  if (!Array.isArray(value)) return [];
  const entries: WorldClockEntry[] = [];
  for (const item of value) {
    if (isRecord(item)) entries.push(normalizeWorldClockEntry(item));
  }
  return entries;
}

// ── Validators ──────────────────────────────────────────────────────────────

function validateWorldClockList(clocks: WorldClockEntry[]): void {
  if (clocks.length > 4) {
    throw { code: "INVALID_ARGUMENT", message: "Maximum 4 world clock entries allowed" } satisfies VeepooError;
  }
  for (const clock of clocks) {
    requireInRange(clock.timezone_offset_minutes, "timezone_offset_minutes", -720, 840);
    requireNonEmptyString(clock.city_name, "city_name");
  }
}

// ── Capability ──────────────────────────────────────────────────────────────

export class WorldClockCapability {
  constructor(private readonly ctx: CapabilityContext<WorldClockNativeMethods>) {}

  readWorldClock(): Promise<WorldClockEntry[]> {
    return this.ctx.invoke({
      invoke: () => this.ctx.native.readWorldClock(),
      normalize: normalizeWorldClockList,
    });
  }

  setWorldClock(clocks: WorldClockEntry[]): Promise<OperationStatus> {
    return this.ctx.invoke({
      validate: () => validateWorldClockList(clocks),
      invoke: () => this.ctx.native.setWorldClock(clocks.map((c) => deepCamelKeys(c) as WorldClockEntry)),
    });
  }
}
