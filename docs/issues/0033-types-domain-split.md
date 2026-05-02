# refactor(types): domain-split types.ts into src/types/ with barrel re-export

> GitHub: https://github.com/launchbox-tech/expo-veepoo-sdk/issues/33
> Status: closed | Labels: enhancement
> Parent: #32

## What to build

Split `src/types.ts` (604 lines) into 7 focused domain files under `src/types/` with a barrel `index.ts`. All existing import paths resolve unchanged. No runtime behaviour change.

Domain files: `connection.ts`, `device.ts` (home of `FunctionStatus`), `health-data.ts`, `health-tests.ts`, `settings.ts`, `events.ts`, `errors.ts`.

## Acceptance criteria

- [ ] `src/types.ts` deleted; contents distributed across 7 domain files
- [ ] `src/types/index.ts` barrel re-exports every previously exported type
- [ ] Existing imports in `NativeVeepooSDK.ts` and `VeepooSDK.ts` resolve without change
- [ ] `FunctionStatus` defined exactly once, in `device.ts`
- [ ] `tsc --noEmit` passes with zero errors
- [ ] All existing tests pass unchanged

## Blocked by

None — can start immediately.
