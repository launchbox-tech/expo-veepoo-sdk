# 116 — Slice 7: Extract historical data + disconnect (HistoricalDataSection, DisconnectButton)

> GitHub: https://github.com/launchbox-tech/expo-veepoo-sdk/issues/116
> Status: open | Labels: needs-triage, enhancement

## Parent
#109

## What to build
Extract historical data sync section and disconnect button from `ReadyScreen.tsx`.

- `HistoricalDataSection.tsx` (lines 778-847)
- `DisconnectButton.tsx` (lines 849-862)

## Acceptance criteria
- [ ] `HistoricalDataSection.tsx` created with sync button, progress bar, sleep summary, step data
- [ ] `DisconnectButton.tsx` created with disconnect button
- [ ] Components receive `dataSync` state/callbacks and `disconnect` as props
- [ ] `ReadyScreen.tsx` imports and uses both components
- [ ] `tsc --noEmit` passes with zero errors

## Blocked by
#112
