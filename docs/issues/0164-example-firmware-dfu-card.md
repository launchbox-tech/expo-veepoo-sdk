# feat(example): activate FirmwareDfuCard — subscribe to progress event + dev trigger

**Issue:** #164
**Status:** Closed
**Labels:** enhancement, ready-for-agent
**Parent:** #154

## What to build

Extend the existing `FirmwareDfuCard` from an informational placeholder into an active component that subscribes to the DFU progress event and exposes a dev-only trigger button.

## Acceptance criteria

- [ ] Card subscribes to `firmwareDfuProgress` and displays `state` and `progress` fields when the event fires
- [ ] A dev-only "Start DFU" button calls `startLoraUpdate()` with a hardcoded test URL
- [ ] Progress display resets when a new DFU starts
