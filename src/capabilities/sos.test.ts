jest.mock('expo-modules-core', () => ({
  requireNativeModule: jest.fn().mockReturnValue({}),
}));
jest.mock('react-native', () => ({
  Platform: { OS: 'ios' },
}));

import { SosCapability, normalizeSosCallTimesSettings } from '@/capabilities/sos';
import { VeepooSDKRuntime } from '@/sdk/veepoo-sdk-runtime';
import { makeMockNative, type MockNative } from '@/__tests__/helpers/mock-native';

describe('normalizeSosCallTimesSettings', () => {
  it('normalizes a well-formed payload', () => {
    const r = normalizeSosCallTimesSettings({ times: 3, minTimes: 1, maxTimes: 9 });
    expect(r.times).toBe(3);
    expect(r.min_times).toBe(1);
    expect(r.max_times).toBe(9);
  });

  it('returns zeros for non-object input', () => {
    const r = normalizeSosCallTimesSettings(null);
    expect(r.times).toBe(0);
    expect(r.min_times).toBe(0);
    expect(r.max_times).toBe(0);
  });

  it('coerces string numbers', () => {
    const r = normalizeSosCallTimesSettings({ times: '5', minTimes: '1', maxTimes: '9' });
    expect(r.times).toBe(5);
  });
});

describe('SosCapability', () => {
  let native: MockNative;
  let runtime: VeepooSDKRuntime;
  let sos: SosCapability;

  beforeEach(() => {
    native = makeMockNative();
    runtime = new VeepooSDKRuntime(native);
    sos = new SosCapability(runtime.createCapabilityContext());
  });

  it('readSosCallTimes delegates to native, normalizes, and emits sos_call_times_data', async () => {
    const emitSpy = jest.spyOn(runtime, 'emitLocal');

    const result = await sos.readSosCallTimes();

    expect(native.readSosCallTimes).toHaveBeenCalledTimes(1);
    expect(result).toEqual({ times: 3, min_times: 1, max_times: 9 });
    expect(emitSpy).toHaveBeenCalledWith(
      'sos_call_times_data',
      expect.objectContaining({
        data: expect.objectContaining({ times: 3, min_times: 1, max_times: 9 }),
      }),
    );
  });

  it('setSosCallTimes(3) delegates to native', async () => {
    await sos.setSosCallTimes(3);

    expect(native.setSosCallTimes).toHaveBeenCalledWith(3);
  });

  it.each([
    { name: 'zero', times: 0 },
    { name: 'negative', times: -1 },
    { name: 'non-integer', times: 2.5 },
  ])('setSosCallTimes rejects $name → INVALID_ARGUMENT, no native call', async ({ times }) => {
    await expect(sos.setSosCallTimes(times)).rejects.toMatchObject({
      code: 'INVALID_ARGUMENT',
    });
    expect(native.setSosCallTimes).not.toHaveBeenCalled();
  });
});
