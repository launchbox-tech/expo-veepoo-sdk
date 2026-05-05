import type { DeviceVersion } from "@/types/index";
import { isRecord, toStringValue } from "@/normalizers/primitives";

export function normalizeDeviceVersion(value: unknown): DeviceVersion {
  const record = isRecord(value) ? value : {};
  return {
    hardware_version: toStringValue(record.hardwareVersion ?? record.hardware_version),
    firmware_version: toStringValue(record.firmwareVersion ?? record.firmware_version),
    software_version: toStringValue(record.softwareVersion ?? record.software_version),
    device_number: toStringValue(record.deviceNumber ?? record.device_number),
    new_version: toStringValue(record.newVersion ?? record.new_version),
    description: toStringValue(record.description),
  };
}
