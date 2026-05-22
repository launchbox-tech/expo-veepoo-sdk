jest.mock('expo-modules-core', () => ({
  requireNativeModule: jest.fn().mockReturnValue({}),
}));
jest.mock('react-native', () => ({
  Platform: { OS: 'ios' },
}));

import { DeviceFunctionsCapability } from '@/capabilities/device-functions/index';
import { VeepooSDKRuntime } from '@/sdk/veepoo-sdk-runtime';
import { makeMockNative, type MockNative } from '@/__tests__/helpers/mock-native';

describe('DeviceFunctionsCapability', () => {
  let native: MockNative;
  let runtime: VeepooSDKRuntime;
  let deviceFunctions: DeviceFunctionsCapability;

  beforeEach(() => {
    native = makeMockNative();
    runtime = new VeepooSDKRuntime(native);
    deviceFunctions = new DeviceFunctionsCapability(runtime.createCapabilityContext());
  });

  it('readDeviceFunctions delegates to native', async () => {
    native.readDeviceFunctions.mockResolvedValueOnce({});

    await deviceFunctions.readDeviceFunctions();

    expect(native.readDeviceFunctions).toHaveBeenCalledTimes(1);
  });

  it('readDeviceFunctions returns the three-package shape for a flat native response', async () => {
    native.readDeviceFunctions.mockResolvedValueOnce({});

    const result = await deviceFunctions.readDeviceFunctions();

    expect(Object.keys(result).sort()).toEqual(['package1', 'package2', 'package3']);
    expect(result.package1).toBeDefined();
    expect(result.package2).toBeDefined();
    expect(result.package3).toBeDefined();
  });

  it('readDeviceFunctions returns the five-package shape when native sends nested package keys', async () => {
    native.readDeviceFunctions.mockResolvedValueOnce({
      package1: {},
      package2: {},
      package3: {},
      package4: {},
      package5: {},
    });

    const result = await deviceFunctions.readDeviceFunctions();

    expect(Object.keys(result).sort()).toEqual([
      'package1',
      'package2',
      'package3',
      'package4',
      'package5',
    ]);
  });

  it('readDeviceFunctions surfaces native rejections through the error pipeline', async () => {
    const errorListener = jest.fn();
    runtime.on('error', errorListener);
    native.readDeviceFunctions.mockRejectedValueOnce({
      code: 'CAPABILITY_UNSUPPORTED',
      message: 'not supported',
    });

    await expect(deviceFunctions.readDeviceFunctions()).rejects.toMatchObject({
      code: 'CAPABILITY_UNSUPPORTED',
    });
    expect(errorListener).toHaveBeenCalledWith(
      expect.objectContaining({ code: 'CAPABILITY_UNSUPPORTED' }),
    );
  });
});
