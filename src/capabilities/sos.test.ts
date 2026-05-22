import { normalizeSosCallTimesSettings } from './sos';

describe('normalizeSosCallTimesSettings', () => {
  it('normalizes a well-formed payload', () => {
    const r = normalizeSosCallTimesSettings({ times: 3, minTimes: 1, maxTimes: 9 });
    expect(r.times).toBe(3);
    expect(r.min_times).toBe(1);
    expect(r.max_times).toBe(9);
  });

  it('returns zeros for non-object input', () => {
    const r = normalizeSosCallTimesSettings(null);
    expect(r.times).toBe(0);
    expect(r.min_times).toBe(0);
    expect(r.max_times).toBe(0);
  });

  it('coerces string numbers', () => {
    const r = normalizeSosCallTimesSettings({ times: '5', minTimes: '1', maxTimes: '9' });
    expect(r.times).toBe(5);
  });
});
