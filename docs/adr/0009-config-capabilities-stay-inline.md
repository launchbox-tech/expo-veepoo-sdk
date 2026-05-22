# Per-capability read/set stays inline; no `defineConfigCapability` factory

## Status

Accepted

## Context

The 2026-05-22 architecture review identified five capabilities that share a "read a config, validate, set a config" shape: `auto-measure`, `wrist-flip`, `sedentary-reminder`, `screen-light`, `device-switches`. The candidate was to extract a `defineConfigCapability` factory so each became a short declaration: native read/write methods + normalizer + optional validator → a class with `read()` / `set()` derived from the row.

Closer inspection of the five capabilities revealed that the surface is less uniform than the high-level survey suggested:

| Capability | Variance from the "single record read/set" baseline |
| --- | --- |
| `wrist-flip` | Clean match. `read()` returns one record; `set(settings)` validates a record. |
| `sedentary-reminder` | Clean match. Same shape as `wrist-flip`. |
| `auto-measure` | Returns and writes an **array** of records, not a single record. |
| `device-switches` | `setDeviceSwitch(type: string, enabled: boolean)` — two scalar args, not a config object. Normalizer carries a custom camelCase→switch-key table. |
| `screen-light` | Two unrelated read/set pairs in one capability: `Settings` (record) **and** `Duration` (primitive `number`). |

A factory broad enough to cover all five would have to be parameterised on:

- read return shape (record vs array)
- set arg shape (single config vs two scalars)
- per-pair multiplicity (one capability = one pair vs one capability = N pairs)
- custom key-mapping for normalizers
- whether `set()` returns the updated config (auto-measure) or `void` (others)

That factory would be a wider abstraction than the call sites it replaces, and it would re-introduce the exact kind of shallow indirection the deepening discipline is meant to eliminate. A factory narrowed to only the two clean matches (`wrist-flip` + `sedentary-reminder`) saves about 25 lines across two files and creates a one-purpose seam with no other adapters in sight — by the "two adapters = real seam" principle, that is also not enough leverage to justify the abstraction.

## Decision

The five capabilities stay as inline `read*()` / `set*()` methods over `ctx.invoke({...})`. There is no `defineConfigCapability` factory. The cross-capability "read a config, validate, set a config" similarity is acknowledged as a surface pattern, not a structural one — the divergences (array shape, two-arg set, multi-pair, custom switch tables) are load-bearing for each capability's own contract.

## Consequences

- **Positive:** Each capability remains directly readable. Adding or modifying a single config method touches one file with no factory configuration to thread through.
- **Positive:** Future architecture reviews seeing five `read*()` + `set*()` capabilities and proposing a `defineConfigCapability` factory should treat this ADR as the answer. The candidate was evaluated and the variance was load-bearing.
- **Negative:** The shared boilerplate — `ctx.invoke({ validate, invoke, normalize })` plus a `deepCamelKeys` cast on write — is repeated five times. This is accepted: it is the same level of repetition tolerated across the rest of the capability layer, and the alternative made things worse.
- **Negative:** If a sixth or seventh genuinely-isomorphic config capability lands (clean `read()`/`set(settings)` shape, single record, optional validator), revisit this ADR — the calculus changes when the controlled-variance set grows.

## Links

- Architecture review (2026-05-22): `/improve-codebase-architecture` candidate #3
- Capabilities surveyed:
  - [`src/capabilities/auto-measure.ts`](../../src/capabilities/auto-measure.ts)
  - [`src/capabilities/wrist-flip.ts`](../../src/capabilities/wrist-flip.ts)
  - [`src/capabilities/sedentary-reminder.ts`](../../src/capabilities/sedentary-reminder.ts)
  - [`src/capabilities/screen-light/index.ts`](../../src/capabilities/screen-light/index.ts)
  - [`src/capabilities/device-switches.ts`](../../src/capabilities/device-switches.ts)
- Related principle: [`LANGUAGE.md`](../../../.claude/skills/improve-codebase-architecture/LANGUAGE.md) — "one adapter = hypothetical seam. Two adapters = real seam."
- Related: [`ADR 0007`](0007-realtime-tests-table-driven-registry.md) — the realtime-tests table-drive landed precisely because its 14 verticals were genuinely isomorphic; this ADR is the reverse case.
