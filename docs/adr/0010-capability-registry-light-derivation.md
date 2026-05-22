# Capability registry drives only the constructor body

## Status

Accepted

## Context

`VeepooSDK` (`src/veepoo-sdk.ts`) used to list its 35 capabilities three times:

1. A property declaration on `VeepooSDKInterface` (the public facade type).
2. A matching `readonly` field on the class body.
3. An explicit `this.foo = new FooCapability(ctx)` in the constructor.

Adding a capability meant editing three places in one file. Imports added a fourth (the named class import). The compiler caught some kinds of drift (a missing class field would fail to satisfy `VeepooSDKInterface`) but not others — an imported class with no instantiation, or constructor and field declared out of order, would type-check but not behave as expected.

This shape was deliberate. [ADR 0005](0005-facade-interface-composition-by-construction.md) recorded that the facade "composes by construction, not by type intersection," and accepted `VeepooSDKInterface` as a hand-maintained list. The 2026-05-22 architecture review (`/improve-codebase-architecture` candidate #4) reopened the question with a narrower proposal: introduce a `CAPABILITIES` registry as the single source of truth for *which capabilities exist*, while preserving ADR-0005's "interface by construction" for the *types*.

Two paths were considered:

- **Light:** Registry drives only the constructor. `VeepooSDKInterface` properties and the class's `readonly` fields stay hand-typed. IDE Go-to-Definition on `sdk.battery` still resolves to `BatteryCapability` in one hop. Trade-off: capability instantiation moves to a `for` loop, but adding a capability still requires touching three places (registry row, interface row, class field row) — the constructor is no longer one of them.
- **Full:** Registry drives the constructor *and* the typed properties via TypeScript mapped types over `typeof CAPABILITIES`. One edit adds a capability. Trade-off: extra TS machinery, IDE jumps through the registry, walks away from ADR-0005's "interface by construction."

## Decision

The light path. `src/sdk/capability-registry.ts` exports `CAPABILITIES`, a typed map from facade property name to capability constructor (`{ alarms: AlarmsCapability, autoMeasure: AutoMeasureCapability, … }`, 35 entries). The `VeepooSDK` constructor iterates this map:

```ts
constructor(native = NativeVeepooSDK) {
  this.rt = new VeepooSDKRuntime(native);
  const ctx = this.rt.createCapabilityContext();
  for (const [key, Ctor] of Object.entries(CAPABILITIES)) {
    (this as unknown as Record<string, unknown>)[key] = new Ctor(ctx);
  }
}
```

`VeepooSDKInterface` and the class's `readonly` property declarations stay hand-typed. The fields carry the non-null assertion suffix (`!`) because their assignment happens in the loop, not inline. Adding a capability now means: (1) add one row to `CAPABILITIES`, (2) add one `readonly foo!: FooCapability` to the class, (3) add one `foo: FooCapability` to `VeepooSDKInterface`. The constructor is no longer touched.

## Consequences

- **Positive:** "Imported but never instantiated" drift is gone — the registry IS the instantiation. The constructor reads at a glance and stays a constant length as new capabilities are added.
- **Positive:** Reading the SDK still works the way ADR 0005 intended: `sdk.battery` resolves in one IDE hop to `BatteryCapability`. The capability classes remain their own interfaces; the facade type is composed by construction.
- **Positive:** The registry is a reusable seam for future tooling — bridge-contract checks, capability-coverage docs, or selective-import bundlers can read from it without re-parsing `veepoo-sdk.ts`.
- **Positive:** Future architecture reviews seeing the registry and proposing the "full" path (deriving the typed properties from the registry via mapped types) should treat this ADR as the deliberate choice. The full path was evaluated and rejected for IDE/reader cost.
- **Negative:** The class fields use `!` (definite-assignment assertion) because TypeScript can't see the loop-driven assignment. This is a small notation cost in exchange for the constructor's locality.
- **Negative:** ADR 0005's wording (the *facade type* "composes by construction") and this ADR's "registry drives only the constructor body" are subtly different angles on the same module. Together they say: capability classes are their own interface (ADR 0005); which capabilities the facade exposes is one table (this ADR).

## Links

- Architecture review (2026-05-22): `/improve-codebase-architecture` candidate #4
- Registry: [`src/sdk/capability-registry.ts`](../../src/sdk/capability-registry.ts)
- Facade: [`src/veepoo-sdk.ts`](../../src/veepoo-sdk.ts)
- Test surface: [`src/__tests__/capability-registry.test.ts`](../../src/__tests__/capability-registry.test.ts)
- Builds on: [`ADR 0005`](0005-facade-interface-composition-by-construction.md) — capability classes are their own interface; this ADR refines *the wiring of which capabilities the facade exposes* without changing that.
