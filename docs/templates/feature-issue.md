# Feature vertical-slice checklist

> **Labels (GitHub):** start with `needs-triage` for new work; after maintainer triage, switch to `ready-for-agent` and/or `ready-for-human` and/or `enhancement`, and **remove** `needs-triage`. Do not leave `needs-triage` on **closed** issues; update the local mirror under `docs/issues/` the same way.

Every feature PR must satisfy all items below before merge.

## Native — Android
- [ ] `android/src/main/java/.../VeepooSDKModule<Feature>.kt` — implement module methods + emit events
- [ ] Add event name constants to `VeepooSDKConstants.kt`

## Native — iOS
- [ ] `ios/VeepooSDKModule+<Feature>.swift` — implement module methods + emit events

## Types
- [ ] `src/types/<domain>.ts` — add new interface(s) / enum(s)
- [ ] Re-export new types from `src/types/index.ts`

## Events
- [ ] `src/types/events.ts` — add new event name(s) to `VeepooEvent` union
- [ ] `src/types/events.ts` — add payload shape(s) to `VeepooEventPayload`

## Validators
- [ ] `src/validators/<domain>.ts` — add `validate<Feature>()` pure function(s)
- [ ] Re-export from `src/validators/index.ts`

## Normalizers
- [ ] `src/normalizers/<domain>.ts` — add `normalize<Feature>()` function(s)
- [ ] Add dispatch case(s) to `normalizeEventPayload` in `src/normalizers/events.ts`
- [ ] Re-export from `src/normalizers/index.ts`

## SDK — JS layer
- [ ] `src/VeepooSDK.ts` — add public method(s), wire validators + normalizers (delegate to `src/sdk/*` where appropriate)
- [ ] `src/VeepooSDKModule.ts` (`VeepooSDKModuleInterface`) — add new method signatures (or `src/types/module.ts` if the interface is relocated)

## Public API
- [ ] `src/index.ts` — re-export new type(s)

## Tests
- [ ] `src/__tests__/validators/<domain>.test.ts` — happy path + all invalid-input branches
- [ ] `src/__tests__/normalizers.test.ts` (or domain test file) — normalizeEventPayload cases for new events
- [ ] `npx tsc --noEmit` passes
- [ ] `npx jest --no-coverage` passes (all existing tests still green)

## Example app
- [ ] `example/src/` — add a minimal demo card / screen for the new feature
