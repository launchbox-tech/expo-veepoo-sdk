jest.mock('expo-modules-core', () => ({
  requireNativeModule: jest.fn().mockReturnValue({}),
}));
jest.mock('react-native', () => ({
  Platform: { OS: 'ios' },
}));

import { AutoMeasureCapability } from '@/capabilities/auto-measure';
import { VeepooSDKRuntime } from '@/sdk/veepoo-sdk-runtime';
import { makeMockNative, type MockNative } from '@/__tests__/helpers/mock-native';

describe('AutoMeasureCapability', () => {
  let native: MockNative;
  let runtime: VeepooSDKRuntime;
  let autoMeasure: AutoMeasureCapability;

  beforeEach(() => {
    native = makeMockNative();
    runtime = new VeepooSDKRuntime(native);
    autoMeasure = new AutoMeasureCapability(runtime.createCapabilityContext());
  });

  // ── readAutoMeasureSetting ─────────────────────────────────────────────

  it('readAutoMeasureSetting delegates to native and normalizes the array shape', async () => {
    native.readAutoMeasureSetting.mockResolvedValueOnce([
      {
        protocolType: 1,
        funType: 2,
        isSwitchOpen: true,
        stepUnit: 5,
        isSlotModify: false,
        isIntervalModify: true,
        supportStartMinute: 60,
        supportEndMinute: 1380,
        measureInterval: 30,
        currentStartMinute: 480,
        currentEndMinute: 1080,
      },
    ]);

    const result = await autoMeasure.readAutoMeasureSetting();

    expect(native.readAutoMeasureSetting).toHaveBeenCalledTimes(1);
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      protocol_type: 1,
      fun_type: 2,
      is_switch_open: true,
      step_unit: 5,
      is_slot_modify: false,
      is_interval_modify: true,
      support_start_minute: 60,
      support_end_minute: 1380,
      measure_interval: 30,
      current_start_minute: 480,
      current_end_minute: 1080,
    });
  });

  it('readAutoMeasureSetting returns an empty array when native returns a non-array', async () => {
    native.readAutoMeasureSetting.mockResolvedValueOnce(null);

    const result = await autoMeasure.readAutoMeasureSetting();

    expect(result).toEqual([]);
  });

  // ── modifyAutoMeasureSetting ────────────────────────────────────────────

  it('modifyAutoMeasureSetting converts snake_case fields to camelCase for native', async () => {
    native.modifyAutoMeasureSetting.mockResolvedValueOnce([]);

    await autoMeasure.modifyAutoMeasureSetting({
      fun_type: 2,
      is_switch_open: true,
      measure_interval: 30,
    });

    expect(native.modifyAutoMeasureSetting).toHaveBeenCalledWith({
      funType: 2,
      isSwitchOpen: true,
      measureInterval: 30,
    });
  });

  it.each([
    { name: 'measure_interval below 1', input: { measure_interval: 0 } },
    { name: 'measure_interval above 120', input: { measure_interval: 121 } },
    { name: 'current_start_minute below 0', input: { current_start_minute: -1 } },
    { name: 'current_start_minute above 1439', input: { current_start_minute: 1440 } },
    { name: 'current_end_minute below 0', input: { current_end_minute: -1 } },
    { name: 'current_end_minute above 1439', input: { current_end_minute: 1440 } },
  ])('modifyAutoMeasureSetting rejects $name → INVALID_ARGUMENT, no native call', async ({ input }) => {
    await expect(
      autoMeasure.modifyAutoMeasureSetting(input),
    ).rejects.toMatchObject({ code: 'INVALID_ARGUMENT' });
    expect(native.modifyAutoMeasureSetting).not.toHaveBeenCalled();
  });

  it('modifyAutoMeasureSetting passes for empty partial', async () => {
    native.modifyAutoMeasureSetting.mockResolvedValueOnce([]);
    await expect(autoMeasure.modifyAutoMeasureSetting({})).resolves.toBeDefined();
  });
});
