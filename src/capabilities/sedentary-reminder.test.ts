import { normalizeSedentaryReminderSettings } from './sedentary-reminder';

describe('normalizeSedentaryReminderSettings', () => {
  it('coerces fields from native map', () => {
    const r = normalizeSedentaryReminderSettings({
      startHour: 8,
      startMinute: 30,
      endHour: 20,
      endMinute: 15,
      thresholdMinutes: 45,
      enabled: 1,
    });
    expect(r.start_hour).toBe(8);
    expect(r.threshold_minutes).toBe(45);
    expect(r.enabled).toBe(true);
  });
});
