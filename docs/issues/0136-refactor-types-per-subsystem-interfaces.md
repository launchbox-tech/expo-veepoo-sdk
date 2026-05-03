# refactor(types): per-subsystem interfaces + VeepooSDKModuleInterface composition

**Issue:** #136
**Status:** Open
**Labels:** needs-triage
**Parent:** #130

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
