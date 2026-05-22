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
});
