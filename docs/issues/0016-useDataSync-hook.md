# Issue #16: example: extract useDataSync hook

> GitHub: https://github.com/launchbox-tech/expo-veepoo-sdk/issues/16
> Status: closed | Labels: enhancement, needs-triage

## Parent

[refactor(example): extract custom hooks per SDK lifecycle phase](https://github.com/gaozh1024/expo-veepoo-sdk/issues/1)

## What to build

Move historical data sync state and handler into `hooks/useDataSync.ts`. The hook owns `dataSyncing`, `dataSyncProgress`, `sleepSummary`, and `stepData`. Uses `useSDKEvent` for `readOriginProgress`, `readOriginComplete`, `sleepData`, and `sportStepData` — all guarded by `appState === 'ready'`. Exposes `syncData`.

Note: `batteryData` was already moved to `useBandSession` in #14 — do not re-add it here.

The main component removes its 4 data sync useState calls, the data sync useEffect block, and the `handleSyncData` useCallback.

## Acceptance criteria

- [ ] `hooks/useDataSync.ts` exists; owns 4 state variables; uses `useSDKEvent` for 4 events (not batteryData)
- [ ] Data sync useEffect block removed from main component
- [ ] `handleSyncData` useCallback removed from main component
- [ ] Sync works end-to-end: Sync Data → progress indicator → sleep summary + step count displayed
- [ ] `tsc --noEmit` passes with zero errors

## Blocked by

- [#14](https://github.com/launchbox-tech/expo-veepoo-sdk/issues/14)
