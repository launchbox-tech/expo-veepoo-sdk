# Issue #9: Example app — historical data sync (sleep + steps)

> GitHub: https://github.com/launchbox-tech/expo-veepoo-sdk/issues/9
> Status: open | Type: AFK | Blocked by: #7

## Parent

[#1 Initial setup: verify fork builds + create example app](https://github.com/launchbox-tech/expo-veepoo-sdk/issues/1)

## What to build

Add a "Sync Data" button to the session section that calls `startReadOriginData()`. A progress indicator driven by `readOriginProgress` events shows sync progress. After sync completes, the app displays a sleep summary and today's step count. Verifiable on a physical HBand device with recorded activity data.

## Acceptance criteria

- [ ] "Sync Data" button calls `startReadOriginData()` and shows a progress indicator
- [ ] `readOriginProgress` events update the progress indicator
- [ ] Sleep summary (duration, stages) is displayed after sync completes
- [ ] Step count for today is displayed after sync completes
- [ ] "Sync Data" button is disabled when no Session is active
- [ ] Data verified on a physical HBand device with recorded data

## Blocked by

- [#7 Example app: connect + Session + disconnect/reconnect](https://github.com/launchbox-tech/expo-veepoo-sdk/issues/7)
