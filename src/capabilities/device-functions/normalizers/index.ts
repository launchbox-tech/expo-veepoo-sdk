import type { DeviceFunctions } from "@/types/index";
import { isRecord } from "@/normalizers/primitives";
import { normalizePackage1 } from "./package1";
import { normalizePackage2 } from "./package2";
import { normalizePackage3 } from "./package3";
import { normalizePackage4, normalizePackage5 } from "./package4-5";

export function normalizeDeviceFunctions(value: unknown): DeviceFunctions {
  const record = isRecord(value) ? value : {};

  if (
    isRecord(record.package1) ||
    isRecord(record.package2) ||
    isRecord(record.package3) ||
    isRecord(record.package4) ||
    isRecord(record.package5)
  ) {
    return {
      package1: normalizePackage1(record),
      package2: normalizePackage2(record),
      package3: normalizePackage3(record),
      package4: normalizePackage4(record),
      package5: normalizePackage5(record),
    };
  }

  return {
    package1: normalizePackage1(record),
    package2: normalizePackage2(record),
    package3: normalizePackage3(record),
  };
}
