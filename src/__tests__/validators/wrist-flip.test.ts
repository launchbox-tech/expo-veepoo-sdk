import { validateWristFlipWakeSettings } from '@/capabilities/wrist-flip';
import { expectInvalidArgument } from '@/__tests__/helpers/expect-invalid-argument';

describe('validateWristFlipWakeSettings', () => {
  const valid = {
    enabled: true,
    start_hour: 22,
    start_minute: 0,
    end_hour: 8,
    end_minute: 0,
    sensitivity_level: 5,
  };

  it('passes for typical night window', () => {
    expect(() => validateWristFlipWakeSettings(valid)).not.toThrow();
  });

  it('throws when sensitivity out of range', () => {
    expectInvalidArgument(
      () => validateWristFlipWakeSettings({ ...valid, sensitivity_level: 11 }),
      'sensitivityLevel',
    );
  });
});
