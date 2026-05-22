jest.mock('expo-modules-core', () => ({
  requireNativeModule: jest.fn().mockReturnValue({}),
}));
jest.mock('react-native', () => ({
  Platform: { OS: 'ios' },
}));

import { GpsTimezoneCapability } from '@/capabilities/gps-timezone';
import { VeepooSDKRuntime } from '@/sdk/veepoo-sdk-runtime';
import { makeMockNative, type MockNative } from '@/__tests__/helpers/mock-native';

describe('GpsTimezoneCapability', () => {
  let native: MockNative;
  let runtime: VeepooSDKRuntime;
  let gpsTimezone: GpsTimezoneCapability;

  beforeEach(() => {
    native = makeMockNative();
    runtime = new VeepooSDKRuntime(native);
    gpsTimezone = new GpsTimezoneCapability(runtime.createCapabilityContext());
  });

  const validGps = { latitude: 39.904987, longitude: 116.405289, timezone_offset_minutes: 480 };

  it('setDeviceGPSAndTimezone converts snake_case to camelCase for native', async () => {
    await gpsTimezone.setDeviceGPSAndTimezone({
      latitude: 27.7172,
      longitude: 85.324,
      altitude: 1300,
      timezone_offset_minutes: 345,
    });

    expect(native.setDeviceGPSAndTimezone).toHaveBeenCalledWith({
      latitude: 27.7172,
      longitude: 85.324,
      altitude: 1300,
      timezoneOffsetMinutes: 345,
    });
  });

  it.each([
    { name: 'latitude > 90', input: { ...validGps, latitude: 91 } },
    { name: 'latitude < -90', input: { ...validGps, latitude: -91 } },
    { name: 'longitude > 180', input: { ...validGps, longitude: 181 } },
    { name: 'longitude < -180', input: { ...validGps, longitude: -181 } },
    { name: 'NaN latitude', input: { ...validGps, latitude: NaN } },
    { name: 'non-finite altitude', input: { ...validGps, altitude: Infinity } },
    {
      name: 'timezone_offset_minutes not a multiple of 15',
      input: { ...validGps, timezone_offset_minutes: 481 },
    },
    {
      name: 'non-integer timezone_offset_minutes',
      input: { ...validGps, timezone_offset_minutes: 480.5 },
    },
  ])('setDeviceGPSAndTimezone rejects $name → INVALID_ARGUMENT, no native call', async ({ input }) => {
    await expect(gpsTimezone.setDeviceGPSAndTimezone(input)).rejects.toMatchObject({
      code: 'INVALID_ARGUMENT',
    });
    expect(native.setDeviceGPSAndTimezone).not.toHaveBeenCalled();
  });
});
