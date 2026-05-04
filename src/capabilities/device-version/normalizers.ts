import type { DeviceVersion } from "../../types/index.js";
import { isRecord, toStringValue } from "../../normalizers/primitives.js";

export function normalizeDeviceVersion(value: unknown): DeviceVersion {
  const record = isRecord(value) ? value : {};
  return {
    hardwareVersion: toStringValue(record.hardwareVersion),
    firmwareVersion: toStringValue(record.firmwareVersion),
    softwareVersion: toStringValue(record.softwareVersion),
    deviceNumber: toStringValue(record.deviceNumber),
    newVersion: toStringValue(record.newVersion),
    description: toStringValue(record.description),
  };
}
