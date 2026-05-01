import type { ConnectOptions, PersonalInfo } from '../types/index.js';
import type { VeepooError } from '../types/index.js';
import { requireNonEmptyString, requireInRange, requireValidHour, requireValidMinute } from './shared.js';

export function validateDeviceId(deviceId: unknown): asserts deviceId is string {
  requireNonEmptyString(deviceId, 'deviceId');
}

export function validateConnectOptions(options: ConnectOptions): void {
  if (options.password !== undefined) {
    requireNonEmptyString(options.password, 'options.password');
  }
  if (options.timeSetting !== undefined) {
    const t = options.timeSetting;
    requireInRange(t.year, 'timeSetting.year', 2000, 2100);
    requireInRange(t.month, 'timeSetting.month', 1, 12);
    requireInRange(t.day, 'timeSetting.day', 1, 31);
    requireValidHour(t.hour, 'timeSetting.hour');
    requireValidMinute(t.minute, 'timeSetting.minute');
    requireInRange(t.second, 'timeSetting.second', 0, 59);
  }
}

export function validatePersonalInfo(info: PersonalInfo): void {
  if (info.sex !== 0 && info.sex !== 1) {
    throw { code: 'INVALID_ARGUMENT', message: 'sex must be 0 or 1' } satisfies VeepooError;
  }
  requireInRange(info.height, 'height', 50, 300);
  requireInRange(info.weight, 'weight', 1, 500);
  requireInRange(info.age, 'age', 1, 120);
  requireInRange(info.stepAim, 'stepAim', 1, 100_000);
  requireInRange(info.sleepAim, 'sleepAim', 0, 1_440);
}
