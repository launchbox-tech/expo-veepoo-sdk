# 71 — feat(vitals): breathing realtime test JS bridge (iOS + Android)

> GitHub: https://github.com/launchbox-tech/expo-veepoo-sdk/issues/71  
> Status: closed (sync from GitHub) | Android native completed in **1.2.11**

## Parent

[#66 — PRD: Realtime vitals (HRV, ECG, fatigue, breathing) JS parity](https://github.com/launchbox-tech/expo-veepoo-sdk/issues/66)

## What to build

Expose **breathing realtime manual test** end-to-end (vendor-equivalent breathing/coaching/measurement flow): `startBreathingTest` / `stopBreathingTest`, **`breathingTestResult`** events, types, iOS + Kotlin bridges, normalizers, Jest tests. Respect mutex + stable errors from foundation.

**Docs/example/matrix/release notes** deferred to **consolidated docs issue** after all four modalities.

## Acceptance criteria

- [x] Public API matches PRD naming; both native platforms unless **Partial** with justification.
- [x] Normalizers + unit tests for breathing result payloads.
- [x] Stable errors for unsupported / mutex / Session eligibility.
- [x] **Research notes (AFK):** Android: `VPOperateManager.startDetectBreath` / `stopDetectBreath`, `IBreathDataListener.onDataChange(BreathData)`; fields `progressValue`, `value` (rate), `deviceState` / `deviceStateEnum` (`EDeviceStatus`). iOS: `veepooSDKTestBreathingRateStart` / `VPTestBreathingRateState`. Matrix **Further notes** updated.
- [x] CI green (TS tests; native rebuild in consuming app).

## Native mapping (Android, 1.2.11)

- Mutex kind: **`breathing`**. Listener reference held on module for **`stopDetectBreath`** (vendor requires the same `IBreathDataListener` instance).
- Terminal: `FINISH`, `UNPASS_WEAR`, `BUSY`, `CHARGING`, `CHARG_LOW`, `KEEP_QUIT`, or `progressValue >= 100`; then auto `stopDetectBreath` + `endRealtimeTest`.
