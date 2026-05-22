jest.mock('expo-modules-core', () => ({
  requireNativeModule: jest.fn().mockReturnValue({}),
}));
jest.mock('react-native', () => ({
  Platform: { OS: 'ios' },
}));

import { HistoricalQueryCapability } from '@/capabilities/historical-query';
import { VeepooSDKRuntime } from '@/sdk/veepoo-sdk-runtime';
import { makeMockNative, type MockNative } from '@/__tests__/helpers/mock-native';

describe('HistoricalQueryCapability', () => {
  let native: MockNative;
  let runtime: VeepooSDKRuntime;
  let historicalQuery: HistoricalQueryCapability;

  beforeEach(() => {
    native = makeMockNative();
    runtime = new VeepooSDKRuntime(native);
    historicalQuery = new HistoricalQueryCapability(runtime.createCapabilityContext());
  });

  it('readDeviceAllData delegates to native and returns the native boolean', async () => {
    native.readDeviceAllData.mockResolvedValueOnce(true);

    const result = await historicalQuery.readDeviceAllData();

    expect(native.readDeviceAllData).toHaveBeenCalledTimes(1);
    expect(result).toBe(true);
  });

  it('startReadOriginData delegates to native', async () => {
    await historicalQuery.startReadOriginData();

    expect(native.startReadOriginData).toHaveBeenCalledTimes(1);
  });

  it('startReadOriginData surfaces native rejections through the error pipeline', async () => {
    const errorListener = jest.fn();
    runtime.on('error', errorListener);
    native.startReadOriginData.mockRejectedValueOnce(new Error('boom'));

    await expect(historicalQuery.startReadOriginData()).rejects.toMatchObject({
      code: 'OPERATION_FAILED',
    });
    expect(errorListener).toHaveBeenCalled();
  });
});
