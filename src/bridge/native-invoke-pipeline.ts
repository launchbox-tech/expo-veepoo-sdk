import type { VeepooErrorCode } from "../types/errors.js";

type BaseInvoke<T> = {
  /** Pure TypeScript preflight; must throw {@link VeepooError} from validators, not native errors. */
  validate?: () => void;
  invoke: () => Promise<unknown>;
  normalize?: (raw: unknown) => T;
  fallbackCode: VeepooErrorCode;
  deviceId?: string;
  afterSuccess?: (result: T) => void;
};

type ThrowingInvoke<T> = BaseInvoke<T> & {
  throwMapped: (error: unknown) => never;
};

type RecoveringInvoke<T> = BaseInvoke<T> & {
  recover: (error: unknown) => T;
};

/**
 * Shared path: **validate → await native → normalize → map rejection** (via `throwMapped` or `recover`).
 * Success logging belongs in `afterSuccess` so callers keep existing `this.log` messages.
 */
export async function invokeNative<T>(
  options: ThrowingInvoke<T> | RecoveringInvoke<T>,
): Promise<T> {
  options.validate?.();
  try {
    const raw = await options.invoke();
    const out = options.normalize
      ? options.normalize(raw)
      : (raw as T);
    options.afterSuccess?.(out);
    return out;
  } catch (error) {
    if ("recover" in options) {
      return options.recover(error);
    }
    return options.throwMapped(error);
  }
}
