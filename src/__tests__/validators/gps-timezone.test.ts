import { validateGPSAndTimezoneData } from '@/capabilities/gps-timezone';
import { expectInvalidArgument } from '@/__tests__/helpers/expect-invalid-argument';

describe('validateGPSAndTimezoneData', () => {
  const valid = { latitude: 39.904987, longitude: 116.405289, timezone_offset_minutes: 480 };

  it('accepts valid GPS data', () => {
    expect(() => validateGPSAndTimezoneData(valid)).not.toThrow();
  });

  it('accepts valid GPS data with altitude', () => {
    expect(() => validateGPSAndTimezoneData({ ...valid, altitude: 50 })).not.toThrow();
  });

  it('throws for latitude out of range (> 90)', () => {
    expectInvalidArgument(() => validateGPSAndTimezoneData({ ...valid, latitude: 91 }), 'latitude');
  });

  it('throws for latitude out of range (< -90)', () => {
    expectInvalidArgument(() => validateGPSAndTimezoneData({ ...valid, latitude: -91 }), 'latitude');
  });

  it('throws for longitude out of range (> 180)', () => {
    expectInvalidArgument(() => validateGPSAndTimezoneData({ ...valid, longitude: 181 }), 'longitude');
  });

  it('throws for longitude out of range (< -180)', () => {
    expectInvalidArgument(() => validateGPSAndTimezoneData({ ...valid, longitude: -181 }), 'longitude');
  });

  it('throws for NaN latitude', () => {
    expectInvalidArgument(() => validateGPSAndTimezoneData({ ...valid, latitude: NaN }), 'latitude');
  });

  it('throws for non-finite altitude', () => {
    expectInvalidArgument(() => validateGPSAndTimezoneData({ ...valid, altitude: Infinity }), 'altitude');
  });

  it('throws for non-multiple-of-15 timezone_offset_minutes', () => {
    expectInvalidArgument(() => validateGPSAndTimezoneData({ ...valid, timezone_offset_minutes: 481 }), 'timezoneOffsetMinutes');
  });

  it('throws for non-integer timezone_offset_minutes', () => {
    expectInvalidArgument(() => validateGPSAndTimezoneData({ ...valid, timezone_offset_minutes: 480.5 }), 'timezoneOffsetMinutes');
  });
});
