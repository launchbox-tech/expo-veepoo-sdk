# Harvest lives in the example app, not the SDK

## Status

Accepted

## Context

The example app is gaining a **Harvest** (see `CONTEXT.md`): a one-button flow
that, within a Session, sequentially runs every *supported* controllable
realtime test, passively captures receive-only results, and reads all historical
data and device config — aggregating everything into one exportable
`HarvestResult`.

The SDK already ships an *optional* orchestration helper for a smaller flow:
`runSessionBaseline(sdk, config)` / `attachSessionBaseline` under the
tree-shakeable `expo-veepoo-sdk/session` subpath (`CONTEXT.md` → "Session
baseline"). The obvious symmetry argument is: "the Harvest is just a bigger
baseline — ship `runHarvest(sdk, config)` next to it."

We deliberately did **not** do that. A `runHarvest` helper would have to bake in
opinions that are genuinely the host app's to make:

- **Order** of the realtime sweep (passive tests first, contact-dependent ECG /
  body-composition last).
- **Per-test timeout**, and the `device_busy` retry/backoff policy.
- **Per-model gating** — which tests to attempt based on `readDeviceFunctions()`.
- **Interactive checkpoints** — pausing to nudge the user to hold a finger on the
  electrode for contact-dependent tests.
- **History range** (default 7 days) and how a `HarvestResult` is shaped/exported.

`runSessionBaseline` earns its place because it is *unopinionated*: three
documented calls (`syncPersonalInfo`, `readBattery`, `readDeviceVersion`) run in
parallel with no policy. The Harvest is the opposite — it is almost entirely
policy. `CONTEXT.md` already states the host app owns flows like reconnection,
retry loops, and Band Discovery for the same reason.

## Decision

The Harvest orchestration lives in `example/` only. The SDK exposes the
per-capability methods the Harvest composes (`realtimeTests.startTest/stopTest`,
the historical reads, `readDeviceFunctions`, battery/version) and the event bus
it listens on — **and nothing named `runHarvest`/`harvest` on the module
surface**.

If a future host app needs the sweep as a reusable primitive, it can be promoted
then. Moving app code up into the SDK is a cheap, additive refactor; the reverse
(retracting a published, opinion-laden API) is the expensive direction, so we
default to keeping it in the app until a second consumer proves the policy is
stable and shared.

## Consequences

- **Positive:** The published SDK surface stays a set of unopinionated capability
  methods. The opinionated, model- and UX-coupled sweep policy lives where it can
  iterate freely without a breaking-change cost.
- **Positive:** A future architecture review seeing `runSessionBaseline` but no
  `runHarvest` should treat this ADR as the answer — the asymmetry is intentional
  (baseline is policy-free; Harvest is policy), mirroring how
  [`ADR 0008`](0008-no-convenience-hooks.md) preempts "add `useIsConnected`."
- **Negative:** A real companion app that wants this flow re-implements the
  orchestration (or copies it from `example/`) until it is promoted. Accepted: we
  have one consumer today, and the policy is still being learned on real Bands.
- **Negative:** The example app carries non-trivial logic (sequencing, mutex
  handling, timeouts, contact prompts) that is not exercised by the SDK's own
  test suite. Mitigated by keeping the orchestrator's pure pieces (ordering,
  outcome reduction) unit-testable in `example/`.

## Links

- Glossary: `CONTEXT.md` → "Harvest (example app)" and "Session baseline".
- Related: [`ADR 0008`](0008-no-convenience-hooks.md) — same "a layer must earn
  its keep over the methods it wraps" principle, applied to React hooks.
- Related: [`ADR 0005`](0005-facade-interface-composition-by-construction.md) —
  "interface ≈ implementation is not earning its keep."
- Grill-with-docs session #5 (Harvest flow), decision 2.
