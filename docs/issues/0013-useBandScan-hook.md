# Issue #13: example: extract useBandScan hook

> GitHub: https://github.com/launchbox-tech/expo-veepoo-sdk/issues/13
> Status: closed | Labels: enhancement, needs-triage

## Parent

[refactor(example): extract custom hooks per SDK lifecycle phase](https://github.com/gaozh1024/expo-veepoo-sdk/issues/1)

## What to build

Move the Band Discovery phase into `hooks/useBandScan.ts`. The hook owns the `devices` list, uses `useSDKEvent('deviceFound', handler, appState === 'scanning')` to subscribe only during the scanning phase, and exposes `startScan` and `stopScan`. Dispatches `SCAN_START`, `SCAN_STOP`, and `BAND_SELECTED` actions.

The main component removes its `devices` useState, the `deviceFound` useEffect block, `handleStartScan`, and `handleStopScan`.

## Acceptance criteria

- [ ] `hooks/useBandScan.ts` exists; owns `devices`; uses `useSDKEvent` (no direct `useEffect` in the hook)
- [ ] `devices` useState removed from main component
- [ ] Scan useEffect block removed from main component
- [ ] `handleStartScan` / `handleStopScan` useCallbacks removed from main component
- [ ] Scan still works end-to-end: tapping Scan populates the device list, Stop Scan returns to idle
- [ ] `tsc --noEmit` passes with zero errors

## Blocked by

- [#12](https://github.com/launchbox-tech/expo-veepoo-sdk/issues/12)
