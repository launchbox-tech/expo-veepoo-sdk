# Issue #21: example: extract HealthTestCard + barrel export + final index.tsx cleanup

> GitHub: https://github.com/launchbox-tech/expo-veepoo-sdk/issues/21
> Status: closed | Labels: enhancement, ready-for-agent

## Parent

[refactor(example): extract presentational components from index.tsx](https://github.com/launchbox-tech/expo-veepoo-sdk/issues/18)

## What to build

Extract the `HealthTestCard` component (health test card with start/stop button, progress bar, and result display) into `example/src/components/HealthTestCard.tsx`. Drop the unused `unit` prop from its type and all call sites. Add `example/src/components/index.ts` as a barrel re-exporting all three components. Remove all remaining inline component definitions, dead style keys, and inline color constant definitions from `index.tsx`. After this slice `index.tsx` contains only hook calls, stale-state derivations, and JSX.

## Acceptance criteria

- [ ] `example/src/components/HealthTestCard.tsx` contains the `HealthTestCard` function and its styles
- [ ] `HealthTestCard` imports `BLUE` and `RED` from `./theme`; `unit` prop is removed from the type and all call sites
- [ ] `example/src/components/index.ts` re-exports `DeviceRow`, `InfoRow`, and `HealthTestCard`
- [ ] `index.tsx` imports all three components from `../components` (single import line via barrel)
- [ ] `index.tsx` contains no inline sub-component function definitions below the default export
- [ ] `index.tsx` contains no `BLUE`/`RED`/`GREEN` constant definitions (uses imports from `../components/theme`)
- [ ] All `testCardRow`/`testLabel`/`testBtn`/`testBtnIdle`/`testBtnStop`/`testBtnDisabled`/`testBtnText`/`testBtnTextDisabled`/`testResult`/`testStateMsg` style keys removed from `index.tsx`
- [ ] `tsc --noEmit` passes with zero errors

## Blocked by

- [#19](https://github.com/launchbox-tech/expo-veepoo-sdk/issues/19)
- [#20](https://github.com/launchbox-tech/expo-veepoo-sdk/issues/20)
