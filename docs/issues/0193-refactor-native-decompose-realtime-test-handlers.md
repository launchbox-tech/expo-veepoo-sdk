# refactor(native): decompose realtime-test handlers (iOS + Android)

**Issue:** #193
**Status:** Open
**Labels:** enhancement

## What to build

Decompose monolithic realtime-test native code so it aligns structurally with the JS table model (`REALTIME_TEST_DEFINITIONS`, ADR 0007).

- **iOS:** Split [`ios/VeepooSDK/VeepooSDKModule+Handlers.swift`](../../ios/VeepooSDK/VeepooSDKModule+Handlers.swift) (~1310 lines): separate historical read helpers from realtime-test handlers; extract shared lifecycle (`ensureMeasurementCanStart`, `finishMeasurement`, mutex); prefer a registry or thin per-modality adapters.
- **Android:** Decompose [`android/src/main/kotlin/expo/modules/veepoo/VeepooSDKModuleTests.kt`](../../android/src/main/kotlin/expo/modules/veepoo/VeepooSDKModuleTests.kt) (~849 lines) symmetrically.

## Acceptance criteria

- No single native file dedicated to realtime-test handling exceeds **~400 lines** after split (or justified exception documented in PR).
- Parity: mutex errors, event names, start/stop paths unchanged; existing tests pass.
- Adding a modality should touch a **registry or one small file per platform**, not a new full copy-paste switch block.

## References

- [`src/capabilities/realtime-tests/registry.ts`](../../src/capabilities/realtime-tests/registry.ts)
- ADR 0007, CONTEXT.md § Realtime test definitions
