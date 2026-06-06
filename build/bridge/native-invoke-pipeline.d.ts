import type { VeepooError } from "../types/errors";
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
export declare function invokeOrThrow<T>(options: ThrowingInvoke<T>): Promise<T>;
/**
 * Runs **validate → await native → normalize → afterSuccess** and returns the
 * fallback produced by `recover` on failure — no exception propagates.
 *
 * Use only when a safe default exists and partial results are valid.
 * Capabilities reach this via `ctx.invokeWithRecovery`, which wraps the
 * runtime's error pipeline so the failure is still logged + emitted as an
 * `error` event before `recoverWith` resolves.
 */
export declare function invokeWithRecovery<T>(options: RecoveringInvoke<T>): Promise<T>;
export {};
//# sourceMappingURL=native-invoke-pipeline.d.ts.map