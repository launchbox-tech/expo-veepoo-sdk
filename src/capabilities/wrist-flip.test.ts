import { normalizeWristFlipWakeSettings } from './wrist-flip';

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
