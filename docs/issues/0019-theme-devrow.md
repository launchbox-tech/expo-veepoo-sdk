# Issue #19: example: extract theme.ts color constants + DeviceRow component

> GitHub: https://github.com/launchbox-tech/expo-veepoo-sdk/issues/19
> Status: closed | Labels: enhancement, ready-for-agent

## Parent

[refactor(example): extract presentational components from index.tsx](https://github.com/launchbox-tech/expo-veepoo-sdk/issues/18)

## What to build

Create `example/src/components/theme.ts` exporting the three color constants (`BLUE`, `RED`, `GREEN`) currently defined inline in `index.tsx`. Extract the `DeviceRow` component (Band Discovery list item) into `example/src/components/DeviceRow.tsx` with its own StyleSheet. Update `index.tsx` to import `DeviceRow` from the new file and colors from `theme.ts`. This establishes the `components/` directory and the pattern all subsequent extractions follow.

## Acceptance criteria

- [ ] `example/src/components/theme.ts` exports `BLUE`, `RED`, `GREEN`
- [ ] `example/src/components/DeviceRow.tsx` contains the `DeviceRow` function and its styles
- [ ] `DeviceRow` imports its color constants from `./theme`
- [ ] `index.tsx` imports `DeviceRow` from `../components/DeviceRow` and colors from `../components/theme`
- [ ] `index.tsx` no longer defines `DeviceRow` or the `deviceRow`/`deviceInfo`/`deviceName`/`deviceMeta`/`connectBtn`/`connectBtnPressed`/`connectBtnText` style keys
- [ ] `tsc --noEmit` passes with zero errors

## Blocked by

None — can start immediately.
