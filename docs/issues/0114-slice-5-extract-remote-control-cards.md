# 114 — Slice 5: Extract remote control cards (CameraMusic, GpsAgps, BandBluetooth, FirmwareDfu)

> GitHub: https://github.com/launchbox-tech/expo-veepoo-sdk/issues/114
> Status: open | Labels: needs-triage, enhancement

## Parent
#109

## What to build
Extract 4 remote-control/config cards from `ReadyScreen.tsx` into individual files.

- `CameraMusicCard.tsx` (lines 412-486)
- `GpsAgpsCard.tsx` (lines 488-512)
- `BandBluetoothCard.tsx` (lines 514-563)
- `FirmwareDfuCard.tsx` (lines 565-575)

## Acceptance criteria
- [ ] All 4 card components created with co-located styles
- [ ] Each component receives `sdk` instance or relevant callbacks as props
- [ ] `useState` for card-specific UI state (e.g. `cameraInfo`, `gpsInfo`) moved into respective card component
- [ ] `ReadyScreen.tsx` imports and uses all 4 components
- [ ] `tsc --noEmit` passes with zero errors

## Blocked by
#112
