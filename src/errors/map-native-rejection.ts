import type { VeepooError, VeepooErrorCode } from "@/types/errors";
import { NATIVE_REJECT_MAPPING, VEEPOO_CODES } from "./native-rejection-mapping";

const VEEPOO_CODE_SET = new Set<string>(VEEPOO_CODES);

export function isVeepooErrorShape(error: unknown): error is VeepooError {
  if (!error || typeof error !== "object") return false;
  const o = error as Record<string, unknown>;
  return (
    typeof o.code === "string" &&
    typeof o.message === "string" &&
    VEEPOO_CODE_SET.has(o.code)
  );
}

function normalizeNativeCode(raw: string): string {
  return raw.trim().toUpperCase().replace(/\s+/g, "_");
}

function extractNativeParts(error: unknown): { code?: string; message: string } {
  if (error instanceof Error) {
    const c = (error as Error & { code?: unknown }).code;
    const message = error.message || String(error);
    if (typeof c === "string" && c.length > 0)
      return { code: normalizeNativeCode(c), message };
    if (typeof c === "number" && Number.isFinite(c))
      return { code: String(Math.trunc(c)), message };
    return { message };
  }
  if (error && typeof error === "object") {
    const o = error as Record<string, unknown>;
    const c = o.code;
    const m = o.message;
    const message = typeof m === "string" ? m : String(error);
    if (typeof c === "string" && c.length > 0)
      return { code: normalizeNativeCode(c), message };
    if (typeof c === "number" && Number.isFinite(c))
      return { code: String(Math.trunc(c)), message };
  }
  return { message: typeof error === "string" ? error : String(error) };
}

/**
 * Looks up the public code for a native rejection. The emit-`native_code`
 * decision follows the CONTEXT.md rule: emit when public code differs from
 * the native key (after trim/case normalization), omit otherwise.
 */
function mapKnownNativeCode(normalizedNative: string): {
  code: VeepooErrorCode;
  nativeCode?: string;
} | null {
  const entry = (NATIVE_REJECT_MAPPING as Record<string, { code: VeepooErrorCode }>)[normalizedNative];
  if (!entry) return null;
  return {
    code: entry.code,
    nativeCode: entry.code !== normalizedNative ? normalizedNative : undefined,
  };
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
      device_id: error.device_id ?? ctx.deviceId,
    };
  }

  const { code: nativeNorm, message } = extractNativeParts(error);

  if (!nativeNorm) {
    return {
      code: ctx.fallbackCode,
      message,
      device_id: ctx.deviceId,
    };
  }

  const known = mapKnownNativeCode(nativeNorm);
  if (known) {
    const out: VeepooError = {
      code: known.code,
      message,
      device_id: ctx.deviceId,
    };
    if (known.nativeCode !== undefined) {
      out.native_code = known.nativeCode;
    }
    return out;
  }

  if (isScreamingSnake(nativeNorm)) {
    return {
      code: "OPERATION_FAILED",
      message,
      native_code: nativeNorm,
      device_id: ctx.deviceId,
    };
  }

  return {
    code: "OPERATION_FAILED",
    message,
    native_code: nativeNorm,
    device_id: ctx.deviceId,
  };
}
