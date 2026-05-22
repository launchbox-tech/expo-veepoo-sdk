jest.mock('expo-modules-core', () => ({
  requireNativeModule: jest.fn().mockReturnValue({}),
}));
jest.mock('react-native', () => ({
  Platform: { OS: 'ios' },
}));

import { SosCapability } from '@/capabilities/sos';
import { VeepooSDKRuntime } from '@/sdk/veepoo-sdk-runtime';
import { makeMockNative, type MockNative } from '@/__tests__/helpers/mock-native';

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

  it('setSosCallTimes(0) throws INVALID_ARGUMENT without calling native', async () => {
    await expect(sos.setSosCallTimes(0)).rejects.toMatchObject({
      code: 'INVALID_ARGUMENT',
    });
    expect(native.setSosCallTimes).not.toHaveBeenCalled();
  });
});
