# Issue #8: Example app — real-time health tests (HR, BP, SpO2)

> GitHub: https://github.com/launchbox-tech/expo-veepoo-sdk/issues/8
> Status: open | Type: AFK | Blocked by: #7

## Parent

[#1 Initial setup: verify fork builds + create example app](https://github.com/launchbox-tech/expo-veepoo-sdk/issues/1)

## What to build

Add HR, BP, and SpO2 test buttons to the session section of the example app. Each button starts its respective measurement, shows a progress bar driven by test-progress events, and displays the result when complete. Verifiable on a physical HBand device with a live Session.

## Acceptance criteria

- [ ] "Start Heart Rate Test" button calls `startHeartRateTest()`; `heartRateTestResult` events update a progress bar and display BPM when complete
- [ ] "Start Blood Pressure Test" button calls the BP test method; result shows systolic/diastolic values
- [ ] "Start SpO2 Test" button calls the SpO2 test method; result shows blood oxygen percentage
- [ ] All three buttons are disabled when no Session is active
- [ ] Each test result is verified on a physical HBand device

## Blocked by

- [#7 Example app: connect + Session + disconnect/reconnect](https://github.com/launchbox-tech/expo-veepoo-sdk/issues/7)
