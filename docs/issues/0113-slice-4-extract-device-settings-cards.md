# 113 — Slice 4: Extract device settings cards (FindBand, WatchFace, ScreenLight, Sedentary, WristFlip, WomenHealth)

> GitHub: https://github.com/launchbox-tech/expo-veepoo-sdk/issues/113
> Status: closed | Labels: needs-triage, enhancement

## Parent
#109

## What to build
Extract 6 device-config cards from `ReadyScreen.tsx` into individual files with co-located styles. Each receives its data + callbacks via props.

- `FindBandCard.tsx` (lines 223-257)
- `WatchFaceCard.tsx` (lines 259-283)
- `ScreenLightCard.tsx` (lines 285-332)
- `SedentaryCard.tsx` (lines 334-358)
- `WristFlipCard.tsx` (lines 360-384)
- `WomenHealthCard.tsx` (lines 386-410)

## Acceptance criteria
- [ ] All 6 card components created with co-located styles
- [ ] Each component receives `sdk` instance or relevant callbacks as props
- [ ] `useState` for card-specific UI state (e.g. `screenLightInfo`) moved into respective card component
- [ ] `ReadyScreen.tsx` imports and uses all 6 components
- [ ] `tsc --noEmit` passes with zero errors

## Blocked by
#112
