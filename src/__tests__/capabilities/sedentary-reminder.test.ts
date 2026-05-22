jest.mock('expo-modules-core', () => ({
  requireNativeModule: jest.fn().mockReturnValue({}),
}));
jest.mock('react-native', () => ({
  Platform: { OS: 'ios' },
}));

import { SedentaryReminderCapability } from '@/capabilities/sedentary-reminder';
import { VeepooSDKRuntime } from '@/sdk/veepoo-sdk-runtime';
import { makeMockNative, type MockNative } from '@/__tests__/helpers/mock-native';
import type { SedentaryReminderSettings } from '@/types/index';

describe('SedentaryReminderCapability', () => {
  let native: MockNative;
  let runtime: VeepooSDKRuntime;
  let sedentaryReminder: SedentaryReminderCapability;

  beforeEach(() => {
    native = makeMockNative();
    runtime = new VeepooSDKRuntime(native);
    sedentaryReminder = new SedentaryReminderCapability(runtime.createCapabilityContext());
  });

  it('readSedentaryReminder normalizes the camelCase native response', async () => {
    native.readSedentaryReminder.mockResolvedValueOnce({
      startHour: 8,
      startMinute: 0,
      endHour: 20,
      endMinute: 0,
      thresholdMinutes: 60,
      enabled: 1,
    });

    const result = await sedentaryReminder.readSedentaryReminder();

    expect(native.readSedentaryReminder).toHaveBeenCalledTimes(1);
    expect(result.threshold_minutes).toBe(60);
  });

  it('setSedentaryReminder converts snake_case to camelCase for native', async () => {
    const settings: SedentaryReminderSettings = {
      enabled: true,
      start_hour: 8,
      start_minute: 0,
      end_hour: 20,
      end_minute: 0,
      threshold_minutes: 60,
    };

    await sedentaryReminder.setSedentaryReminder(settings);

    expect(native.setSedentaryReminder).toHaveBeenCalledWith({
      enabled: true,
      startHour: 8,
      startMinute: 0,
      endHour: 20,
      endMinute: 0,
      thresholdMinutes: 60,
    });
  });

  it('setSedentaryReminder rejects threshold_minutes below 30', async () => {
    const invalid: SedentaryReminderSettings = {
      enabled: true,
      start_hour: 8,
      start_minute: 0,
      end_hour: 20,
      end_minute: 0,
      threshold_minutes: 10,
    };

    await expect(
      sedentaryReminder.setSedentaryReminder(invalid),
    ).rejects.toMatchObject({ code: 'INVALID_ARGUMENT' });
    expect(native.setSedentaryReminder).not.toHaveBeenCalled();
  });
});
