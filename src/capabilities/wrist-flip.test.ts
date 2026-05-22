jest.mock('expo-modules-core', () => ({
  requireNativeModule: jest.fn().mockReturnValue({}),
}));
jest.mock('react-native', () => ({
  Platform: { OS: 'ios' },
}));

import { WristFlipCapability, normalizeWristFlipWakeSettings } from '@/capabilities/wrist-flip';
import { VeepooSDKRuntime } from '@/sdk/veepoo-sdk-runtime';
import { makeMockNative, type MockNative } from '@/__tests__/helpers/mock-native';

describe('normalizeWristFlipWakeSettings', () => {
  it('coerces fields and optional flags', () => {
    const r = normalizeWristFlipWakeSettings({
      enabled: 0,
      startHour: 21,
      startMinute: 30,
      endHour: 7,
      endMinute: 0,
      sensitivityLevel: 3,
      supportsCustomTimeWindow: true,
      defaultSensitivityLevel: 5,
    });
    expect(r.enabled).toBe(false);
    expect(r.sensitivity_level).toBe(3);
    expect(r.supports_custom_time_window).toBe(true);
    expect(r.default_sensitivity_level).toBe(5);
  });
});

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

  it('setWristFlipWakeSettings rejects sensitivity_level out of range without calling native', async () => {
    await expect(
      wristFlip.setWristFlipWakeSettings({
        enabled: true,
        start_hour: 22,
        start_minute: 0,
        end_hour: 8,
        end_minute: 0,
        sensitivity_level: 11,
      }),
    ).rejects.toMatchObject({ code: 'INVALID_ARGUMENT' });
    expect(native.setWristFlipWakeSettings).not.toHaveBeenCalled();
  });
});
