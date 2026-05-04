# refactor(bridge): split invokeNative into invokeOrThrow / invokeWithRecovery

**Issue:** #143
**Status:** Open
**Labels:** needs-triage
**Parent:** #139

## What to build

Split the `invokeNative` bridge pipeline into two named functions with distinct, documented contracts:

- **`invokeOrThrow<T>`** — for operations that must succeed. Accepts `mapError: (error: unknown) => VeepooError`; the pipeline calls `throw options.mapError(error)` so the pipeline owns the throw, not the callback.
- **`invokeWithRecovery<T>`** — for operations where a safe default exists (status checks, capability reads). Accepts `recover: (error: unknown) => T`. JSDoc documents that `recover` must call `rt.handleError` before returning the fallback.

Remove `fallbackCode` and `deviceId` from `BaseInvoke` — both are unused by the pipeline body; that information moves into the `mapError` closure at each call site.

Change `SubsystemRuntime.nativeOpFailed` return type from `never` to `VeepooError` (remove the `throw` from its implementation) so it can be passed directly as `mapError` at the ~60 boilerplate call sites.

Migrate all 67+ call sites across the six subsystem files: `invokeNative` → `invokeOrThrow` or `invokeWithRecovery`, `throwMapped` → `mapError`, remove `fallbackCode`/`deviceId` from options objects. The three existing `recover` sites (`BandDiscovery.checkBluetoothStatus`, `BandDiscovery.requestPermissions`, `SessionConnection.getConnectionStatus`) become `invokeWithRecovery`.

Update `native-invoke-pipeline.test.ts`: replace the three existing cases with five cases covering both functions, including a test that verifies `invokeOrThrow` throws the exact `VeepooError` object returned by `mapError`.

## Acceptance criteria

- [ ] `invokeOrThrow` and `invokeWithRecovery` are the only exports from `native-invoke-pipeline`; `invokeNative` is gone
- [ ] `BaseInvoke` contains only `validate`, `invoke`, `normalize`, and `afterSuccess`; `fallbackCode` and `deviceId` are removed
- [ ] `invokeOrThrow` calls `throw options.mapError(error)` in its catch block — the pipeline owns the throw
- [ ] `invokeWithRecovery` carries a JSDoc contract: use only when a safe default exists and partial results are valid; `recover` must log via `rt.handleError`
- [ ] `SubsystemRuntime.nativeOpFailed` signature is `(error: unknown): VeepooError`
- [ ] All `throwMapped` references are gone from the codebase
- [ ] All three `recover` call sites use `invokeWithRecovery`
- [ ] `tsc --noEmit` passes with no errors
- [ ] Test: `invokeOrThrow` happy path — validate called, normalize applied, afterSuccess called, result returned
- [ ] Test: `invokeOrThrow` error path — the thrown value is the exact `VeepooError` object returned by `mapError` (not a wrapped copy)
- [ ] Test: `invokeOrThrow` validate throws — `invoke` is never called
- [ ] Test: `invokeWithRecovery` happy path — result returned normally
- [ ] Test: `invokeWithRecovery` error path — `recover` is called; fallback value returned; no exception propagates
- [ ] All existing subsystem tests pass unchanged

## Blocked by

None — can start immediately
