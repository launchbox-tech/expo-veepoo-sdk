import { normalizeSleepDataList } from '@/capabilities/sleep-data/normalizers';

describe('normalizeSleepDataList', () => {
  it('returns empty array for non-array non-record input', () => {
    expect(normalizeSleepDataList(null)).toEqual([]);
    expect(normalizeSleepDataList(undefined)).toEqual([]);
    expect(normalizeSleepDataList('str')).toEqual([]);
    expect(normalizeSleepDataList(42)).toEqual([]);
  });

  it('wraps a single record in an array', () => {
    const single = {
      sleepTime: '23:00',
      wakeTime: '07:00',
      date: '2026-01-01',
    };
    const result = normalizeSleepDataList(single);
    expect(result).toHaveLength(1);
    expect(result[0].items[0].sleep_time).toBe('23:00');
    expect(result[0].items[0].wake_time).toBe('07:00');
  });

  it('returns empty array for single record with no sleep or wake time', () => {
    const result = normalizeSleepDataList({ date: '2026-01-01' });
    expect(result).toEqual([]);
  });

  it('normalizes array of sleep records', () => {
    const records = [
      { sleepTime: '22:30', wakeTime: '06:30', date: '2026-01-01' },
      { sleepTime: '23:15', wakeTime: '07:15', date: '2026-01-02' },
    ];
    const result = normalizeSleepDataList(records);
    expect(result).toHaveLength(2);
    expect(result[0].items[0].sleep_time).toBe('22:30');
    expect(result[1].items[0].sleep_time).toBe('23:15');
  });

  it('filters null records from array', () => {
    const records = [
      { sleepTime: '23:00', wakeTime: '07:00', date: '2026-01-01' },
      { date: '2026-01-02' },
      null,
      'bad',
    ];
    const result = normalizeSleepDataList(records);
    expect(result).toHaveLength(1);
  });

  it('normalizes structured record with items and summary', () => {
    const structured = {
      date: '2026-01-01',
      items: [
        {
          date: '2026-01-01',
          sleepTime: '22:00',
          wakeTime: '06:30',
          deepSleepMinutes: 90,
          lightSleepMinutes: 240,
          totalSleepMinutes: 330,
          sleepQuality: 8,
          sleepLine: '1122',
          wakeUpCount: 2,
        },
      ],
      summary: {
        totalDeepSleepMinutes: 90,
        totalLightSleepMinutes: 240,
        totalSleepMinutes: 330,
        averageSleepQuality: 8,
        totalWakeUpCount: 2,
      },
    };
    const result = normalizeSleepDataList([structured]);
    expect(result).toHaveLength(1);
    expect(result[0].items[0].sleep_time).toBe('22:00');
    expect(result[0].items[0].deep_sleep_minutes).toBe(90);
    expect(result[0].items[0].wake_up_count).toBe(2);
    expect(result[0].summary.total_sleep_minutes).toBe(330);
    expect(result[0].summary.average_sleep_quality).toBe(8);
  });

  it('computes total_sleep_minutes from DEEP/LIGHT/SLE_HOUR when totalSleepMinutes absent', () => {
    const flat = {
      SLEEP_TIME: '23:00',
      WAKE_TIME: '07:00',
      DEEP_HOUR: 1.5,
      LIGHT_HOUR: 4.0,
      SLE_HOUR: 5,
      SLE_MINUTE: 30,
      SLEEP_LEVEL: 7,
      WakeUpTime: 1,
      date: '2026-01-01',
    };
    const result = normalizeSleepDataList([flat]);
    expect(result).toHaveLength(1);
    expect(result[0].summary.total_deep_sleep_minutes).toBe(90);
    expect(result[0].summary.total_light_sleep_minutes).toBe(240);
    expect(result[0].summary.total_sleep_minutes).toBe(330);
    expect(result[0].summary.average_sleep_quality).toBe(7);
    expect(result[0].summary.total_wake_up_count).toBe(1);
  });

  it('uses wake_time date slice as date fallback', () => {
    const flat = {
      sleepTime: '23:00',
      wakeTime: '2026-05-03 07:00',
    };
    const result = normalizeSleepDataList([flat]);
    expect(result).toHaveLength(1);
    expect(result[0].date).toBe('2026-05-03');
  });

  it('handles snake_case aliases in structured items', () => {
    const structured = {
      date: '2026-01-01',
      items: [
        {
          date: '2026-01-01',
          sleep_time: '22:00',
          wake_time: '06:00',
          deep_sleep_minutes: 60,
          light_sleep_minutes: 180,
          total_sleep_minutes: 240,
          sleep_quality: 6,
          sleep_line: 'abc',
          wake_up_count: 1,
        },
      ],
      summary: {
        total_deep_sleep_minutes: 60,
        total_light_sleep_minutes: 180,
        total_sleep_minutes: 240,
        average_sleep_quality: 6,
        total_wake_up_count: 1,
      },
    };
    const result = normalizeSleepDataList([structured]);
    expect(result[0].items[0].sleep_time).toBe('22:00');
    expect(result[0].items[0].sleep_quality).toBe(6);
    expect(result[0].summary.total_deep_sleep_minutes).toBe(60);
  });
});
