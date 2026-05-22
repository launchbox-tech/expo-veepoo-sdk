import { validateDeviceTime } from '@/capabilities/device-time';
import { expectInvalidArgument } from '@/__tests__/helpers/expect-invalid-argument';

describe('validateDeviceTime', () => {
  it('passes for undefined', () => {
    expect(() => validateDeviceTime(undefined)).not.toThrow();
  });

  it('passes for a valid Date', () => {
    expect(() => validateDeviceTime(new Date())).not.toThrow();
  });

  it('throws INVALID_ARGUMENT for an invalid Date', () => {
    expectInvalidArgument(() => validateDeviceTime(new Date('invalid')));
  });

  it('throws INVALID_ARGUMENT for a string', () => {
    expectInvalidArgument(() => validateDeviceTime('2024-01-01' as any));
  });

  it('throws INVALID_ARGUMENT for a number', () => {
    expectInvalidArgument(() => validateDeviceTime(1234567890 as any));
  });
});
