import { validateAlarm, validateDeleteAlarm, validateHeartRateAlarm } from '@/capabilities/alarms/validators';
import { expectInvalidArgument } from '@/__tests__/helpers/expect-invalid-argument';

describe('validateAlarm', () => {
  const valid = { id: 1, enabled: true, hour: 7, minute: 30, repeat: [1, 2, 3, 4, 5] };

  it('passes for valid alarm', () => {
    expect(() => validateAlarm(valid)).not.toThrow();
  });

  it('passes for empty repeat (one-shot)', () => {
    expect(() => validateAlarm({ ...valid, repeat: [] })).not.toThrow();
  });

  it('passes for text of exactly 60 bytes', () => {
    expect(() => validateAlarm({ ...valid, text: 'a'.repeat(60) })).not.toThrow();
  });

  it('throws for id out of range', () => {
    expectInvalidArgument(() => validateAlarm({ ...valid, id: 0 }), 'id');
    expectInvalidArgument(() => validateAlarm({ ...valid, id: 21 }), 'id');
  });

  it('throws for hour out of range', () => {
    expectInvalidArgument(() => validateAlarm({ ...valid, hour: 24 }), 'hour');
    expectInvalidArgument(() => validateAlarm({ ...valid, hour: -1 }), 'hour');
  });

  it('throws for minute out of range', () => {
    expectInvalidArgument(() => validateAlarm({ ...valid, minute: 60 }), 'minute');
    expectInvalidArgument(() => validateAlarm({ ...valid, minute: -1 }), 'minute');
  });

  it('throws for invalid repeat element', () => {
    expectInvalidArgument(() => validateAlarm({ ...valid, repeat: [0] }), 'repeat element');
    expectInvalidArgument(() => validateAlarm({ ...valid, repeat: [8] }), 'repeat element');
  });

  it('throws for scene out of range', () => {
    expectInvalidArgument(() => validateAlarm({ ...valid, scene: 21 }), 'scene');
    expectInvalidArgument(() => validateAlarm({ ...valid, scene: -1 }), 'scene');
  });

  it('passes for scene at boundaries', () => {
    expect(() => validateAlarm({ ...valid, scene: 0 })).not.toThrow();
    expect(() => validateAlarm({ ...valid, scene: 20 })).not.toThrow();
  });

  it('throws for text exceeding 60 bytes', () => {
    expectInvalidArgument(() => validateAlarm({ ...valid, text: 'a'.repeat(61) }), 'text');
  });
});

describe('validateDeleteAlarm', () => {
  it('passes for valid alarmId', () => {
    expect(() => validateDeleteAlarm(1)).not.toThrow();
    expect(() => validateDeleteAlarm(20)).not.toThrow();
  });

  it('throws for alarmId out of range', () => {
    expectInvalidArgument(() => validateDeleteAlarm(0), 'alarmId');
    expectInvalidArgument(() => validateDeleteAlarm(21), 'alarmId');
  });
});

describe('validateHeartRateAlarm', () => {
  const valid = { enabled: true, high_threshold: 120, low_threshold: 50 };

  it('passes for a valid alarm', () => {
    expect(() => validateHeartRateAlarm(valid)).not.toThrow();
  });

  it('passes when enabled is false', () => {
    expect(() => validateHeartRateAlarm({ ...valid, enabled: false })).not.toThrow();
  });

  it('throws for highThreshold of 0', () => {
    expectInvalidArgument(() => validateHeartRateAlarm({ ...valid, high_threshold: 0 }), 'highThreshold');
  });

  it('throws for highThreshold of 301', () => {
    expectInvalidArgument(() => validateHeartRateAlarm({ ...valid, high_threshold: 301 }), 'highThreshold');
  });

  it('throws for lowThreshold of 0', () => {
    expectInvalidArgument(() => validateHeartRateAlarm({ ...valid, low_threshold: 0 }), 'lowThreshold');
  });

  it('throws for lowThreshold of 301', () => {
    expectInvalidArgument(() => validateHeartRateAlarm({ ...valid, low_threshold: 301 }), 'lowThreshold');
  });

  it('throws when lowThreshold equals highThreshold', () => {
    expectInvalidArgument(() => validateHeartRateAlarm({ ...valid, high_threshold: 100, low_threshold: 100 }), 'highThreshold');
  });

  it('throws when lowThreshold is greater than highThreshold', () => {
    expectInvalidArgument(() => validateHeartRateAlarm({ ...valid, high_threshold: 50, low_threshold: 120 }), 'highThreshold');
  });

  it('passes at boundary values 1 and 300', () => {
    expect(() => validateHeartRateAlarm({ enabled: true, high_threshold: 300, low_threshold: 1 })).not.toThrow();
  });
});
