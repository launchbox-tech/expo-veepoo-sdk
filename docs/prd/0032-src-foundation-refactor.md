# PRD: refactor(src): foundation — domain-split types, thin native adapter, validators layer

> GitHub: https://github.com/launchbox-tech/expo-veepoo-sdk/issues/32
> Labels: needs-triage
> Status: open

## Problem Statement

As an SDK maintainer preparing to expand from ~30 to ~80+ public methods (adding ECG, HRV, alarms, OTA, dial management, contacts, etc.), the current flat `src/` layout is hitting its limits in three concrete ways.

**Types:** All 60+ TypeScript type definitions live in a single 604-line `types.ts`. With ~40 new types coming, this file will grow to 1200+ lines with no locality — a developer working on alarm types has to navigate a file that also contains BLE connection types, sleep data structures, error codes, and logging interfaces. The `VeepooEventPayload` mapped type already imports types from every domain, making a future split harder with each feature added.

**Native adapter:** `NativeVeepooSDK.ts` contains a 230-line `VeepooSDKNativeWrapper` class whose every method is a 2-line pass-through delegation with zero logic. Deletion test: remove the class and callers use `NativeVeepooSDKInterface` directly — no complexity reappears anywhere. The class is growing automatically as new native methods are added, purely as ceremony. Simultaneously, the JS-layer public contract has no formal interface — there is no declared surface that both the real `VeepooSDK` class and test mocks must satisfy, so mock drift is only caught at runtime.

**Validators:** There is no input validation layer before the native bridge. `connect('')`, `syncPersonalInfo({ height: -5 })`, and the upcoming `setAlarm({ hour: 25 })` all silently reach native code and fail with opaque `OPERATION_FAILED` errors. This failure mode will recur for every new write-command feature — there is currently no test surface for input correctness that doesn't require a BLE mock.

## Solution

Restructure `src/` in three sequential steps, each producing a smaller, deeper module at a real seam:

1. **Domain-split `types.ts`** into 7 focused files under `src/types/` with a barrel `index.ts` that preserves the existing public import paths. Each new feature domain gets a clear home; cross-domain dependencies become visible in import statements; `VeepooEventPayload` in `events.ts` imports explicitly from each domain file.

2. **Delete `VeepooSDKNativeWrapper`**, keeping only the `NativeVeepooSDKInterface` and the existing `requireNativeModule`/Proxy loader. Introduce `VeepooSDKModuleInterface` — a ~60-line explicit contract for the JS layer that `VeepooSDK` implements and test mocks also implement, catching drift at compile time.

3. **Add `src/validators/`** — pure functions, one file per feature domain, each throwing `VeepooError` on invalid input. `VeepooSDK` calls validators before native calls. Tests need no BLE mock.

## User Stories

1. As an SDK maintainer adding alarm types, I want a `src/types/settings.ts` file, so that I am not scrolling through BLE connection types to find the right place.
2. As an SDK maintainer adding ECG test result types, I want a `src/types/health-tests.ts` file, so that health test shapes are co-located regardless of which measurement they describe.
3. As an SDK maintainer, I want `VeepooEvent` and `VeepooEventPayload` in a dedicated `src/types/events.ts`, so that the event registry is the one file I open when adding a new event.
4. As an SDK maintainer, I want `VeepooErrorCode` and `VeepooError` in a dedicated `src/types/errors.ts`, so that the error vocabulary is isolated from health data shapes.
5. As an SDK maintainer, I want `FunctionStatus` defined in `src/types/device.ts`, so that the type describing device capability state lives with the device capability types that use it.
6. As a host-app developer, I want the public import path `from 'expo-veepoo-sdk'` to be unchanged after the types split, so that I do not need to update any imports in my app.
7. As an SDK maintainer, I want `NativeVeepooSDK.ts` to contain only the `NativeVeepooSDKInterface` and the `requireNativeModule`/Proxy loader (~70 lines), so that adding a native method does not require two edits in the same file.
8. As an SDK maintainer, I want `VeepooSDK` to accept `NativeVeepooSDKInterface` directly via constructor injection, without an intermediate wrapper class, so that the injection seam is unambiguous.
9. As an SDK maintainer, I want a `VeepooSDKModuleInterface` that declares every public method of the JS SDK layer, so that test mocks and the real implementation are held to the same contract.
10. As an SDK maintainer writing a test that depends on `VeepooSDK`, I want to mock using `VeepooSDKModuleInterface`, so that my mock is type-checked against the real API and breaks at compile time if the SDK changes.
11. As a host-app developer, I want `connect('')` to throw a `VeepooError` with code `INVALID_ARGUMENT` and a clear message before touching native, so that I learn about the mistake in JS rather than receiving an opaque native error.
12. As a host-app developer, I want `syncPersonalInfo({ height: -5, weight: 300, age: 0 })` to throw a `VeepooError` immediately with the out-of-range field named, so that I can fix the caller without guessing which field is wrong.
13. As an SDK maintainer adding `setAlarm()`, I want to write a `validateAlarm()` pure function first, so that the input contract is specified and tested before any native code is written.
14. As an SDK maintainer, I want validator tests to require no BLE mock or native module setup, so that input correctness tests run in isolation and stay fast.
15. As an SDK maintainer, I want validators to throw `VeepooError` (not raw `Error`), so that host-app catch blocks can handle validation failures the same way they handle native errors.
16. As an SDK maintainer, I want each feature domain to have its own validator file (`validators/connection.ts`, `validators/device-settings.ts`, etc.), so that a change to alarm validation does not require opening a file that also validates BLE connection options.
17. As an SDK maintainer, I want shared primitive validators (`isNonEmptyString`, `isInRange`, `isValidDate`) in `validators/shared.ts`, so that domain validators compose them rather than repeating the same guard logic.
18. As an SDK maintainer, I want all validators re-exported from `validators/index.ts`, so that import paths inside `VeepooSDK.ts` stay short.
19. As an SDK maintainer, I want the `normalizeEventPayload` function moved from `VeepooSDK.ts` into `normalizers.ts` as a proper named export, so that the `@ts-ignore` import in tests is eliminated and the function is co-located with the normalizers it dispatches to.
20. As an SDK maintainer, I want the `src/types/` barrel `index.ts` to re-export every type so that internal modules can import from domain files while external consumers import from the barrel unchanged.

## Implementation Decisions

### Types split ordering

The types split is the prerequisite for everything else — normalizers, validators, and `VeepooSDKModuleInterface` all import from types. The split must land first.

Domain files and their contents:
- `connection.ts` — `VeepooDevice`, `ConnectionStatus`, `ConnectionResult`, `ScanOptions`, `ScanResult`, `ConnectOptions`, `DeviceTimeSetting`, `BluetoothState`, `BluetoothAuthorization`, `PermissionStatus`, `PermissionsResult`, `BluetoothStatus`, `PasswordStatus`, `PasswordData`
- `device.ts` — `FunctionStatus` (canonical home), `DeviceFunctionPackage1–5`, `DeviceFunctions`, `DeviceVersion`, `ChargeState`, `BatteryInfo`, `Sex`, `PersonalInfo`, `SocialMsgData`, `CustomSettingData`, `DeviceAlarm`, `DeviceData`
- `health-data.ts` — `HeartRateData`, `BloodPressureData`, `BloodOxygenData`, `TemperatureData`, `StressData`, `BloodGlucoseData`, `SleepDataItem`, `SleepData`, `DailyHealthData`, `SportStepData`, `DaySummaryData`, `OriginData`, `HalfHourData`, `Spo2OriginData`
- `health-tests.ts` — `TestState`, `HeartRateTestResult`, `BloodPressureTestResult`, `BloodOxygenTestResult`, `TemperatureTestResult`, `BloodGlucoseTestResult`, `ReadState`, `ReadOriginProgress`
- `settings.ts` — `AutoMeasureSetting`, `Language`, `TemperatureUnit`, `DistanceUnit`, `TimeFormat`, `BloodGlucoseUnit`, `OperationStatus`
- `events.ts` — `VeepooEvent` (union), `VeepooEventPayload` (mapped type); imports from all other domain files
- `errors.ts` — `VeepooErrorCode`, `VeepooError`, `LogLevel`, `LogScope`, `LogEntry`

`FunctionStatus` lives in `device.ts` (Option A). `connection.ts` and `settings.ts` import it from there. This creates a one-way dependency graph: `events.ts` → all others; `connection.ts` → `device.ts`; no cycles.

The barrel `src/types/index.ts` re-exports everything, so `import type { X } from './types.js'` in `NativeVeepooSDK.ts` and `VeepooSDK.ts` requires no changes. Internal modules may import from domain files directly.

### Native adapter

Delete `VeepooSDKNativeWrapper` class entirely. The `requireNativeModule`/Proxy loader block stays. `NativeVeepooSDK.ts` exports only `NativeVeepooSDKInterface` and the loaded `NativeVeepooSDK` constant (~70 lines total).

Default parameter values that lived on wrapper methods (`dayOffset = 0`, `is24Hour = false`) move to the `VeepooSDK` call sites where they express caller assumptions.

### Module interface

`src/VeepooSDKModule.ts` declares `VeepooSDKModuleInterface` — every public method signature of `VeepooSDK`. `VeepooSDK` adds `implements VeepooSDKModuleInterface`. Test mock constructors type their return as `VeepooSDKModuleInterface`.

### Validators

`src/validators/shared.ts` provides: `isNonEmptyString`, `isInRange(min, max)`, `isValidDate`, `isValidHour`, `isValidMinute`.

Domain validators in this refactor (more to follow with each new feature):
- `validators/connection.ts` — `validateDeviceId(id)`, `validateConnectOptions(opts)`, `validatePersonalInfo(info)`
- `validators/device-settings.ts` — `validateAlarm(alarm)` (scaffolded, full implementation when alarm API ships), `validateAutoMeasureSetting(setting)`

Each validator throws `VeepooError` with `code: 'INVALID_ARGUMENT'` (new error code to add to `VeepooErrorCode`).

### `normalizeEventPayload` relocation

Move `normalizeEventPayload` from `VeepooSDK.ts` to `normalizers.ts` as a proper named export. Update the import in `VeepooSDK.ts`. Remove the `@ts-ignore` from `VeepooSDK.test.ts`.

## Testing Decisions

Good tests assert observable external behaviour through the module's declared interface, not implementation details. They do not assert which internal helper was called or how many times a private method ran.

**What to test:**

- **Types split** — no runtime tests; verified by TypeScript compilation and that all existing tests still compile and pass after the barrel re-export is in place.
- **Native adapter deletion** — existing `VeepooSDK.test.ts` suite must pass unchanged. The deletion is verified by the fact that `VeepooSDKNativeWrapper` no longer exists in the codebase.
- **`VeepooSDKModuleInterface`** — verified at compile time; `VeepooSDK implements VeepooSDKModuleInterface` fails to compile if any method signature drifts.
- **Validators** — primary new test surface. Tests live in `src/__tests__/validators/`. Each test file covers one domain validator file. Tests call validators directly with valid and invalid inputs; no BLE mock, no SDK setup. Prior art: `src/__tests__/normalizers.test.ts` for the pattern of testing pure functions in isolation.
- **`normalizeEventPayload` relocation** — existing `normalizers.test.ts` tests move or expand to cover this function from its new location. The `@ts-ignore` import disappearing is a test of correctness.

**Modules with tests in this refactor:** validators (new), normalizers (extended).

## Out of Scope

- Any new health feature implementation (ECG, HRV, alarms, OTA, etc.) — foundation only.
- Native Android or iOS code changes — this refactor touches only `src/`.
- Changes to `example/` — the example app's imports remain through the barrel.
- Splitting `normalizers.ts` by domain — follow-on candidate if the file grows similarly.
- Splitting `VeepooSDK.ts` into feature-domain sub-modules — separate refactor once the feature surface is stable.

## Further Notes

The three steps are strictly ordered: types split → adapter cleanup + Module interface → validators. Each step is independently mergeable. After this foundation lands, every new feature PR follows the pattern: add types to the relevant domain file, add a validator, add normalizer cases, wire native methods.

The `INVALID_ARGUMENT` error code added to `VeepooErrorCode` is the first in a family of pre-bridge validation errors. Future features will add validators using the same code.
