import type { DeviceFunctions } from "@/types/index";
import { isRecord } from "@/shared/primitives";
import { normalizePackage1 } from "./package1";
import { normalizePackage2 } from "./package2";
import { normalizePackage3 } from "./package3";
import { normalizePackage4, normalizePackage5 } from "./package4-5";

export function normalizeDeviceFunctions(value: unknown): DeviceFunctions {
  const record = isRecord(value) ? value : {};

  // package4/5 have no flat-record form — each returns undefined unless the
  // payload nests it — so they are added only when present, keeping the
  // three-package shape callers see today.
  const package4 = normalizePackage4(record);
  const package5 = normalizePackage5(record);

  return {
    package1: normalizePackage1(record),
    package2: normalizePackage2(record),
    package3: normalizePackage3(record),
    ...(package4 ? { package4 } : {}),
    ...(package5 ? { package5 } : {}),
  };
}
