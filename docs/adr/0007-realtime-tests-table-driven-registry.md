# Realtime tests are table-driven via `REALTIME_TEST_DEFINITIONS`

## Status

Accepted

## Context

The realtime-test family had 13 isomorphic verticals — heart rate, blood pressure, blood oxygen, temperature, stress, blood glucose, HRV, ECG, fatigue, breathing, body composition, blood analysis, GSR, PTT. Each was declared in four places:

1. A `start*Test()` / `stop*Test()` pair on `RealtimeTestsNativeMethods` (`src/capabilities/realtime-tests/native.ts`).
2. A result-shape interface and an `is*TestResult` normalizer in `types.ts` / `normalizers.ts`.
3. A row in the per-modality `dispatch` table inside `RealtimeTestsCapability` (`src/capabilities/realtime-tests/index.ts`).
4. A `defineEvent(...)` block in `src/bridge/event-registry.ts` declaring the `*_test_result` event with `wrapInner('result' | 'data', normalize*)`.

ECG was excluded from the `dispatch` table and the `RealtimeTestModality` enum, with bespoke `startEcgTest(options?)` / `stopEcgTest()` methods.

Adding a new modality required four edits across three files. Drift was easy: the result type could exist with no dispatch, or vice versa. The cross-file relationship was implicit.

## Decision

The realtime-test family is **table-driven** by a single registry, `REALTIME_TEST_DEFINITIONS`, in `src/capabilities/realtime-tests/registry.ts`. Each row binds one modality to:

- `event` — the JS event name carrying the result (e.g. `heart_rate_test_result`).
- `eventField` — the envelope field holding the inner payload (`result` or `data`).
- `logScope` — the `LogScope` used when the runtime logs the result event.
- `normalize` — the inner-payload normalizer.
- `control` (optional) — a `{ start, stop }` pair that dispatches the native methods. Omitted for receive-only modalities (`blood_analysis`, `gsr`, `ptt`).

Consequences:

1. **`RealtimeTestsCapability` dispatches via the registry.** `startTest()` / `stopTest()` read the row's `control` and invoke it through `ctx.invoke`. The previous per-modality `dispatch` field is gone.
2. **ECG joined the table** with a per-row options escape hatch on `control.start`. `RealtimeTestModality` now includes `'ecg'`. `startTest('ecg', opts?)` is a typed overload of the unified surface; `startEcgTest()` / `stopEcgTest()` remain as one-line backward-compatibility helpers.
3. **`RealtimeTestModality` is derived from the registry** — keys whose row has a `control` field. Receive-only modalities (`blood_analysis`, `gsr`, `ptt`) are intentionally excluded from the type because the capability cannot start/stop them.
4. **`src/bridge/event-registry.ts` derives** its 14 realtime-test result-event defs from the registry. The previous 14 hand-written `defineEvent({...})` blocks are gone. `nativeName` is derived via `eventNameToNative(row.event)` (snake → camel).
5. **`ptt_state_changed` stays as a bespoke event-registry entry** (passthrough; no inner-payload normalization). It is not a realtime-test result event.

Adding a new realtime test now means adding one row.

## Consequences

- **Positive:** One row defines a realtime test end-to-end. Drift between the result type, normalizer, dispatch, and event-registry entry is eliminated. The bridge contract checks (event-registry derived tables) automatically pick up new rows.
- **Positive:** ECG no longer requires a bespoke API. The options escape hatch generalises to any future test that needs configuration.
- **Positive:** Future architecture reviews seeing the realtime-test family and suggesting "extract a table for these isomorphic tests" should treat this ADR as the answer — the table exists at `src/capabilities/realtime-tests/registry.ts`.
- **Negative:** The bridge module (`src/bridge/event-registry.ts`) now imports from a capability module (`src/capabilities/realtime-tests/registry.ts`). This direction (bridge → capabilities/normalizers) already existed for inner-payload normalizers; the registry import follows the same pattern.
- **Negative:** The realtime-test event-defs lose their `as const` literal narrowing because they are constructed at module load via `Object.fromEntries`. The `satisfies { [K in VeepooEvent]: EventDef<K> }` check on the merged `EVENT_DEFINITIONS` still enforces exhaustiveness.

## Links

- Architecture review (2026-05-22): `/improve-codebase-architecture` candidate #1
- Registry: [`src/capabilities/realtime-tests/registry.ts`](../../src/capabilities/realtime-tests/registry.ts)
- Capability: [`src/capabilities/realtime-tests/index.ts`](../../src/capabilities/realtime-tests/index.ts)
- Bridge derivation: [`src/bridge/event-registry.ts`](../../src/bridge/event-registry.ts) (`REALTIME_TEST_EVENT_DEFINITIONS`)
- CONTEXT.md term: "Realtime test definitions"
- Related: [`ADR 0005`](0005-facade-interface-composition-by-construction.md) — capability classes are their own interface; this ADR extends the "interface by construction" idea to the bridge's event-def block.
