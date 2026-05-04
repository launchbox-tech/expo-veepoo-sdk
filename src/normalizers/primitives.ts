import type { FunctionStatus, TestState } from '../types/index.js';

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function toNumber(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return undefined;
}

export function toInt(value: unknown, fallback = 0): number {
  const number = toNumber(value);
  return number === undefined ? fallback : Math.trunc(number);
}

export function toBoolean(value: unknown, fallback = false): boolean {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value !== 0;
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (['true', '1', 'yes', 'open', 'support', 'supported'].includes(normalized)) return true;
    if (['false', '0', 'no', 'close', 'unsupported'].includes(normalized)) return false;
  }
  return fallback;
}

export function toStringValue(value: unknown, fallback = ''): string {
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  return fallback;
}

export function normalizeFunctionStatus(value: unknown): FunctionStatus {
  if (typeof value === 'boolean') return value ? 'support' : 'unsupported';
  if (typeof value === 'number') {
    switch (Math.trunc(value)) {
      case 0: return 'unsupported';
      case 1: return 'support';
      case 2: return 'open';
      case 3: return 'close';
      default: return value > 0 ? 'support' : 'unsupported';
    }
  }
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (normalized.includes('support_close') || normalized === 'close' || normalized === 'closed')
      return 'close';
    if (normalized.includes('support_open') || normalized === 'open' || normalized === 'opened')
      return 'open';
    if (normalized.includes('unsupport') || normalized.includes('unsupported') || normalized === '0')
      return 'unsupported';
    if (normalized.includes('support') || normalized === '1' || normalized === 'true')
      return 'support';
  }
  return 'unknown';
}

export function normalizeTestState(value: unknown): TestState {
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (normalized.includes('idle') || normalized === 'free') return 'idle';
    if (normalized.includes('start') || normalized.includes('open')) return 'start';
    if (
      normalized.includes('testing') ||
      normalized.includes('detect') ||
      normalized.includes('progress') ||
      normalized === 'calibration'
    ) return 'testing';
    if (normalized.includes('wear')) return 'notWear';
    if (normalized.includes('busy')) return 'deviceBusy';
    if (
      normalized.includes('over') ||
      normalized.includes('complete') ||
      normalized.includes('close') ||
      normalized.includes('stop')
    ) return 'over';
    if (
      normalized.includes('error') ||
      normalized.includes('fail') ||
      normalized.includes('unsupported') ||
      normalized.includes('invalid') ||
      normalized.includes('power')
    ) return 'error';
  }
  if (typeof value === 'number') {
    switch (Math.trunc(value)) {
      case 0: return 'start';
      case 1: return 'testing';
      case 2: return 'notWear';
      case 3: return 'deviceBusy';
      case 4: return 'over';
      default: return 'error';
    }
  }
  return 'error';
}
