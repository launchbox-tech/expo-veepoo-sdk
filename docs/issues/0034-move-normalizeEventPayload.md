# refactor(normalizers): move normalizeEventPayload into normalizers.ts

> GitHub: https://github.com/launchbox-tech/expo-veepoo-sdk/issues/34
> Labels: needs-triage
> Status: open
> Parent: #32

## What to build

Move `normalizeEventPayload` from `VeepooSDK.ts` into `normalizers.ts` as a proper named export. Update the import in `VeepooSDK.ts`. Remove the `@ts-ignore` from `VeepooSDK.test.ts`. Extend `normalizers.test.ts` to cover all switch cases from the new location.

## Acceptance criteria

- [ ] `normalizeEventPayload` is a named export from `normalizers.ts`
- [ ] `normalizeEventPayload` no longer exists in `VeepooSDK.ts`
- [ ] No `@ts-ignore` remains in `VeepooSDK.test.ts` for this import
- [ ] `normalizers.test.ts` covers all switch cases of `normalizeEventPayload`
- [ ] All existing tests pass unchanged

## Blocked by

- #33
