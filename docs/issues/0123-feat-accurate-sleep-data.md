# 0123 — feat: accurate sleep data

> GitHub: https://github.com/launchbox-tech/expo-veepoo-sdk/issues/123
> Labels: needs-triage
> Status: open

## Parent

#118

## What to build

Expose the detailed sleep model stored by the Band for devices that support precise sleep tracking. Richer than `readSleepData`: adds REM duration, insomnia detection flags and scores, fall-asleep latency, and a per-minute sleep-state curve (deep / light / REM / insomnia / awake).

Introduce `readAccurateSleepData(date?: string)` and `accurateSleepData` events. The existing `readSleepData` is not deprecated.

## Acceptance criteria

- [ ] `SleepMinuteState` type: `'deep' | 'light' | 'rem' | 'insomnia' | 'awake'`
- [ ] `SleepMinutePoint` interface: `{ index: number; state: SleepMinuteState }`
- [ ] `AccurateSleepSession` interface includes: `sleepTime`, `wakeTime`, `deepDuration`, `lightDuration`, `remDuration`, `getUpDuration`, `sleepDuration`, `getUpTimes`, `sleepQuality` (0–4), `insomniaScore`, `insomniaTimes`, `fallAsleepScore`, `sleepEfficiencyScore`, `curve: SleepMinutePoint[]`
- [ ] `readAccurateSleepData(date?)` resolves void (data arrives via events); rejects `CAPABILITY_UNSUPPORTED` when `supportAccurateSleep` flag absent
- [ ] `accurateSleepData` event emitted per session found for the queried date
- [ ] iOS: `parseSleepLine` used to decode hex curve string into `SleepMinutePoint[]`
- [ ] Android: equivalent accurate-sleep read path wired and gated
- [ ] Normalizer unit-tested: hex curve string decodes to correct `SleepMinutePoint[]` array
- [ ] Method + event added to bridge-contract registries
- [ ] Parity matrix row added under "Historical & periodic data"

## Blocked by

None — can start immediately
