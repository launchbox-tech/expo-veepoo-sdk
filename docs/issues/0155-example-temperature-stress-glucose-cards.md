# feat(example): add Temperature, Stress, Blood Glucose test cards

**Issue:** #155
**Status:** Closed
**Labels:** enhancement, ready-for-agent
**Parent:** #154

## What to build

Extend `useHealthTests` with three missing realtime-test modalities and surface them in the health-test and vitals-lab sections of the example app.

## Acceptance criteria

- [ ] `useHealthTests` manages `TEMPERATURE`, `STRESS`, and `BLOOD_GLUCOSE` via `startTest`/`stopTest` with `RealtimeTest` constants
- [ ] Hook subscribes to `temperatureTestResult`, `stressData`, and `bloodGlucoseData` events
- [ ] Each modality has start/stop buttons in the example UI
- [ ] Terminal states (`over`, `error`, `notWear`, `complete`) clear `activeTest`
