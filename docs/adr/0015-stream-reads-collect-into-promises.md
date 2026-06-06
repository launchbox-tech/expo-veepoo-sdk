# Stream reads collect into promises (dedicated completion events)

## Status

Accepted (2026-06-06)

## Context

Several vendor read operations deliver their result as an **event stream**,
not a return value: one BLE command triggers N data events followed by a
completion signal. Exercise history is the first (`startReadExerciseData` →
N × `exercise_session_data` → done); the stored-record family
(`stored_ecg_data`, `stored_hrv_data`, `stored_temperature_data`,
`stored_blood_glucose_data`, `stored_body_composition_data`) has the same
shape behind `startReadOriginData`.

Two problems surfaced when the first host app (rayu) wired exercise sync:

1. **Completion-event reuse.** Both native layers signaled exercise-read
   completion by re-emitting `read_origin_complete` — Android because the
   vendor listener is literally named `onReadOriginComplete`, iOS by copying
   that choice. Any listener awaiting *origin* completion (the host app's
   sync, the example app's Harvest) can be falsely completed by an exercise
   read, and nothing in the payload distinguishes the two.

2. **Per-consumer collection loops.** With only a raw fire-and-forget command
   exposed, every consumer must hand-roll the same dance: subscribe to the
   data event, subscribe to completion, fire the command, guard with a stall
   watchdog (a command silently dropped by the Band never completes —
   observed 2026-06-04 on `readDeviceAllData`), unsubscribe on every exit
   path. N streamed modalities × M consumers copies of a footgun-prone loop.

## Decision

1. **Every stream read gets its own completion event.** Exercise reads emit
   `exercise_read_complete`, never `read_origin_complete`. Vendor callback
   naming is an implementation detail; our event surface does not inherit its
   ambiguity. Future streamed reads follow suit (one completion event per
   stream family).

2. **The bridge exposes a collector, not just the command.** The capability
   surface is `readExerciseSessions(): Promise<ExerciseSession[]>` — it
   subscribes, fires the command, collects until the completion event, guards
   with a stall watchdog, and always unsubscribes. The raw command stays
   native-only. Precedent: `readOriginData(offset)` returns data; **data
   reads return data**.

3. **Boundary with ADR-0011 (Harvest lives in the example app):** a stream
   read is a *single vendor operation* whose result happens to arrive in
   pieces — collecting those pieces is bridge concern. *Sequencing multiple
   modalities*, per-model gating, and retry policy remain host-app opinions.
   The collector takes no ordering or gating decisions; it rejects
   `CAPABILITY_UNSUPPORTED` distinctly (per ADR-0003) so hosts can record
   capability gaps, and resolves `[]` for "supported, nothing stored".

## Consequences

- The collect-until-complete helper is generic; slice 2 modalities (stored
  ECG et al.) become one-liners over the same helper instead of new loops.
- A dedicated completion event per stream family means native emit-site
  changes (both platforms) when wrapping a new streamed read — a deliberate
  cost; reusing an existing event name is how problem 1 happened.
- Host apps lose the temptation to listen for `exercise_session_data`
  directly during a sync; the events remain on the bus for diagnostic
  consumers, but the supported API is the promise.
- A stalled Band read rejects (watchdog) instead of hanging a sync forever —
  the same failure mode class ADR-0012 fixed for promise-returning vendor
  calls, applied to event-stream reads.
- Stream reads with vendor progress callbacks forward them as a dedicated
  progress event (`exercise_read_progress`) which **re-arms the watchdog**:
  a slow transfer streaming progress is alive, not stalled (the first
  real-band run was killed mid-transfer by a silence-only watchdog). The
  collector exposes them via an `onProgress` option; completion payloads
  carrying `success: false` reject (`OPERATION_FAILED`) rather than passing
  off partial data as complete.
