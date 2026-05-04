# refactor(bridge): split invokeNative into invokeOrThrow / invokeWithRecovery

**Issue:** #139
**Status:** Open
**Labels:** needs-triage, enhancement

## Problem Statement

The `invokeNative` bridge pipeline exposes a union type with two invocation modes —
`throwMapped` (caller provides a function that throws) and `recover` (caller provides a
fallback return) — with no documentation or enforcement of which mode is appropriate for
which operation. A new subsystem author copying either pattern from a neighbouring file
can choose the wrong mode and the type system will not catch it: `recover` on a read
operation silently hides Band communication failures behind a fake value; `throwMapped`
on a status-check operation discards the safe-default path. The test for the pipeline
itself is trivial (three happy-path cases); the real contract bugs live in how callers
choose modes, which the tests do not cover.

Two additional fields on `BaseInvoke` — `fallbackCode` and `deviceId` — are present in
the type definition but are never read by the pipeline implementation. They exist only
as hints for the caller's error handler, yet they appear in every one of the 67+
call sites, adding noise and creating a false impression that the pipeline uses them.

Finally, `throwMapped` has the signature `(error: unknown) => never`, meaning the
pipeline calls a callback that itself throws. The pipeline does not own the throw; the
callback does. This is asymmetric: the `recover` path has the pipeline calling
`return options.recover(error)`, while the throwing path has the pipeline calling
`return options.throwMapped(error)` where the return never completes. A future maintainer
of the pipeline cannot change the throw behaviour without auditing every callback.

## Solution

Split `invokeNative` into two named functions with distinct, documented contracts:

- **`invokeOrThrow<T>`** — the default path for operations that must succeed. Accepts
  `mapError: (error: unknown) => VeepooError`. The pipeline owns the throw:
  `throw options.mapError(error)`. Callers map the native error to a typed
  `VeepooError` without being responsible for throwing.

- **`invokeWithRecovery<T>`** — the opt-in path for operations where a safe default
  exists (status checks, capability reads). Accepts `recover: (error: unknown) => T`.
  A JSDoc contract on the function specifies that `recover` must log via
  `rt.handleError` before returning the fallback.

Remove `fallbackCode` and `deviceId` from `BaseInvoke` — both fields are unused by the
pipeline body and their information now lives inside the `mapError` closure.

Change `SubsystemRuntime.nativeOpFailed` from `(): never` (throws) to
`(): VeepooError` (returns) so it can be passed directly as `mapError` at the
~60 boilerplate call sites.

## User Stories

1. As an SDK maintainer adding a new subsystem method, I want the invocation function
   name to enforce whether errors should throw or recover, so that I cannot accidentally
   pick the wrong mode by copying a nearby call site.

2. As an SDK maintainer reviewing a pull request, I want wrong-mode choices visible at
   the seam (the function name), so that I do not need to trace through the callback
   body to determine whether errors are thrown or swallowed.

3. As an SDK maintainer writing a test for a subsystem method, I want `mapError` to
   return a `VeepooError` object (not throw), so that I can assert on the error value
   directly without wrapping in `try/catch` or mocking a throwing function.

4. As an SDK maintainer, I want `invokeWithRecovery` to carry a JSDoc contract
   explaining that it is only valid when a safe default exists and the caller can
   proceed with partial results, so that the rule is co-located with the seam rather
   than only in architecture notes.

5. As an SDK maintainer, I want the `BaseInvoke` type to contain only fields the
   pipeline actually reads, so that I do not confuse "options passed to the pipeline"
   with "options used by the error-handler callback".

6. As an SDK maintainer, I want `SubsystemRuntime.nativeOpFailed` to return
   `VeepooError` instead of `never`, so that it can be passed as `mapError` without
   a wrapping lambda.

7. As an SDK maintainer reading the pipeline implementation, I want the throw to happen
   inside `invokeOrThrow` rather than inside a callback, so that the pipeline's
   error-propagation behaviour is self-evident from its body.

8. As an SDK maintainer, I want the existing three `recover` call sites
   (`BandDiscovery.checkBluetoothStatus`, `BandDiscovery.requestPermissions`,
   `SessionConnection.getConnectionStatus`) converted to `invokeWithRecovery`, so that
   the recovery contract is explicit at every call site.

9. As an SDK maintainer, I want all `throwMapped` call sites converted to
   `invokeOrThrow` with `mapError`, so that `invokeNative` and `throwMapped` are no
   longer referenced anywhere in the codebase.

10. As an SDK maintainer, I want the pipeline unit tests to cover `invokeOrThrow` and
    `invokeWithRecovery` as separate test subjects, so that the contract of each
    function is verified independently.

11. As an SDK maintainer, I want a test verifying that `invokeOrThrow` throws the
    exact `VeepooError` returned by `mapError`, so that the pipeline's ownership of
    the throw is proven at the test level.

12. As an SDK maintainer, I want a test verifying that `invokeWithRecovery` returns the
    fallback value and does not throw, so that the recovery contract is machine-checked.

## Implementation Decisions

### Modules modified

**`native-invoke-pipeline` (core change)**
Remove `invokeNative`. Export `invokeOrThrow<T>` and `invokeWithRecovery<T>`.
`BaseInvoke<T>` retains `validate`, `invoke`, `normalize`, `afterSuccess`; drop
`fallbackCode` and `deviceId`. `ThrowingInvoke<T>` adds `mapError: (error: unknown) =>
VeepooError`. `RecoveringInvoke<T>` retains `recover: (error: unknown) => T`.
`invokeOrThrow` calls `throw options.mapError(error)` in the catch block.
`invokeWithRecovery` calls `return options.recover(error)` in the catch block.
`invokeWithRecovery` carries a JSDoc comment specifying the contract: use only when a
safe default exists and partial results are valid; `recover` must log via `rt.handleError`.

**`SubsystemRuntime` interface (modify)**
`nativeOpFailed(error: unknown): never` → `nativeOpFailed(error: unknown): VeepooError`.

**`VeepooSDKRuntime` implementation (modify)**
`nativeOpFailed`: remove `throw`; return the `VeepooError` from `handleError` directly.

**All six subsystem files (mechanical update)**
- `import { invokeNative }` → `import { invokeOrThrow }` (and `invokeWithRecovery`
  where the file has `recover` sites).
- All `throwMapped` calls become `invokeOrThrow` calls with `mapError`.
- Inline `throwMapped: (e) => { throw this.rt.handleError(e, "CODE", id); }` →
  `mapError: (e) => this.rt.handleError(e, "CODE", id)`.
- `throwMapped: (e) => this.rt.nativeOpFailed(e)` → `mapError: (e) => this.rt.nativeOpFailed(e)`.
- Three `recover` call sites become `invokeWithRecovery`.
- Remove `fallbackCode: "...",` and `deviceId: this.rt.state.connectedDeviceId ?? undefined,`
  from all call-site options objects (these move into the `mapError` closure).

### Error code placement
`fallbackCode` and `deviceId` move from the options object into the `mapError` lambda.
No information is lost; the code is now exactly where it is used.

### No new abstractions
`nativeOpFailed` is retained on `SubsystemRuntime` (return type changed). No new
helper methods are added. The 60-site boilerplate `mapError: (e) => this.rt.nativeOpFailed(e)`
is acceptable: it is a one-liner and consistent.

## Testing Decisions

**What makes a good test here:**
Test only external behaviour — what goes in, what comes out, whether an exception is
thrown. Do not test that a specific internal branch was taken.

**Tests to write / update (`native-invoke-pipeline.test.ts`):**

- `invokeOrThrow` happy path: validate called, invoke awaited, normalize applied,
  afterSuccess called, result returned.
- `invokeOrThrow` error path: confirm the error thrown by `invokeOrThrow` is the
  exact `VeepooError` object returned by `mapError` (not a new error, not a wrapped
  error). Confirm `mapError` was called exactly once with the native rejection.
- `invokeOrThrow` validate throws: confirm a `VeepooError` thrown by `validate`
  propagates without calling `invoke`.
- `invokeWithRecovery` happy path: same as above without error handler.
- `invokeWithRecovery` error path: native rejection calls `recover`; the fallback value
  is returned; no exception propagates to the caller.

**Prior art:** existing three-case test in `src/__tests__/native-invoke-pipeline.test.ts`.

## Out of Scope

- Per-method JSDoc on `SubsystemRuntime` interface documenting which operations are
  throw vs recover — the function name split makes the choice self-documenting at the
  call site.
- A lint rule enforcing the contract — the two-function split makes wrong choices
  visible without a custom rule.
- Renaming `nativeOpFailed` to reflect its changed return type — the name is still
  accurate as a description of the operation ("a native op failed; here is the error").
- Changing the behaviour of `handleError` (logging, emitting the `error` event).
- Any changes to native Android/iOS bridge code.

## Further Notes

Three `recover` call sites exist in the current codebase:
- `BandDiscovery.checkBluetoothStatus` — returns `false` (safe: unknown Bluetooth state)
- `BandDiscovery.requestPermissions` — returns `{granted: false, status: "denied", canAskAgain: true}` (safe: permission request failed)
- `SessionConnection.getConnectionStatus` — returns `"disconnected"` (safe: unable to determine status)

All three are legitimate uses of recovery: the caller can proceed with the default.
All three already call `rt.handleError` (log + emit error event) before returning the
fallback, so they already follow the contract that the JSDoc will document.
