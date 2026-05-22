jest.mock('expo-modules-core', () => ({
  requireNativeModule: jest.fn().mockReturnValue({}),
}));
jest.mock('react-native', () => ({
  Platform: { OS: 'ios' },
}));

import { DeviceTimeCapability } from '@/capabilities/device-time';
import { VeepooSDKRuntime } from '@/sdk/veepoo-sdk-runtime';
import { makeMockNative, type MockNative } from '@/__tests__/helpers/mock-native';

describe('DeviceTimeCapability', () => {
  let native: MockNative;
  let runtime: VeepooSDKRuntime;
  let deviceTime: DeviceTimeCapability;

  beforeEach(() => {
    native = makeMockNative();
    runtime = new VeepooSDKRuntime(native);
    deviceTime = new DeviceTimeCapability(runtime.createCapabilityContext());
  });

  it('setDeviceTime(date) decomposes the Date into a year/month/day/hour/minute/second object', async () => {
    const date = new Date('2024-01-15T10:30:45');

    await deviceTime.setDeviceTime(date);

    expect(native.setDeviceTime).toHaveBeenCalledWith({
      year: 2024,
      month: 1,
      day: 15,
      hour: date.getHours(),
      minute: 30,
      second: 45,
    });
  });

  it('setDeviceTime() (no args) calls native with undefined', async () => {
    await deviceTime.setDeviceTime();

    expect(native.setDeviceTime).toHaveBeenCalledWith(undefined);
  });

  it.each([
    { name: 'invalid Date', input: new Date('invalid') },
    { name: 'string', input: '2024-01-01' as unknown as Date },
    { name: 'number', input: 1234567890 as unknown as Date },
  ])('setDeviceTime rejects $name → INVALID_ARGUMENT, no native call', async ({ input }) => {
    await expect(deviceTime.setDeviceTime(input)).rejects.toMatchObject({
      code: 'INVALID_ARGUMENT',
    });
    expect(native.setDeviceTime).not.toHaveBeenCalled();
  });
});
