# 115 — Slice 6: Extract health + vitals + event log (PersonalInfoSync, HealthTestsSection, VitalsLabSection, EventLogCard)

> GitHub: https://github.com/launchbox-tech/expo-veepoo-sdk/issues/115
> Status: closed | Labels: enhancement, ready-for-agent

## Parent
#109

## What to build
Extract health test section, vitals lab section, personal info sync row, and event log card from `ReadyScreen.tsx`.

- `PersonalInfoSync.tsx` (lines 577-590)
- `HealthTestsSection.tsx` (lines 592-741, uses HealthTestCard)
- `VitalsLabSection.tsx` (lines 636-741, uses HealthTestCard)
- `EventLogCard.tsx` (lines 743-776)

Note: HealthTestsSection and VitalsLabSection overlap in the original (lines 592-741 and 636-741). The extraction should create clean separate sections.

## Acceptance criteria
- [ ] `HealthTestsSection.tsx` created with Heart Rate, Blood Pressure, Blood Oxygen cards
- [ ] `VitalsLabSection.tsx` created with HRV, ECG, Fatigue, Breathing, Body Composition cards
- [ ] `PersonalInfoSync.tsx` created with sync status indicator
- [ ] `EventLogCard.tsx` created with scrollable log + clear button
- [ ] All components receive healthTests callbacks and state as props
- [ ] `ReadyScreen.tsx` imports and uses all components
- [ ] `tsc --noEmit` passes with zero errors

## Blocked by
#112
