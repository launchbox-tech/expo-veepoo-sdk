# feat(example): HistoricalQueryCard — direct historical data reads

**Issue:** #163
**Status:** Closed
**Labels:** enhancement, ready-for-agent
**Parent:** #154

## What to build

New `HistoricalQueryCard` covering the four direct-query historical data methods (distinct from the event-based sync flow in `HistoricalDataSection`).

## Acceptance criteria

- [ ] "Read all data" → `readDeviceAllData()`, displays boolean result
- [ ] "Read sleep" → `readSleepData()` (no date arg), displays record count
- [ ] "Read steps" → `readSportStepData()`, displays record count
- [ ] "Read half-hour" → `readHalfHourData()`, displays record count
