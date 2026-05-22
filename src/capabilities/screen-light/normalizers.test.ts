import { normalizeScreenLightDuration, normalizeScreenLightSettings } from './normalizers';

describe('normalizeScreenLightSettings', () => {
  it('coerces numeric fields', () => {
    const r = normalizeScreenLightSettings({
      nightStartHour: '22',
      nightStartMinute: 0,
      nightEndHour: 7,
      nightEndMinute: 0,
      nightLevel: 2,
      dayLevel: 4,
      autoAdjust: 1,
      maxLevel: 5,
    });
    expect(r.night_start_hour).toBe(22);
    expect(r.auto_adjust).toBe(true);
    expect(r.max_level).toBe(5);
  });
});

describe('normalizeScreenLightDuration', () => {
  it('parses duration fields', () => {
    const r = normalizeScreenLightDuration({
      currentSeconds: 10,
      minSeconds: 5,
      maxSeconds: 60,
      recommendSeconds: 10,
    });
    expect(r.current_seconds).toBe(10);
    expect(r.recommend_seconds).toBe(10);
  });
});
