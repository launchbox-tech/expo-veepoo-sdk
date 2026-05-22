import type { VeepooError } from '@/types/index';

function fail(message: string): never {
  throw { code: 'INVALID_ARGUMENT', message } satisfies VeepooError;
}

export function requireNonEmptyString(value: unknown, field: string): asserts value is string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    fail(`${field} must be a non-empty string`);
  }
}

export function requireInRange(value: unknown, field: string, min: number, max: number): asserts value is number {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < min || value > max) {
    fail(`${field} must be between ${min} and ${max}`);
  }
}

export function requireValidHour(value: unknown, field: string): asserts value is number {
  requireInRange(value, field, 0, 23);
}

export function requireValidMinute(value: unknown, field: string): asserts value is number {
  requireInRange(value, field, 0, 59);
}
