import type { DeviceFunctions } from "../../../types/index.js";
import { isRecord, normalizeFunctionStatus } from "../../../normalizers/primitives.js";

export function normalizePackage4(record: Record<string, unknown>): DeviceFunctions["package4"] {
  if (!isRecord(record.package4)) return undefined;
  return Object.fromEntries(
    Object.entries(record.package4).map(([key, item]) => [key, normalizeFunctionStatus(item)])
  ) as unknown as DeviceFunctions["package4"];
}

export function normalizePackage5(record: Record<string, unknown>): DeviceFunctions["package5"] {
  if (!isRecord(record.package5)) return undefined;
  return Object.fromEntries(
    Object.entries(record.package5).map(([key, item]) => [key, normalizeFunctionStatus(item)])
  ) as unknown as DeviceFunctions["package5"];
}
