jest.mock('expo-modules-core', () => ({
  requireNativeModule: jest.fn().mockReturnValue({}),
}));
jest.mock('react-native', () => ({
  Platform: { OS: 'ios' },
}));

import { RealtimeTestsCapability } from '@/capabilities/realtime-tests/index';
import { VeepooSDKRuntime } from '@/sdk/veepoo-sdk-runtime';
import { makeMockNative, type MockNative } from '@/__tests__/helpers/mock-native';
import type { RealtimeTestModality } from '@/types/index';

describe('RealtimeTestsCapability', () => {
  let native: MockNative;
  let runtime: VeepooSDKRuntime;
  let tests: RealtimeTestsCapability;

  beforeEach(() => {
    native = makeMockNative();
    runtime = new VeepooSDKRuntime(native);
    tests = new RealtimeTestsCapability(runtime.createCapabilityContext());
  });

  // ── Modality dispatch table ──────────────────────────────────────────────

  const modalities: ReadonlyArray<{
    modality: RealtimeTestModality;
    startMethod: keyof RealtimeTestsCapability extends never
      ? never
      :
          | 'startHeartRateTest'
          | 'startBloodPressureTest'
          | 'startBloodOxygenTest'
          | 'startTemperatureTest'
          | 'startStressTest'
          | 'startBloodGlucoseTest'
          | 'startHrvTest'
          | 'startFatigueTest'
          | 'startBreathingTest'
          | 'startBodyCompositionTest';
    stopMethod:
      | 'stopHeartRateTest'
      | 'stopBloodPressureTest'
      | 'stopBloodOxygenTest'
      | 'stopTemperatureTest'
      | 'stopStressTest'
      | 'stopBloodGlucoseTest'
      | 'stopHrvTest'
      | 'stopFatigueTest'
      | 'stopBreathingTest'
      | 'stopBodyCompositionTest';
  }> = [
    { modality: 'heart_rate' as RealtimeTestModality, startMethod: 'startHeartRateTest', stopMethod: 'stopHeartRateTest' },
    { modality: 'blood_pressure' as RealtimeTestModality, startMethod: 'startBloodPressureTest', stopMethod: 'stopBloodPressureTest' },
    { modality: 'blood_oxygen' as RealtimeTestModality, startMethod: 'startBloodOxygenTest', stopMethod: 'stopBloodOxygenTest' },
    { modality: 'temperature' as RealtimeTestModality, startMethod: 'startTemperatureTest', stopMethod: 'stopTemperatureTest' },
    { modality: 'stress' as RealtimeTestModality, startMethod: 'startStressTest', stopMethod: 'stopStressTest' },
    { modality: 'blood_glucose' as RealtimeTestModality, startMethod: 'startBloodGlucoseTest', stopMethod: 'stopBloodGlucoseTest' },
    { modality: 'hrv' as RealtimeTestModality, startMethod: 'startHrvTest', stopMethod: 'stopHrvTest' },
    { modality: 'fatigue' as RealtimeTestModality, startMethod: 'startFatigueTest', stopMethod: 'stopFatigueTest' },
    { modality: 'breathing' as RealtimeTestModality, startMethod: 'startBreathingTest', stopMethod: 'stopBreathingTest' },
    { modality: 'body_composition' as RealtimeTestModality, startMethod: 'startBodyCompositionTest', stopMethod: 'stopBodyCompositionTest' },
  ];

  it.each(modalities)(
    'startTest("$modality") delegates to native $startMethod',
    async ({ modality, startMethod }) => {
      await tests.startTest(modality);
      expect((native as unknown as Record<string, jest.Mock>)[startMethod]).toHaveBeenCalledTimes(1);
    },
  );

  it.each(modalities)(
    'stopTest("$modality") delegates to native $stopMethod',
    async ({ modality, stopMethod }) => {
      await tests.stopTest(modality);
      expect((native as unknown as Record<string, jest.Mock>)[stopMethod]).toHaveBeenCalledTimes(1);
    },
  );

  // ── ECG path (separate from the modality dispatch) ───────────────────────

  it('startEcgTest() delegates to native startEcgTest with no options', async () => {
    await tests.startEcgTest();

    expect(native.startEcgTest).toHaveBeenCalledTimes(1);
    expect(native.startEcgTest).toHaveBeenCalledWith(undefined);
  });

  it('startEcgTest({ include_waveform: true }) passes camelCase options to native', async () => {
    await tests.startEcgTest({ include_waveform: true });

    expect(native.startEcgTest).toHaveBeenCalledWith({ includeWaveform: true });
  });

  it('stopEcgTest() delegates to native', async () => {
    await tests.stopEcgTest();

    expect(native.stopEcgTest).toHaveBeenCalledTimes(1);
  });

  // ── Error pipeline ───────────────────────────────────────────────────────

  it('startTest surfaces REALTIME_TEST_IN_PROGRESS as a VeepooError', async () => {
    native.startHeartRateTest.mockRejectedValueOnce({
      code: 'REALTIME_TEST_IN_PROGRESS',
      message: 'another test running',
    });

    await expect(tests.startTest('heart_rate')).rejects.toMatchObject({
      code: 'REALTIME_TEST_IN_PROGRESS',
    });
  });

  it('stopEcgTest surfaces native rejections', async () => {
    native.stopEcgTest.mockRejectedValueOnce(new Error('boom'));

    await expect(tests.stopEcgTest()).rejects.toMatchObject({
      code: 'OPERATION_FAILED',
    });
  });
});
