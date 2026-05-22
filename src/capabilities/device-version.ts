import type { CapabilityContext } from "@/capabilities/shared/context";
import { isRecord, toStringValue } from "@/shared/primitives";

// ── Types ────────────────────────────────────────────────────────────────────

export interface DeviceVersion {
  hardware_version: string;
  firmware_version: string;
  software_version: string;
  device_number: string;
  new_version: string;
  description: string;
}

// ── Native methods ──────────────────────────────────────────────────────────

export interface DeviceVersionNativeMethods {
  readDeviceVersion(): Promise<unknown>;
}

// ── Normalizers ─────────────────────────────────────────────────────────────

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

// ── Capability ──────────────────────────────────────────────────────────────

export class DeviceVersionCapability {
  constructor(private readonly ctx: CapabilityContext<DeviceVersionNativeMethods>) {}

  readDeviceVersion(): Promise<DeviceVersion> {
    return this.ctx.invoke({
      invoke: () => this.ctx.native.readDeviceVersion(),
      normalize: normalizeDeviceVersion,
      afterSuccess: (result) => {
        this.ctx.log("debug", "device", "device.version.read", "Device version received", {
          data: result,
        });
      },
    });
  }
}
