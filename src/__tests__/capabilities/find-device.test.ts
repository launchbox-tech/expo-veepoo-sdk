jest.mock('expo-modules-core', () => ({
  requireNativeModule: jest.fn().mockReturnValue({}),
}));
jest.mock('react-native', () => ({
  Platform: { OS: 'ios' },
}));

import { FindDeviceCapability } from '@/capabilities/find-device';
import { VeepooSDKRuntime } from '@/sdk/veepoo-sdk-runtime';
import { makeMockNative, type MockNative } from '@/__tests__/helpers/mock-native';

describe('FindDeviceCapability', () => {
  let native: MockNative;
  let runtime: VeepooSDKRuntime;
  let findDevice: FindDeviceCapability;

  beforeEach(() => {
    native = makeMockNative();
    runtime = new VeepooSDKRuntime(native);
    findDevice = new FindDeviceCapability(runtime.createCapabilityContext());
  });

  it('startFindDevice delegates to native', async () => {
    await findDevice.startFindDevice();

    expect(native.startFindDevice).toHaveBeenCalledTimes(1);
  });

  it('stopFindDevice delegates to native', async () => {
    await findDevice.stopFindDevice();

    expect(native.stopFindDevice).toHaveBeenCalledTimes(1);
  });
});
