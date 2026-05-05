import type { ConnectOptions } from "../../types/index.js";
import { requireNonEmptyString, requireInRange, requireValidHour, requireValidMinute } from "../../validators/shared.js";

export { validatePersonalInfo } from "../personal-info/validators.js";

export function validateDeviceId(deviceId: unknown): asserts deviceId is string {
  requireNonEmptyString(deviceId, 'deviceId');
}

export function validateConnectOptions(options: ConnectOptions): void {
  if (options.password !== undefined) {
    requireNonEmptyString(options.password, 'options.password');
  }
  const timeSetting = options.time_setting ?? (options as any).timeSetting;
  if (timeSetting !== undefined) {
    const t = timeSetting;
    requireInRange(t.year, 'timeSetting.year', 2000, 2100);
    requireInRange(t.month, 'timeSetting.month', 1, 12);
    requireInRange(t.day, 'timeSetting.day', 1, 31);
    requireValidHour(t.hour, 'timeSetting.hour');
    requireValidMinute(t.minute, 'timeSetting.minute');
    requireInRange(t.second, 'timeSetting.second', 0, 59);
  }
}
