import { validateSedentaryReminderSettings } from '@/capabilities/sedentary-reminder';
import { expectInvalidArgument } from '@/__tests__/helpers/expect-invalid-argument';

describe('validateSedentaryReminderSettings', () => {
  const valid = {
    start_hour: 9,
    start_minute: 0,
    end_hour: 18,
    end_minute: 0,
    threshold_minutes: 60,
    enabled: true,
  };

  it('passes for typical window', () => {
    expect(() => validateSedentaryReminderSettings(valid)).not.toThrow();
  });

  it('throws when threshold below vendor minimum', () => {
    expectInvalidArgument(
      () => validateSedentaryReminderSettings({ ...valid, threshold_minutes: 20 }),
      'thresholdMinutes',
    );
  });
});
