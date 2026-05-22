# refactor(types): per-subsystem interfaces + VeepooSDKModuleInterface composition

**Issue:** #136
**Status:** Closed (superseded by ADR 0005)
**Labels:** needs-triage
**Parent:** #130

## Superseded

This issue is superseded by **[ADR 0005](../adr/0005-facade-interface-composition-by-construction.md)** (2026-05-22). The codebase decomposed past the six sub-class layout this issue described — there is no `DeviceSettings` / `AlarmSettings` / `HealthConfig` class today, only 36 per-feature `*Capability` classes under `src/capabilities/<feature>/`. The intent of PRD #130 user story #10 ("adding a method to a subsystem propagates to the facade type automatically") is **already delivered by construction**: each capability class is its own interface, and `VeepooSDK.<capability>: <Capability>Class` makes the propagation typed. The 12 dead interfaces were deleted; `src/sdk/subsystem-interfaces.ts` was renamed to `src/sdk/runtime-interfaces.ts` and now contains only `SubsystemRuntime` and `LifecycleRuntime`.

## What to build

Introduce a TypeScript interface per subsystem: `BandDiscoveryInterface`, `SessionInterface`, `HealthDataInterface`, `DeviceSettingsInterface`, `RealtimeTestsInterface`, and `SdkLifecycleInterface`. Each interface declares only the methods that subsystem exposes. Compose `VeepooSDKModuleInterface` as an intersection of these. In the same slice, narrow the subsystem constructor parameter from the full `VeepooSDKRuntime` to a minimal intersection of `EventBusInterface`, `StateInterface`, and `LoggerInterface` — so tests for a subsystem can mock only the slice it uses. The public surface seen by host apps (`VeepooSDKModuleInterface` method signatures, event types) is unchanged.

## Acceptance criteria

- [ ] `BandDiscoveryInterface`, `SessionInterface`, `HealthDataInterface`, `DeviceSettingsInterface`, `RealtimeTestsInterface`, `SdkLifecycleInterface` each exist and declare only that subsystem's methods
- [ ] `VeepooSDKModuleInterface` is composed as an intersection of the six subsystem interfaces — adding a method to a subsystem interface automatically propagates to the composed type
- [ ] Each subsystem's constructor accepts a narrow runtime interface (not the concrete `VeepooSDKRuntime`) — a subsystem that needs only the event bus and logger does not require a state parameter
- [ ] `VeepooSDK` (the facade) continues to satisfy the composed `VeepooSDKModuleInterface`
- [ ] TypeScript compiles with no new errors
- [ ] All existing tests pass unchanged

## Blocked by

#135 — EventBus extraction (subsystems narrow their constructor dependency onto `EventBusInterface`, which must exist first)
