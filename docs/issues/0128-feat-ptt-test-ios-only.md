# 0128 — feat: PTT test (iOS only) — HITL

> GitHub: https://github.com/launchbox-tech/expo-veepoo-sdk/issues/128
> Labels: needs-triage
> Status: open

## Parent

#118

## What to build

Bridge the PTT (Pulse Transit Time) chest-mode electrode test on iOS. PTT is architecturally different from other realtime tests: in addition to start/stop + result events, the device maintains a persistent `pttStateChanged` listener that fires independently whenever the device enters or exits PTT mode. Android has no documented PTT vendor path.

**HITL**: The persistent-listener lifecycle (when to register, when to remove, how it interacts with the realtime mutex) requires a human architectural decision before implementation begins.

## Acceptance criteria

- [ ] Architectural decision recorded: how the persistent PTT state listener is registered and cleaned up
- [ ] `PttState` type: `'active' | 'inactive'`
- [ ] `PttTestResult` interface: `{ heartRate: number; hrv: number; qtInterval: number; signalQuality: number; progress: number }`
- [ ] `startPttTest()` starts PTT measurement; rejects `CAPABILITY_UNSUPPORTED` on Android and when iOS capability absent; rejects `REALTIME_TEST_IN_PROGRESS` if another test is active
- [ ] `stopPttTest()` stops the measurement; resolves void
- [ ] `pttTestResult` event emitted on each value update
- [ ] `pttStateChanged` event emitted when device autonomously enters/exits PTT mode
- [ ] iOS: `veepooSDKPTTTest:valueBlock:signalBlock:` and `veepooSDKAddPTTStateListener:` wired
- [ ] Android: both methods reject with `CAPABILITY_UNSUPPORTED`
- [ ] Methods + events added to bridge-contract registries
- [ ] Parity matrix row added under "Real-time health tests" with note "iOS only"

## Blocked by

None — can start immediately (but architectural decision in acceptance criteria must precede native implementation)
