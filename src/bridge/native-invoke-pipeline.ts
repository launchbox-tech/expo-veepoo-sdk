import type { VeepooError } from "../types/errors.js";

type BaseInvoke<T> = {
  /** Pure TypeScript preflight; must throw {@link VeepooError} from validators, not native errors. */
  validate?: () => void;
  invoke: () => Promise<unknown>;
  normalize?: (raw: unknown) => T;
  afterSuccess?: (result: T) => void;
};

export type ThrowingInvoke<T> = BaseInvoke<T> & {
  mapError: (error: unknown) => VeepooError;
};

export type RecoveringInvoke<T> = BaseInvoke<T> & {
  recover: (error: unknown) => T;
};

/**
 * Runs **validate → await native → normalize → afterSuccess** and throws the
 * `VeepooError` returned by `mapError` on failure. The pipeline owns the throw.
 */
export async function invokeOrThrow<T>(
  options: ThrowingInvoke<T>,
): Promise<T> {
  options.validate?.();
  try {
    const raw = await options.invoke();
    const out = options.normalize ? options.normalize(raw) : (raw as T);
    options.afterSuccess?.(out);
    return out;
  } catch (error) {
    throw options.mapError(error);
  }
}

/**
 * Runs **validate → await native → normalize → afterSuccess** and returns the
 * fallback produced by `recover` on failure — no exception propagates.
 *
 * Use only when a safe default exists and partial results are valid.
 * `recover` must log via `rt.handleError` before returning the fallback.
 */
export async function invokeWithRecovery<T>(
  options: RecoveringInvoke<T>,
): Promise<T> {
  options.validate?.();
  try {
    const raw = await options.invoke();
    const out = options.normalize ? options.normalize(raw) : (raw as T);
    options.afterSuccess?.(out);
    return out;
  } catch (error) {
    return options.recover(error);
  }
}
