# Issue #20: example: extract InfoRow component

> GitHub: https://github.com/launchbox-tech/expo-veepoo-sdk/issues/20
> Status: closed | Labels: enhancement, ready-for-agent

## Parent

[refactor(example): extract presentational components from index.tsx](https://github.com/launchbox-tech/expo-veepoo-sdk/issues/18)

## What to build

Extract the `InfoRow` component (key-value display row used in the Device Info card) into `example/src/components/InfoRow.tsx` with its own StyleSheet. Update `index.tsx` to import `InfoRow` from the new file and remove the inline definition and its styles.

## Acceptance criteria

- [ ] `example/src/components/InfoRow.tsx` contains the `InfoRow` function and its styles (`infoRow`, `infoLabel`, `infoValue`)
- [ ] `index.tsx` imports `InfoRow` from `../components/InfoRow`
- [ ] `index.tsx` no longer defines `InfoRow` or the `infoRow`/`infoLabel`/`infoValue` style keys
- [ ] `tsc --noEmit` passes with zero errors

## Blocked by

None — can start immediately.
