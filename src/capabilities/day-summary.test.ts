import { normalizeDaySummaryData } from './day-summary';

describe('normalizeDaySummaryData', () => {
  it('returns zero-valued record for non-record input', () => {
    const result = normalizeDaySummaryData(null);
    expect(result.date).toBe('');
    expect(result.all_step).toBe(0);
    expect(result.sport_list).toEqual([]);
    expect(result.rate_list).toEqual([]);
    expect(result.bp_list).toEqual([]);
  });

  it('normalizes sportList items', () => {
    const result = normalizeDaySummaryData({
      date: '2026-01-01',
      allStep: 8000,
      sportList: [
        { time: '08:00', step: 500, cal: 25.5, dis: 0.4 },
      ],
    });
    expect(result.date).toBe('2026-01-01');
    expect(result.all_step).toBe(8000);
    expect(result.sport_list).toHaveLength(1);
    expect(result.sport_list[0]).toEqual({ time: '08:00', step: 500, cal: 25.5, dis: 0.4 });
  });

  it('normalizes rateList items', () => {
    const result = normalizeDaySummaryData({
      rateList: [{ time: '09:00', rate: 72 }],
    });
    expect(result.rate_list).toHaveLength(1);
    expect(result.rate_list[0]).toEqual({ time: '09:00', rate: 72 });
  });

  it('normalizes bpList items', () => {
    const result = normalizeDaySummaryData({
      bpList: [{ time: '10:00', high: 120, low: 80 }],
    });
    expect(result.bp_list).toHaveLength(1);
    expect(result.bp_list[0]).toEqual({ time: '10:00', high: 120, low: 80 });
  });

  it('supports snake_case aliases (sport_list, rate_list, bp_list)', () => {
    const result = normalizeDaySummaryData({
      all_step: 5000,
      sport_list: [{ time: '11:00', step: 200, cal: 10.0, dis: 0.2 }],
      rate_list: [{ time: '11:30', rate: 68 }],
      bp_list: [{ time: '12:00', high: 118, low: 78 }],
    });
    expect(result.all_step).toBe(5000);
    expect(result.sport_list).toHaveLength(1);
    expect(result.rate_list).toHaveLength(1);
    expect(result.bp_list).toHaveLength(1);
  });

  it('filters non-record items from lists', () => {
    const result = normalizeDaySummaryData({
      sportList: [null, 'bad', { time: '08:00', step: 100, cal: 5.0, dis: 0.1 }],
    });
    expect(result.sport_list).toHaveLength(1);
  });
});
