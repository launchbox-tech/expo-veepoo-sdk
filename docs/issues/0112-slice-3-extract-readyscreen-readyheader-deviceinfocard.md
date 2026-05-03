# 112 — Slice 3: Extract ReadyScreen shell + ReadyHeader + DeviceInfoCard

> GitHub: https://github.com/launchbox-tech/expo-veepoo-sdk/issues/112
> Status: open | Labels: needs-triage, enhancement

## Parent
#109

## What to build
Extract the entire `case 'ready':` JSX (lines 183-865) into `ReadyScreen.tsx`. Extract the header (title + device name) into `ReadyHeader.tsx` and Device Info card into `DeviceInfoCard.tsx`. ReadyScreen composes the remaining inline JSX (cards 11-26) for now — they will be extracted in Slices 4-7.

## Acceptance criteria
- [ ] `ReadyScreen.tsx` created with ready state JSX
- [ ] `ReadyHeader.tsx` created with title + device name (lines 191-196)
- [ ] `DeviceInfoCard.tsx` created with battery + firmware info (lines 198-221)
- [ ] `ReadyScreen` receives `connectedDevice`, `batteryInfo`, `deviceVersion`, `syncDone` as props
- [ ] `index.tsx` imports and uses `ReadyScreen`
- [ ] `tsc --noEmit` passes with zero errors
- [ ] `index.tsx` reduced to ~300 lines

## Blocked by
None - can start immediately
