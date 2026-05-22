# Facade interface: composition by construction, not type intersection

## Status

Accepted

## Context

**PRD #130** (closed) created a set of per-subsystem TypeScript interfaces (`BandDiscoveryInterface`, `SessionInterface`, `HealthDataInterface`, `DeviceSettingsInterface`, `RealtimeTestsInterface`, `SdkLifecycleInterface`) in `src/sdk/subsystem-interfaces.ts`. User stories #9 and #10 explicitly wanted **`VeepooSDKModuleInterface`** to be an **intersection** of those interfaces, so that adding a method to a subsystem would propagate to the facade type automatically. That wiring never landed. **Issue #136** (open, `needs-triage`) tracked the remaining work.

**PRD #138** (closed) decomposed an earlier 552-line `DeviceSettings` god class into six sub-classes (`AlarmSettings`, `DisplaySettings`, `HealthConfig`, `EmergencySettings`, `MediaInteraction`, `SystemSettings`) and added six matching sub-interfaces, with **`DeviceSettingsInterface`** composed via `extends`. Issues **#144–#152** (closed) shipped that decomposition.

Since those PRDs closed, the codebase **kept decomposing**: the six `DeviceSettings` sub-classes were further split into the current 36 per-feature **`*Capability`** classes under `src/capabilities/<feature>/`, each carrying its own `<feature>NativeMethods` shape, normalizers, and validators. No `AlarmSettings` class exists anymore — `AlarmsCapability` does. The 12 semantic interfaces in `subsystem-interfaces.ts` describe a decomposition that **no longer exists in code**, and `VeepooSDKInterface` continues to be hand-maintained.

Architecturally, the **namespaced facade surface** (`sdk.battery.readBattery()`, `sdk.session.connect()`, …) already delivers what PRD #130 user story #10 asked for, **by construction**: each capability class's public methods *are* its interface, and `VeepooSDK.battery: BatteryCapability` is a typed property. Adding a method to `BatteryCapability` propagates to the facade automatically — no intersection type needed.

## Decision

1. The **facade type composes by construction**, not by type intersection. `VeepooSDK` exposes capability properties (`sdk.battery: BatteryCapability`, `sdk.session: SessionCapability`, …); each capability class is its own interface. Adding a method to a capability class propagates to the facade through the typed property — there is no separate `<Capability>Interface` to keep in sync.
2. The 12 dead semantic interfaces in `src/sdk/subsystem-interfaces.ts` (`SdkLifecycleInterface`, `BandDiscoveryInterface`, `SessionInterface`, `HealthDataInterface`, `AlarmSettingsInterface`, `DisplaySettingsInterface`, `HealthConfigInterface`, `EmergencySettingsInterface`, `MediaInteractionInterface`, `SystemSettingsInterface`, `DeviceSettingsInterface`, `RealtimeTestsInterface`) are **deleted**. The file is renamed to `src/sdk/runtime-interfaces.ts` and retains only **`SubsystemRuntime`** and **`LifecycleRuntime`** (the runtime-injection surface that `SdkLifecycle` and capability contexts depend on).
3. **`VeepooSDKInterface`** in `src/veepoo-sdk.ts` continues to be **hand-maintained**. The bulk of it is one-line capability properties whose types are already derived from the capability classes; the remaining ~80 flat-legacy delegation methods (`sdk.readBattery()` etc.) are the only hand-typed entries, and a separate review is open on whether to delete that surface entirely.
4. **Issue #136** is closed as **superseded** by this decision. Issues #144–#152 remain closed (their work shipped and was further decomposed).

## Consequences

- **Positive:** No dead scaffolding to keep aligned with capability folders. Capability classes are their own interface — adding a method has one place to edit. The runtime injection surface (`SubsystemRuntime` / `LifecycleRuntime`) is preserved because it has real consumers.
- **Positive:** Future architecture reviews don't re-suggest "wire up the per-subsystem interfaces" or "delete them" — this ADR records both the decision and the reason.
- **Negative:** A consumer wanting to type-narrow ("I only depend on battery") must depend on `BatteryCapability` directly rather than on a `BatteryInterface`. In practice this is the same TypeScript ergonomic — a class type is a valid structural interface.
- **Negative:** The hand-maintained `VeepooSDKInterface` legacy block (`sdk.readBattery()` and ~80 siblings) remains a manual surface until that delegation block is resolved separately.

## Revised (2026-05-22)

The original Decision retained both **`SubsystemRuntime`** and **`LifecycleRuntime`** in `src/sdk/runtime-interfaces.ts`, on the basis that both `SdkLifecycle` *and* capability contexts depended on them. In practice **capability contexts depend on `CapabilityContext`** (a focused, capability-tailored injection surface), not on `SubsystemRuntime`. `SubsystemRuntime` was only consumed via `LifecycleRuntime extends SubsystemRuntime`, with one downstream consumer (`SdkLifecycle`). The `SubsystemRuntime` chain was a pure pass-through.

`VeepooSDKRuntime.nativeOpFailed(error)` was likewise dead (no callers).

**Change:** Inlined `SubsystemRuntime`'s members into `LifecycleRuntime`; deleted `SubsystemRuntime` and `nativeOpFailed`. The single runtime-injection surface is now `LifecycleRuntime` for the lifecycle and `CapabilityContext` (from `src/capabilities/shared/context.ts`) for capabilities. The decomposition described by the original Decision (capability-class-as-interface) is unchanged.

## Links

- Superseded issue: GitHub #136 (`docs/issues/0136-refactor-types-per-subsystem-interfaces.md`)
- Parent PRD: GitHub #130 (`docs/prd/0130-architecture-js-layer-decomposition.md`)
- Related (still applies): [`ADR 0001`](0001-package-and-module-name.md) — naming kept as-is; speed over branding
- Runtime interface: [`src/sdk/runtime-interfaces.ts`](../../src/sdk/runtime-interfaces.ts)
- Capability injection surface: [`src/capabilities/shared/context.ts`](../../src/capabilities/shared/context.ts)
- Facade: [`src/veepoo-sdk.ts`](../../src/veepoo-sdk.ts)
