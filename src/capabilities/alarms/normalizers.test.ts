import { normalizeAlarmList, normalizeHeartRateAlarm } from './normalizers';

describe('normalizeAlarmList', () => {
  it('returns empty array for non-array input', () => {
    expect(normalizeAlarmList(null)).toEqual([]);
    expect(normalizeAlarmList(undefined)).toEqual([]);
    expect(normalizeAlarmList({})).toEqual([]);
  });

  it('converts repeat binary string "0000011" to [1, 2]', () => {
    const result = normalizeAlarmList([{ id: 1, enabled: 1, hour: 7, minute: 30, repeat: '0000011' }]);
    expect(result[0].repeat).toEqual([1, 2]);
  });

  it('converts "0000000" to [] (one-shot)', () => {
    const result = normalizeAlarmList([{ id: 1, enabled: 1, hour: 7, minute: 30, repeat: '0000000' }]);
    expect(result[0].repeat).toEqual([]);
  });

  it('converts "1111111" to [1,2,3,4,5,6,7]', () => {
    const result = normalizeAlarmList([{ id: 1, enabled: 1, hour: 7, minute: 30, repeat: '1111111' }]);
    expect(result[0].repeat).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });

  it('passes through scene and text when present', () => {
    const result = normalizeAlarmList([
      { id: 2, enabled: true, hour: 8, minute: 0, repeat: '0000000', scene: 5, text: 'wake up' },
    ]);
    expect(result[0].scene).toBe(5);
    expect(result[0].text).toBe('wake up');
  });

  it('defaults scene and text to undefined when absent', () => {
    const result = normalizeAlarmList([{ id: 1, enabled: true, hour: 7, minute: 0, repeat: '0000000' }]);
    expect(result[0].scene).toBeUndefined();
    expect(result[0].text).toBeUndefined();
  });

  it('passes through an already-decoded repeat array unchanged', () => {
    const result = normalizeAlarmList([{ id: 1, enabled: true, hour: 7, minute: 0, repeat: [1, 5] }]);
    expect(result[0].repeat).toEqual([1, 5]);
  });
});

describe('normalizeHeartRateAlarm', () => {
  it('coerces numeric enabled to boolean', () => {
    expect(normalizeHeartRateAlarm({ enabled: 1, highThreshold: 120, lowThreshold: 50 }).enabled).toBe(true);
    expect(normalizeHeartRateAlarm({ enabled: 0, highThreshold: 120, lowThreshold: 50 }).enabled).toBe(false);
  });

  it('coerces string thresholds to integers', () => {
    const result = normalizeHeartRateAlarm({ enabled: true, highThreshold: '120', lowThreshold: '50.9' });
    expect(result.high_threshold).toBe(120);
    expect(result.low_threshold).toBe(50);
  });

  it('defaults missing fields to false / 0', () => {
    const result = normalizeHeartRateAlarm({});
    expect(result.enabled).toBe(false);
    expect(result.high_threshold).toBe(0);
    expect(result.low_threshold).toBe(0);
  });

  it('defaults all fields for non-object input', () => {
    const result = normalizeHeartRateAlarm(null);
    expect(result.enabled).toBe(false);
    expect(result.high_threshold).toBe(0);
    expect(result.low_threshold).toBe(0);
  });
});
