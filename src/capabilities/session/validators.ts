import type { ConnectOptions } from "@/types/index";
import { requireNonEmptyString, requireInRange, requireValidHour, requireValidMinute } from "@/validators/shared";

export { validatePersonalInfo } from "@/capabilities/personal-info/validators";

export function validateDeviceId(deviceId: unknown): asserts deviceId is string {
  requireNonEmptyString(deviceId, 'deviceId');
}

export function validateConnectOptions(options: ConnectOptions): void {
  if (options.password !== undefined) {
    requireNonEmptyString(options.password, 'options.password');
  }
  if (options.time_setting !== undefined) {
    const t = options.time_setting;
    requireInRange(t.year, 'timeSetting.year', 2000, 2100);
    requireInRange(t.month, 'timeSetting.month', 1, 12);
    requireInRange(t.day, 'timeSetting.day', 1, 31);
    requireValidHour(t.hour, 'timeSetting.hour');
    requireValidMinute(t.minute, 'timeSetting.minute');
    requireInRange(t.second, 'timeSetting.second', 0, 59);
  }
}

export function validateDeviceName(name: string): void {
  requireNonEmptyString(name, 'name');
  if (new TextEncoder().encode(name).byteLength > 20) {
    throw { code: 'INVALID_ARGUMENT', message: 'name must not exceed 20 UTF-8 bytes' };
  }
}

export function validateConnectionConfirmTimeout(seconds: number): void {
  if (!Number.isInteger(seconds)) {
    throw { code: 'INVALID_ARGUMENT', message: 'seconds must be an integer' };
  }
  requireInRange(seconds, 'seconds', 5, 120);
}
