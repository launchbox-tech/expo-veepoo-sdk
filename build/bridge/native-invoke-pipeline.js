"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.invokeOrThrow = invokeOrThrow;
exports.invokeWithRecovery = invokeWithRecovery;
/**
 * Runs **validate → await native → normalize → afterSuccess** and throws the
 * `VeepooError` returned by `mapError` on failure. The pipeline owns the throw.
 */
async function invokeOrThrow(options) {
    options.validate?.();
    try {
        const raw = await options.invoke();
        const out = options.normalize ? options.normalize(raw) : raw;
        options.afterSuccess?.(out);
        return out;
    }
    catch (error) {
        throw options.mapError(error);
    }
}
/**
 * Runs **validate → await native → normalize → afterSuccess** and returns the
 * fallback produced by `recover` on failure — no exception propagates.
 *
 * Use only when a safe default exists and partial results are valid.
 * Capabilities reach this via `ctx.invokeWithRecovery`, which wraps the
 * runtime's error pipeline so the failure is still logged + emitted as an
 * `error` event before `recoverWith` resolves.
 */
async function invokeWithRecovery(options) {
    options.validate?.();
    try {
        const raw = await options.invoke();
        const out = options.normalize ? options.normalize(raw) : raw;
        options.afterSuccess?.(out);
        return out;
    }
    catch (error) {
        return options.recover(error);
    }
}
//# sourceMappingURL=native-invoke-pipeline.js.map