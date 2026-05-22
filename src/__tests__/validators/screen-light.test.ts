import { validateScreenLightDurationSeconds, validateScreenLightSettings } from '@/capabilities/screen-light/validators';
import { expectInvalidArgument } from '@/__tests__/helpers/expect-invalid-argument';

describe('validateScreenLightSettings', () => {
  const valid = {
    night_start_hour: 22,
    night_start_minute: 0,
    night_end_hour: 7,
    night_end_minute: 0,
    night_level: 2,
    day_level: 4,
    auto_adjust: false,
    max_level: 5,
  };

  it('passes for a typical schedule', () => {
    expect(() => validateScreenLightSettings(valid)).not.toThrow();
  });

  it('throws when maxLevel out of range', () => {
    expectInvalidArgument(() => validateScreenLightSettings({ ...valid, max_level: 0 }), 'maxLevel');
  });
});

describe('validateScreenLightDurationSeconds', () => {
  it('passes for in-range seconds', () => {
    expect(() => validateScreenLightDurationSeconds(10)).not.toThrow();
  });

  it('throws for zero', () => {
    expectInvalidArgument(() => validateScreenLightDurationSeconds(0), 'seconds');
  });
});
