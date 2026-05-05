# 0184 — feat: sensor calibration — JS layer

> GitHub: https://github.com/launchbox-tech/expo-veepoo-sdk/issues/184
> Labels: enhancement, needs-triage
> Status: OPEN

## Parent

#180

## What to build

Add a `CalibrationCapability` for pushing sensor calibration data to the Band: blood pressure offset, single-point blood glucose calibration, and blood glucose risk-level thresholds. All three are one-shot write operations gated on device capability flags. No native bridge code in this slice.

## Acceptance criteria

- [ ] `BloodGlucoseRiskConfig` type: `{ low: number; high: number; unit: BloodGlucoseUnit }`
- [ ] `CalibrationCapability` with three methods:
  - `calibrateBloodPressure(systolic: number, diastolic: number): Promise<OperationStatus>` — gated on BP capability flag; validates both values in physiologically plausible range (e.g. 60–250)
  - `calibrateBloodGlucose(value: number): Promise<OperationStatus>` — gated on glucose capability flag; validates value in range 2–30 mmol/L equivalent
  - `setBloodGlucoseRiskLevel(config: BloodGlucoseRiskConfig): Promise<OperationStatus>` — validates `low < high`, both in range
- [ ] All three reject with `CAPABILITY_UNSUPPORTED` when the corresponding `readDeviceFunctions()` flag is absent
- [ ] All three reject with `INVALID_ARGUMENT` for out-of-range inputs
- [ ] Native method names added to `async-native-method-registry.ts`
- [ ] Capability wired into `VeepooSDK` facade and `VeepooSDKModuleInterface`
- [ ] Unit tests: valid inputs delegate to native, out-of-range inputs reject before native is called, `CAPABILITY_UNSUPPORTED` when flag absent

## Blocked by

None — can start immediately
