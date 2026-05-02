import type { VeepooError, VeepooErrorCode } from '../types/errors.js';

const VEEPOO_CODES: readonly VeepooErrorCode[] = [
  'UNKNOWN',
  'INVALID_ARGUMENT',
  'PERMISSION_DENIED',
  'CONNECTION_FAILED',
  'DISCONNECTION_FAILED',
  'BLUETOOTH_NOT_ENABLED',
  'DEVICE_NOT_FOUND',
  'OPERATION_FAILED',
  'SDK_NOT_INITIALIZED',
  'DEVICE_NOT_CONNECTED',
  'DEVICE_NOT_READY',
  'REALTIME_TEST_IN_PROGRESS',
  'CAPABILITY_UNSUPPORTED',
  'DEVICE_BUSY',
  'PASSWORD_REQUIRED',
  'TIMEOUT',
  'NOT_WEARING',
] as const;

const VEEPOO_CODE_SET = new Set<string>(VEEPOO_CODES);

export function isVeepooErrorShape(error: unknown): error is VeepooError {
  if (!error || typeof error !== 'object') return false;
  const o = error as Record<string, unknown>;
  return (
    typeof o.code === 'string' &&
    typeof o.message === 'string' &&
    VEEPOO_CODE_SET.has(o.code)
  );
}

function normalizeNativeCode(raw: string): string {
  return raw.trim().toUpperCase().replace(/\s+/g, '_');
}

function extractNativeParts(error: unknown): { code?: string; message: string } {
  if (error instanceof Error) {
    const c = (error as Error & { code?: unknown }).code;
    const message = error.message || String(error);
    if (typeof c === 'string' && c.length > 0) return { code: normalizeNativeCode(c), message };
    if (typeof c === 'number' && Number.isFinite(c)) return { code: String(Math.trunc(c)), message };
    return { message };
  }
  if (error && typeof error === 'object') {
    const o = error as Record<string, unknown>;
    const c = o.code;
    const m = o.message;
    const message = typeof m === 'string' ? m : String(error);
    if (typeof c === 'string' && c.length > 0) return { code: normalizeNativeCode(c), message };
    if (typeof c === 'number' && Number.isFinite(c)) return { code: String(Math.trunc(c)), message };
  }
  return { message: typeof error === 'string' ? error : String(error) };
}

/** One-to-one native (normalized) → public code; no nativeCode field on result. */
const DIRECT_NATIVE_TO_VEEPOO: ReadonlySet<string> = new Set([
  'REALTIME_TEST_IN_PROGRESS',
  'CAPABILITY_UNSUPPORTED',
  'DEVICE_NOT_READY',
  'DEVICE_NOT_CONNECTED',
  'SDK_NOT_INITIALIZED',
  'CONNECTION_FAILED',
  'DISCONNECTION_FAILED',
  'DEVICE_BUSY',
  'PASSWORD_REQUIRED',
  'TIMEOUT',
  'NOT_WEARING',
  'BLUETOOTH_NOT_ENABLED',
  'DEVICE_NOT_FOUND',
  'INVALID_ARGUMENT',
  'PERMISSION_DENIED',
  'OPERATION_FAILED',
  'UNKNOWN',
]);

function mapKnownNativeCode(normalizedNative: string): {
  code: VeepooErrorCode;
  nativeCode?: string;
} | null {
  if (DIRECT_NATIVE_TO_VEEPOO.has(normalizedNative)) {
    return { code: normalizedNative as VeepooErrorCode };
  }
  switch (normalizedNative) {
    case 'SDK_NOT_AVAILABLE':
      return { code: 'SDK_NOT_INITIALIZED', nativeCode: 'SDK_NOT_AVAILABLE' };
    case 'DISCONNECT_FAILED':
    case 'DISCONNECT_ERROR':
      return { code: 'DISCONNECTION_FAILED', nativeCode: normalizedNative };
    case 'START_FAILED':
    case 'STOP_FAILED':
    case 'READ_FAILED':
      return { code: 'OPERATION_FAILED', nativeCode: normalizedNative };
    case 'PASSWORD_TYPE_ERROR':
    case 'INVALID_LANGUAGE':
    case 'INVALID_TYPE':
      return { code: 'INVALID_ARGUMENT', nativeCode: normalizedNative };
    default:
      return null;
  }
}

function isScreamingSnake(s: string): boolean {
  return /^[A-Z][A-Z0-9_]*$/.test(s);
}

export interface MapNativeRejectionContext {
  fallbackCode: VeepooErrorCode;
  deviceId?: string;
}

/**
 * Maps Expo / native module rejections to {@link VeepooError} per ADR 0003.
 * Pass-through when `error` is already a shaped {@link VeepooError} (e.g. from validators).
 */
export function mapNativeRejection(error: unknown, ctx: MapNativeRejectionContext): VeepooError {
  if (isVeepooErrorShape(error)) {
    return {
      ...error,
      deviceId: error.deviceId ?? ctx.deviceId,
    };
  }

  const { code: nativeNorm, message } = extractNativeParts(error);

  if (!nativeNorm) {
    return {
      code: ctx.fallbackCode,
      message,
      deviceId: ctx.deviceId,
    };
  }

  const known = mapKnownNativeCode(nativeNorm);
  if (known) {
    const out: VeepooError = {
      code: known.code,
      message,
      deviceId: ctx.deviceId,
    };
    if (known.nativeCode !== undefined) {
      out.nativeCode = known.nativeCode;
    }
    return out;
  }

  if (isScreamingSnake(nativeNorm)) {
    return {
      code: 'OPERATION_FAILED',
      message,
      nativeCode: nativeNorm,
      deviceId: ctx.deviceId,
    };
  }

  return {
    code: 'OPERATION_FAILED',
    message,
    nativeCode: nativeNorm,
    deviceId: ctx.deviceId,
  };
}
