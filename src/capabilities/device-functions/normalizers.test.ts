import { normalizePackage1 } from './normalizers/package1';
import { normalizePackage2 } from './normalizers/package2';
import { normalizePackage3 } from './normalizers/package3';
import { normalizePackage4, normalizePackage5 } from './normalizers/package4-5';

describe('normalizePackage1', () => {
  it('returns flat-pack form (all unknown) when package1 field missing', () => {
    const result = normalizePackage1({});
    expect(result).toBeDefined();
    expect(result?.blood_pressure).toBe('unknown');
  });

  it('extracts flat-pack fields from top-level record', () => {
    const record = {
      Bp: 1,
      Drink: 0,
      Camera: 1,
      Woman: 2,
    };
    const result = normalizePackage1(record);
    expect(result?.blood_pressure).toBe('support');
    expect(result?.drinking).toBe('unsupported');
    expect(result?.camera).toBe('support');
    expect(result?.woman).toBe('open');
  });

  it('extracts camelCase aliases from top-level record', () => {
    const record = {
      heartWaring: 1,
      weChatSport: 0,
      fatigue: 1,
      spoH: 1,
    };
    const result = normalizePackage1(record);
    expect(result?.heart_rate_warning).toBe('support');
    expect(result?.we_chat_sport).toBe('unsupported');
    expect(result?.fatigue).toBe('support');
    expect(result?.spo_h).toBe('support');
  });

  it('reads from nested package1 object', () => {
    const record = {
      package1: {
        blood_pressure: 'support',
        camera: 'close',
        type: 'skip_this',
      },
    };
    const result = normalizePackage1(record);
    expect(result?.blood_pressure).toBe('support');
    expect(result?.camera).toBe('close');
    expect((result as any)?.type).toBeUndefined();
  });
});

describe('normalizePackage2', () => {
  it('returns defaults with zeros when no package2 field', () => {
    const result = normalizePackage2({});
    expect(result?.sleep_tag).toBe(0);
    expect(result?.watch_data_day_number).toBe(0);
  });

  it('extracts camelCase fields from top-level record', () => {
    const record = {
      CountDown: 1,
      SportModel: 1,
      breathFunction: 1,
      hrvFunction: 1,
      ecg: 1,
      sleepTag: 3,
      WathcDay: 7,
    };
    const result = normalizePackage2(record);
    expect(result?.count_down).toBe('support');
    expect(result?.sport_model_function).toBe('support');
    expect(result?.breath_function).toBe('support');
    expect(result?.hrv_function).toBe('support');
    expect(result?.ecg_function).toBe('support');
    expect(result?.sleep_tag).toBe(3);
    expect(result?.watch_data_day_number).toBe(7);
  });

  it('reads from nested package2 object (values pass-through for numbers)', () => {
    const record = {
      package2: {
        sleep_tag: 2,
        ecg_function: 'support',
        type: 'skip_this',
      },
    };
    const result = normalizePackage2(record);
    expect(result?.sleep_tag).toBe(2);
    expect(result?.ecg_function).toBe('support');
    expect((result as any)?.type).toBeUndefined();
  });

  // The retention window is the one package2 field a caller makes a DELETE
  // decision on, so both directions are asserted: it must survive the nested
  // pass-through, and its absence must stay distinguishable from a real value.
  // Native emits it under this exact snake_case key precisely because the
  // pass-through branch keeps nested keys verbatim.
  it('carries watch_data_day_number through the nested package2 object', () => {
    const record = {
      package2: {
        type: 'DeviceFunctionPackage2',
        ecgFunction: 'support',
        watch_data_day_number: 3,
      },
    };
    expect(normalizePackage2(record)?.watch_data_day_number).toBe(3);
  });

  it('leaves watch_data_day_number undefined when package2 omits it', () => {
    const record = {
      package2: {
        type: 'DeviceFunctionPackage2',
        ecgFunction: 'support',
      },
    };
    // Absent, NOT 0 — a band that does not report its window must not be
    // indistinguishable from one that reports zero days.
    expect(normalizePackage2(record)?.watch_data_day_number).toBeUndefined();
  });
});

describe('normalizePackage3', () => {
  it('returns defaults with zeros when no package3 field', () => {
    const result = normalizePackage3({});
    expect(result?.cpu_type).toBe(0);
    expect(result?.music_style).toBe(0);
  });

  it('extracts fields from flat record', () => {
    const record = {
      temperatureFunction: 1,
      temptureType: 1,
      cpuType: 2,
      stress: 1,
      agps: 1,
      bloodGlucoseType: 3,
    };
    const result = normalizePackage3(record);
    expect(result?.temperature_function).toBe('support');
    expect(result?.temperature_type).toBe(1);
    expect(result?.cpu_type).toBe(2);
    expect(result?.stress_function).toBe('support');
    expect(result?.agps_function).toBe('support');
    expect(result?.blood_glucose).toBe(3);
  });

  it('reads from nested package3 object', () => {
    const record = {
      package3: {
        cpu_type: 5,
        blood_glucose: 1,
        type: 'skip_this',
      },
    };
    const result = normalizePackage3(record);
    expect(result?.cpu_type).toBe(5);
    expect(result?.blood_glucose).toBe(1);
    expect((result as any)?.type).toBeUndefined();
  });
});

describe('normalizePackage4', () => {
  it('returns undefined when package4 missing', () => {
    expect(normalizePackage4({})).toBeUndefined();
  });

  it('normalizes function statuses from nested package4', () => {
    const record = {
      package4: { hrv: 1, temperature: 0, ecg: 2 },
    };
    const result = normalizePackage4(record);
    expect(result?.hrv).toBe('support');
    expect(result?.temperature).toBe('unsupported');
    expect(result?.ecg).toBe('open');
  });
});

describe('normalizePackage5', () => {
  it('returns undefined when package5 missing', () => {
    expect(normalizePackage5({})).toBeUndefined();
  });

  it('normalizes function statuses from nested package5', () => {
    const record = {
      package5: { body_composition: 1, blood_glucose: 3 },
    };
    const result = normalizePackage5(record);
    expect(result?.body_composition).toBe('support');
    expect(result?.blood_glucose).toBe('close');
  });
});
