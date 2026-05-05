import {
  normalizeOriginDataList,
  normalizeHalfHourData,
  normalizeSpo2OriginData,
} from '@/capabilities/origin-data/normalizers';

describe('normalizeOriginDataList', () => {
  it('returns empty array for non-array input', () => {
    expect(normalizeOriginDataList(null)).toEqual([]);
    expect(normalizeOriginDataList(undefined)).toEqual([]);
    expect(normalizeOriginDataList('str')).toEqual([]);
    expect(normalizeOriginDataList(42)).toEqual([]);
  });

  it('filters out non-record items', () => {
    const result = normalizeOriginDataList([null, 'bad', 42, {}]);
    expect(result).toHaveLength(1);
  });

  it('normalizes camelCase field aliases', () => {
    const item = {
      time: '08:00',
      heartValue: 72,
      stepValue: 100,
      calValue: 12.5,
      disValue: 0.8,
      sportValue: 1,
      highValue: 120,
      lowValue: 80,
      spo2Value: 98,
      tempValue: 36.5,
      pressure: 40,
      met: 1.2,
    };
    const [result] = normalizeOriginDataList([item]);
    expect(result.heart_value).toBe(72);
    expect(result.step_value).toBe(100);
    expect(result.cal_value).toBe(12.5);
    expect(result.dis_value).toBe(0.8);
    expect(result.sport_value).toBe(1);
    expect(result.systolic).toBe(120);
    expect(result.diastolic).toBe(80);
    expect(result.spo2_value).toBe(98);
    expect(result.temp_value).toBe(36.5);
    expect(result.stress_value).toBe(40);
    expect(result.met).toBe(1.2);
  });

  it('normalizes optional array fields (oxygens, ppgs, ecgs, res_rates, sleep_states, apnea_results, hypoxia_times, cardiac_loads)', () => {
    const item = {
      time: '09:00',
      oxygens: [95, 96],
      ppgs: [100, 101],
      ecgs: [200, 201],
      resRates: [15, 16],
      sleepStates: [1, 2],
      apneaResults: [0, 1],
      hypoxiaTimes: [10, 20],
      cardiacLoads: [5, 6],
    };
    const [result] = normalizeOriginDataList([item]);
    expect(result.oxygens).toEqual([95, 96]);
    expect(result.ppgs).toEqual([100, 101]);
    expect(result.ecgs).toEqual([200, 201]);
    expect(result.res_rates).toEqual([15, 16]);
    expect(result.sleep_states).toEqual([1, 2]);
    expect(result.apnea_results).toEqual([0, 1]);
    expect(result.hypoxia_times).toEqual([10, 20]);
    expect(result.cardiac_loads).toEqual([5, 6]);
  });

  it('handles snake_case aliases for array fields', () => {
    const item = {
      time: '10:00',
      res_rates: [14],
      sleep_states: [0],
      apnea_results: [1],
      hypoxia_times: [5],
      cardiac_loads: [3],
    };
    const [result] = normalizeOriginDataList([item]);
    expect(result.res_rates).toEqual([14]);
    expect(result.sleep_states).toEqual([0]);
  });

  it('leaves optional array fields undefined when absent', () => {
    const [result] = normalizeOriginDataList([{ time: '07:00' }]);
    expect(result.oxygens).toBeUndefined();
    expect(result.ppgs).toBeUndefined();
    expect(result.ecgs).toBeUndefined();
    expect(result.res_rates).toBeUndefined();
    expect(result.sleep_states).toBeUndefined();
    expect(result.apnea_results).toBeUndefined();
    expect(result.hypoxia_times).toBeUndefined();
    expect(result.cardiac_loads).toBeUndefined();
  });

  it('normalizes blood_glucose via bloodGlucose alias', () => {
    const [result] = normalizeOriginDataList([{ time: '11:00', bloodGlucose: 5.5 }]);
    expect(result.blood_glucose).toBe(5.5);
  });

  it('normalizes blood_glucose via glucose alias', () => {
    const [result] = normalizeOriginDataList([{ time: '11:00', glucose: 6.0 }]);
    expect(result.blood_glucose).toBe(6.0);
  });

  it('leaves blood_glucose undefined when not present', () => {
    const [result] = normalizeOriginDataList([{ time: '12:00' }]);
    expect(result.blood_glucose).toBeUndefined();
  });

  it('sorts results by time ascending', () => {
    const items = [{ time: '12:00' }, { time: '08:00' }, { time: '10:00' }];
    const result = normalizeOriginDataList(items);
    expect(result.map((r) => r.time)).toEqual(['08:00', '10:00', '12:00']);
  });
});

describe('normalizeHalfHourData', () => {
  it('returns zero-valued record for non-record input', () => {
    const result = normalizeHalfHourData(null);
    expect(result.time).toBe('');
    expect(result.heart_value).toBe(0);
    expect(result.step_value).toBe(0);
  });

  it('normalizes camelCase field aliases', () => {
    const result = normalizeHalfHourData({
      time: '08:30',
      heartValue: 68,
      sportValue: 2,
      stepValue: 200,
      calValue: 5.5,
      disValue: 0.3,
      spo2Value: 97,
      tempValue: 36.2,
      stressValue: 30,
      met: 1.1,
    });
    expect(result.heart_value).toBe(68);
    expect(result.sport_value).toBe(2);
    expect(result.step_value).toBe(200);
    expect(result.cal_value).toBe(5.5);
    expect(result.dis_value).toBe(0.3);
    expect(result.spo2_value).toBe(97);
    expect(result.temp_value).toBe(36.2);
    expect(result.stress_value).toBe(30);
    expect(result.met).toBe(1.1);
  });

  it('normalizes snake_case fields', () => {
    const result = normalizeHalfHourData({
      time: '09:00',
      heart_value: 70,
      sport_value: 1,
      step_value: 300,
      cal_value: 8.0,
      dis_value: 0.5,
      spo2_value: 96,
      temp_value: 36.7,
      stress_value: 20,
    });
    expect(result.heart_value).toBe(70);
    expect(result.sport_value).toBe(1);
    expect(result.step_value).toBe(300);
  });

  it('accepts undefined for optional temp_value and met', () => {
    const result = normalizeHalfHourData({ time: '10:00' });
    expect(result.temp_value).toBeUndefined();
    expect(result.met).toBeUndefined();
  });
});

describe('normalizeSpo2OriginData', () => {
  it('returns zero-valued record for non-record input', () => {
    const result = normalizeSpo2OriginData(undefined);
    expect(result.time).toBe('');
    expect(result.value).toBe(0);
    expect(result.rate).toBe(0);
  });

  it('normalizes camelCase field aliases', () => {
    const result = normalizeSpo2OriginData({
      time: '22:00',
      date: '2026-01-01',
      heartValue: 60,
      value: 95,
      rate: 16,
      isHypoxia: 0,
      cardiacLoad: 3,
      temp1: 365,
      sportValue: 0,
      apneaResult: 1,
      hypoxiaTime: 30,
      hypopnea: 2,
      stepValue: 50,
      allPackNumber: 100,
      currentPackNumber: 10,
    });
    expect(result.heart_value).toBe(60);
    expect(result.date).toBe('2026-01-01');
    expect(result.value).toBe(95);
    expect(result.rate).toBe(16);
    expect(result.is_hypoxia).toBe(0);
    expect(result.cardiac_load).toBe(3);
    expect(result.temp1).toBe(365);
    expect(result.sport_value).toBe(0);
    expect(result.apnea_result).toBe(1);
    expect(result.hypoxia_time).toBe(30);
    expect(result.hypopnea).toBe(2);
    expect(result.step_value).toBe(50);
    expect(result.all_pack_number).toBe(100);
    expect(result.current_pack_number).toBe(10);
  });

  it('normalizes snake_case aliases', () => {
    const result = normalizeSpo2OriginData({
      time: '23:00',
      heart_value: 55,
      is_hypoxia: 1,
      cardiac_load: 4,
      sport_value: 2,
      apnea_result: 0,
      hypoxia_time: 0,
      step_value: 10,
      all_pack_number: 50,
      current_pack_number: 5,
    });
    expect(result.heart_value).toBe(55);
    expect(result.is_hypoxia).toBe(1);
    expect(result.cardiac_load).toBe(4);
    expect(result.sport_value).toBe(2);
    expect(result.all_pack_number).toBe(50);
    expect(result.current_pack_number).toBe(5);
  });
});
