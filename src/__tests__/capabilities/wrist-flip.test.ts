jest.mock('expo-modules-core', () => ({
  requireNativeModule: jest.fn().mockReturnValue({}),
}));
jest.mock('react-native', () => ({
  Platform: { OS: 'ios' },
}));

import { WristFlipCapability } from '@/capabilities/wrist-flip';
import { VeepooSDKRuntime } from '@/sdk/veepoo-sdk-runtime';
import { makeMockNative, type MockNative } from '@/__tests__/helpers/mock-native';

describe('WristFlipCapability', () => {
  let native: MockNative;
  let runtime: VeepooSDKRuntime;
  let wristFlip: WristFlipCapability;

  beforeEach(() => {
    native = makeMockNative();
    runtime = new VeepooSDKRuntime(native);
    wristFlip = new WristFlipCapability(runtime.createCapabilityContext());
  });

  it('readWristFlipWakeSettings normalizes the camelCase native response', async () => {
    native.readWristFlipWakeSettings.mockResolvedValueOnce({
      enabled: true,
      startHour: 8,
      startMinute: 0,
      endHour: 22,
      endMinute: 0,
      sensitivityLevel: 5,
    });

    const result = await wristFlip.readWristFlipWakeSettings();

    expect(native.readWristFlipWakeSettings).toHaveBeenCalledTimes(1);
    expect(result.enabled).toBe(true);
    expect(result.sensitivity_level).toBe(5);
  });

  it('setWristFlipWakeSettings converts snake_case to camelCase for native', async () => {
    await wristFlip.setWristFlipWakeSettings({
      enabled: true,
      start_hour: 8,
      start_minute: 0,
      end_hour: 22,
      end_minute: 0,
      sensitivity_level: 5,
    });

    expect(native.setWristFlipWakeSettings).toHaveBeenCalledWith({
      enabled: true,
      startHour: 8,
      startMinute: 0,
      endHour: 22,
      endMinute: 0,
      sensitivityLevel: 5,
    });
  });
});
