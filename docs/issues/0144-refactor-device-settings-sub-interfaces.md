# refactor(device-settings): add six sub-interfaces to subsystem-interfaces

**Issue:** #144
**Status:** Open
**Labels:** needs-triage, enhancement
**Parent:** #138

## What to build

Add `AlarmSettingsInterface`, `DisplaySettingsInterface`, `HealthConfigInterface`, `EmergencySettingsInterface`, `MediaInteractionInterface`, `SystemSettingsInterface` to `subsystem-interfaces.ts`. Make `DeviceSettingsInterface` extend all six. No runtime changes.

## Acceptance criteria

- [ ] Six new sub-interfaces declared in `subsystem-interfaces.ts`
- [ ] `DeviceSettingsInterface` body is empty — all methods inherited from sub-interfaces
- [ ] `VeepooSDKModuleInterface` unchanged
- [ ] All existing tests pass with no modifications

## Blocked by

None — can start immediately
