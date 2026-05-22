import { validateConnectOptions, validateDeviceId, validatePersonalInfo } from '@/capabilities/session/validators';
import { expectInvalidArgument } from '@/__tests__/helpers/expect-invalid-argument';

describe('validateDeviceId', () => {
  it('throws INVALID_ARGUMENT for empty string', () => {
    expectInvalidArgument(() => validateDeviceId(''), 'deviceId');
  });

  it('throws INVALID_ARGUMENT for whitespace-only string', () => {
    expectInvalidArgument(() => validateDeviceId('   '), 'deviceId');
  });

  it('throws INVALID_ARGUMENT for non-string values', () => {
    expectInvalidArgument(() => validateDeviceId(null as any), 'deviceId');
    expectInvalidArgument(() => validateDeviceId(undefined as any), 'deviceId');
    expectInvalidArgument(() => validateDeviceId(42 as any), 'deviceId');
  });

  it('passes for a valid device id', () => {
    expect(() => validateDeviceId('AA:BB:CC:DD:EE:FF')).not.toThrow();
  });
});

describe('validateConnectOptions', () => {
  it('passes for an empty options object', () => {
    expect(() => validateConnectOptions({})).not.toThrow();
  });

  it('throws when password is an empty string', () => {
    expectInvalidArgument(() => validateConnectOptions({ password: '' }), 'options.password');
  });

  it('passes when password is a valid string', () => {
    expect(() => validateConnectOptions({ password: '1234' })).not.toThrow();
  });

  it('throws when timeSetting.hour is out of range', () => {
    expectInvalidArgument(
      () => validateConnectOptions({ time_setting: { year: 2024, month: 1, day: 1, hour: 24, minute: 0, second: 0 } }),
      'timeSetting.hour',
    );
  });

  it('throws when timeSetting.minute is out of range', () => {
    expectInvalidArgument(
      () => validateConnectOptions({ time_setting: { year: 2024, month: 1, day: 1, hour: 0, minute: 60, second: 0 } }),
      'timeSetting.minute',
    );
  });

  it('throws when timeSetting.month is out of range', () => {
    expectInvalidArgument(
      () => validateConnectOptions({ time_setting: { year: 2024, month: 13, day: 1, hour: 0, minute: 0, second: 0 } }),
      'timeSetting.month',
    );
  });

  it('passes for valid timeSetting', () => {
    expect(() =>
      validateConnectOptions({ time_setting: { year: 2024, month: 6, day: 15, hour: 10, minute: 30, second: 0 } })
    ).not.toThrow();
  });
});

describe('validatePersonalInfo', () => {
  const valid = { sex: 1 as 0 | 1, height: 170, weight: 70, age: 30, step_aim: 8000, sleep_aim: 480 };

  it('passes for valid info', () => {
    expect(() => validatePersonalInfo(valid)).not.toThrow();
  });

  it('throws for invalid sex', () => {
    expectInvalidArgument(() => validatePersonalInfo({ ...valid, sex: 2 as any }), 'sex');
  });

  it('throws for height below range and names the field', () => {
    expectInvalidArgument(() => validatePersonalInfo({ ...valid, height: -5 }), 'height');
  });

  it('throws for height above range', () => {
    expectInvalidArgument(() => validatePersonalInfo({ ...valid, height: 301 }), 'height');
  });

  it('throws for weight below range', () => {
    expectInvalidArgument(() => validatePersonalInfo({ ...valid, weight: 0 }), 'weight');
  });

  it('throws for weight above range', () => {
    expectInvalidArgument(() => validatePersonalInfo({ ...valid, weight: 501 }), 'weight');
  });

  it('throws for age below range', () => {
    expectInvalidArgument(() => validatePersonalInfo({ ...valid, age: 0 }), 'age');
  });

  it('throws for age above range', () => {
    expectInvalidArgument(() => validatePersonalInfo({ ...valid, age: 121 }), 'age');
  });

  it('throws for step_aim below range', () => {
    expectInvalidArgument(() => validatePersonalInfo({ ...valid, step_aim: 0 }), 'stepAim');
  });

  it('throws for step_aim above range', () => {
    expectInvalidArgument(() => validatePersonalInfo({ ...valid, step_aim: 100_001 }), 'stepAim');
  });

  it('passes for sleep_aim = 0', () => {
    expect(() => validatePersonalInfo({ ...valid, sleep_aim: 0 })).not.toThrow();
  });

  it('throws for sleep_aim above 1440', () => {
    expectInvalidArgument(() => validatePersonalInfo({ ...valid, sleep_aim: 1_441 }), 'sleepAim');
  });
});
