# 110 — Slice 1: Extract InitializingScreen, ConnectingScreen, DisconnectedScreen

> GitHub: https://github.com/launchbox-tech/expo-veepoo-sdk/issues/110
> Status: closed | Labels: needs-triage, enhancement

## Parent
#109

## What to build
Extract the three pre-connection JSX blocks (initializing, connecting, disconnected states) from `index.tsx` into dedicated screen components. `index.tsx` switch cases call these components instead of inline JSX.

## Acceptance criteria
- [ ] `InitializingScreen.tsx` created with initializing state JSX (lines 129-137)
- [ ] `ConnectingScreen.tsx` created with connecting state JSX (lines 139-149)
- [ ] `DisconnectedScreen.tsx` created with disconnected state JSX (lines 151-181)
- [ ] Each component receives `appState`, `connectingDevice`, `connectError`, `connectedDevice`, `reconnect` as props
- [ ] `index.tsx` imports and uses these three components
- [ ] `tsc --noEmit` passes with zero errors
- [ ] `index.tsx` reduced by ~80 lines

## Blocked by
None - can start immediately
