# 111 — Slice 2: Extract ScanScreen (idle/scanning + device list)

> GitHub: https://github.com/launchbox-tech/expo-veepoo-sdk/issues/111
> Status: open | Labels: needs-triage, enhancement

## Parent
#109

## What to build
Extract the idle/scanning fallthrough JSX (permission hint, scan/stop buttons, FlatList with DeviceRow) from `index.tsx` into `ScanScreen.tsx`.

## Acceptance criteria
- [ ] `ScanScreen.tsx` created with idle/scanning JSX (lines 868-963)
- [ ] `ScanScreen` receives `permissions`, `permissionsGranted`, `appState`, `devices`, `startScan`, `stopScan`, `connect` as props
- [ ] Permission hint, scan/stop buttons, and FlatList using `DeviceRow` all moved to ScanScreen
- [ ] `index.tsx` imports and uses `ScanScreen`
- [ ] `tsc --noEmit` passes with zero errors
- [ ] `index.tsx` reduced by ~95 lines

## Blocked by
None - can start immediately
