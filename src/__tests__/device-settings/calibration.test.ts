jest.mock('expo-modules-core', () => ({
  requireNativeModule: jest.fn().mockReturnValue({}),
}));
jest.mock('react-native', () => ({
  Platform: { OS: 'ios' },
}));

import { CalibrationCapability } from '@/capabilities/calibration/index';
import { VeepooSDKRuntime } from '@/sdk/veepoo-sdk-runtime';
import { makeMockNative, type MockNative } from '@/__tests__/helpers/mock-native';

describe('CalibrationCapability', () => {
  let native: MockNative;
  let runtime: VeepooSDKRuntime;
  let calibration: CalibrationCapability;

  beforeEach(() => {
    native = makeMockNative();
    runtime = new VeepooSDKRuntime(native);
    calibration = new CalibrationCapability(runtime.createCapabilityContext());
  });

  // ── calibrateBloodPressure ────────────────────────────────────────────────

  it('calibrateBloodPressure(120, 80) delegates to native', async () => {
    const result = await calibration.calibrateBloodPressure(120, 80);

    expect(native.calibrateBloodPressure).toHaveBeenCalledWith(120, 80);
    expect(result).toBe('success');
  });

  it('calibrateBloodPressure(30, 80) rejects with INVALID_ARGUMENT (systolic out of range)', async () => {
    await expect(calibration.calibrateBloodPressure(30, 80)).rejects.toMatchObject({
      code: 'INVALID_ARGUMENT',
    });
    expect(native.calibrateBloodPressure).not.toHaveBeenCalled();
  });

  it('calibrateBloodPressure(120, 300) rejects with INVALID_ARGUMENT (diastolic out of range)', async () => {
    await expect(calibration.calibrateBloodPressure(120, 300)).rejects.toMatchObject({
      code: 'INVALID_ARGUMENT',
    });
    expect(native.calibrateBloodPressure).not.toHaveBeenCalled();
  });

  // ── calibrateBloodGlucose ─────────────────────────────────────────────────

  it('calibrateBloodGlucose(5.5) delegates to native', async () => {
    const result = await calibration.calibrateBloodGlucose(5.5);

    expect(native.calibrateBloodGlucose).toHaveBeenCalledWith(5.5);
    expect(result).toBe('success');
  });

  it('calibrateBloodGlucose(1) rejects with INVALID_ARGUMENT (below range)', async () => {
    await expect(calibration.calibrateBloodGlucose(1)).rejects.toMatchObject({
      code: 'INVALID_ARGUMENT',
    });
    expect(native.calibrateBloodGlucose).not.toHaveBeenCalled();
  });

  it('calibrateBloodGlucose(31) rejects with INVALID_ARGUMENT (above range)', async () => {
    await expect(calibration.calibrateBloodGlucose(31)).rejects.toMatchObject({
      code: 'INVALID_ARGUMENT',
    });
    expect(native.calibrateBloodGlucose).not.toHaveBeenCalled();
  });

  // ── setBloodGlucoseRiskLevel ──────────────────────────────────────────────

  it('setBloodGlucoseRiskLevel({ low: 4, high: 10, unit: "mmol_l" }) delegates to native', async () => {
    const result = await calibration.setBloodGlucoseRiskLevel({ low: 4, high: 10, unit: 'mmol_l' });

    expect(native.setBloodGlucoseRiskLevel).toHaveBeenCalledWith(4, 10, 'mmol_l');
    expect(result).toBe('success');
  });

  it('setBloodGlucoseRiskLevel({ low: 10, high: 4, unit: "mmol_l" }) rejects with INVALID_ARGUMENT (low >= high)', async () => {
    await expect(
      calibration.setBloodGlucoseRiskLevel({ low: 10, high: 4, unit: 'mmol_l' }),
    ).rejects.toMatchObject({ code: 'INVALID_ARGUMENT' });
    expect(native.setBloodGlucoseRiskLevel).not.toHaveBeenCalled();
  });

  it('setBloodGlucoseRiskLevel with low == high rejects with INVALID_ARGUMENT', async () => {
    await expect(
      calibration.setBloodGlucoseRiskLevel({ low: 5, high: 5, unit: 'mg_dl' }),
    ).rejects.toMatchObject({ code: 'INVALID_ARGUMENT' });
  });

  // ── CAPABILITY_UNSUPPORTED ────────────────────────────────────────────────

  it('native rejection CAPABILITY_UNSUPPORTED is re-thrown as { code: "CAPABILITY_UNSUPPORTED" }', async () => {
    native.calibrateBloodPressure.mockRejectedValueOnce({ code: 'CAPABILITY_UNSUPPORTED', message: 'not supported' });

    await expect(calibration.calibrateBloodPressure(120, 80)).rejects.toMatchObject({
      code: 'CAPABILITY_UNSUPPORTED',
    });
  });
});
