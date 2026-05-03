# 0124 — feat: offline vitals history

> GitHub: https://github.com/launchbox-tech/expo-veepoo-sdk/issues/124
> Labels: needs-triage
> Status: open

## Parent

#118

## What to build

Bridge five per-modality DB-read paths that retrieve historical measurements stored on the Band:
- `readStoredTemperatureData(date?)` → `storedTemperatureData`
- `readStoredBloodGlucoseData(date?)` → `storedBloodGlucoseData`
- `readStoredHrvData(date?)` → `storedHrvData`
- `readStoredEcgData(date?)` → `storedEcgData`
- `readStoredBodyCompositionData(date?)` → `storedBodyCompositionData`

All five read from the vendor SDK's internal SQLite DB — not directly from Band BLE. The app must have called `startReadOriginData()` or `readDeviceAllData()` first to populate recent records. This prerequisite must be documented in the JSDoc of each method.

## Acceptance criteria

- [ ] Each stored-vitals payload type extends its live counterpart with an added `timestamp: string` field
- [ ] All five read methods accept an optional `date?: string` (format `YYYY-MM-DD`); default to today
- [ ] All five reject with `CAPABILITY_UNSUPPORTED` when the corresponding capability flag is absent
- [ ] All five emit their event for each stored record found; methods resolve void
- [ ] iOS: `veepooSDKGetDeviceTemperatureDataWithDate`, `veepooSDKGetDeviceBloodGlucoseDataWithDate`, `veepooSDKGetDeviceHrvDataWithDate`, `veepooSDKGetDeviceOffStoreECGWithDate`, `veepooSDKGetDeviceOffStoreBodyCompositionWithDate` wired; device MAC address passed as `tableID`
- [ ] Android: all five equivalent DB-read paths wired
- [ ] JSDoc on each method documents the "call startReadOriginData first" prerequisite
- [ ] Normalizer unit-tested for each of the five modalities
- [ ] All 5 methods + 5 events added to bridge-contract registries
- [ ] Parity matrix rows added under "Historical & periodic data" for each modality

## Blocked by

None — can start immediately
