jest.mock('expo-modules-core', () => ({
  requireNativeModule: jest.fn().mockReturnValue({}),
}));
jest.mock('react-native', () => ({
  Platform: { OS: 'ios' },
}));

import { BtStatusCapability } from '@/capabilities/bt-status';
import { VeepooSDKRuntime } from '@/sdk/veepoo-sdk-runtime';
import { makeMockNative, type MockNative } from '@/__tests__/helpers/mock-native';

describe('BtStatusCapability', () => {
  let native: MockNative;
  let runtime: VeepooSDKRuntime;
  let btStatus: BtStatusCapability;

  beforeEach(() => {
    native = makeMockNative();
    runtime = new VeepooSDKRuntime(native);
    btStatus = new BtStatusCapability(runtime.createCapabilityContext());
  });

  it('readDeviceBTStatus delegates to native', async () => {
    native.readDeviceBTStatus.mockResolvedValueOnce({ btState: 1, classicBtEnabled: true });

    await btStatus.readDeviceBTStatus();

    expect(native.readDeviceBTStatus).toHaveBeenCalledTimes(1);
  });

  it('setDeviceBTSwitch(true) delegates to native', async () => {
    await btStatus.setDeviceBTSwitch(true);

    expect(native.setDeviceBTSwitch).toHaveBeenCalledWith(true);
  });
});
