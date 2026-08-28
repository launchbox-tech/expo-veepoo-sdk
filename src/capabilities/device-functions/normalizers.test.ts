import { loadEmittedPackageKeys, REPO_ROOT } from '@/__tests__/helpers/emitted-device-function-keys';
import goldenPayloads from '@/__tests__/fixtures/device-function-payloads.golden.json';
import { normalizeDeviceFunctions } from './normalizers/index';
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

  it('reads from the nested package1 object native actually sends', () => {
    const result = normalizePackage1({ package1: goldenPayloads.ios.package1 });
    expect(result?.blood_pressure).toBe('support');
    expect(result?.heart_rate_detect).toBe('support');
    expect(result?.spo_h).toBe('support');
    expect(result?.temperature_function).toBe('unsupported');
    expect((result as any)?.type).toBeUndefined();
  });

  // iOS omits `heart_rate_detect` when the band has not sent the package-1
  // frame, so that "did not report" stays distinct from "said no". Defaulting
  // an absent field to 'unsupported' would make a silent band indistinguishable
  // from one that answered no — the #210 family's whole shape.
  it('leaves heart_rate_detect absent when native omits it', () => {
    const { heart_rate_detect: _omitted, ...withoutHeartRate } =
      goldenPayloads.ios.package1;
    const result = normalizePackage1({ package1: withoutHeartRate });
    expect(result).not.toHaveProperty('heart_rate_detect');
    expect(result?.heart_rate_detect).toBeUndefined();
    // The siblings still arrive — absence is scoped to the omitted field.
    expect(result?.blood_pressure).toBe('support');
  });

  // Native emitting a key no interface declares is the #210 defect. Dropping it
  // keeps the returned object honest about its own type instead of carrying a
  // field nothing can read.
  it('drops an undeclared key rather than casting it into the result', () => {
    const result = normalizePackage1({ package1: { bloodPressure: 'support' } });
    expect((result as any)?.bloodPressure).toBeUndefined();
    expect(result?.blood_pressure).toBeUndefined();
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

  it('reads from the nested package2 object native actually sends', () => {
    const result = normalizePackage2({ package2: goldenPayloads.ios.package2 });
    expect(result?.ecg_function).toBe('support');
    expect(result?.precision_sleep).toBe('support');
    expect(result?.hrv_function).toBe('unsupported');
    expect(result?.watch_data_day_number).toBe(7);
    expect((result as any)?.type).toBeUndefined();
  });

  // Android reports the vendor's four-value EFunctionStatus, not just yes/no.
  it('keeps the open/close statuses Android reports', () => {
    const result = normalizePackage1({ package1: goldenPayloads.android.package1 });
    expect(result?.heart_rate_detect).toBe('open');
    expect(result?.spo_h).toBe('close');
    expect(result?.temperature_function).toBe('unknown');
  });

  // The retention window is the one package2 field a caller makes a DELETE
  // decision on, so both directions are asserted: it must survive the nested
  // read, and its absence must stay distinguishable from a real value.
  it('carries watch_data_day_number through the nested package2 object', () => {
    const record = {
      package2: {
        type: 'DeviceFunctionPackage2',
        ecg_function: 'support',
        watch_data_day_number: 3,
      },
    };
    expect(normalizePackage2(record)?.watch_data_day_number).toBe(3);
  });

  it('leaves watch_data_day_number undefined when package2 omits it', () => {
    const record = {
      package2: {
        type: 'DeviceFunctionPackage2',
        ecg_function: 'support',
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
      bloodGlucose: 1,
      bloodGlucoseTag: 3,
    };
    const result = normalizePackage3(record);
    expect(result?.temperature_function).toBe('support');
    expect(result?.temperature_type).toBe(1);
    expect(result?.cpu_type).toBe(2);
    expect(result?.stress_function).toBe('support');
    expect(result?.agps_function).toBe('support');
    expect(result?.blood_glucose).toBe('support');
    expect(result?.blood_glucose_tag).toBe(3);
  });

  it('reads from the nested package3 object native actually sends', () => {
    const result = normalizePackage3({ package3: goldenPayloads.ios.package3 });
    expect(result?.stress_function).toBe('support');
    expect(result?.agps_function).toBe('unsupported');
    expect(result?.blood_glucose).toBe('support');
    expect(result?.blood_component).toBe('unsupported');
    expect(result?.body_component).toBe('unsupported');
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


// The defect this file failed to catch was a test asserting over input no native
// layer sends. These cases take their input from the emitters themselves, so a
// key renamed in Swift or Kotlin fails here rather than going quietly undefined.
// (That the fixture matches those emitters is asserted in the key contract test.)
describe('normalizeDeviceFunctions against the emitted native shape', () => {
  const emitted = loadEmittedPackageKeys(REPO_ROOT);

  for (const platform of ['ios', 'android'] as const) {
    it(`every field ${platform} reports reaches JS under its declared name`, () => {
      const payload = goldenPayloads[platform] as Record<string, Record<string, unknown>>;
      const result = normalizeDeviceFunctions(payload) as Record<string, Record<string, unknown>>;
      for (const [name, keys] of emitted[platform]) {
        for (const key of keys) {
          expect(`${name}.${key}=${String(result[name]?.[key])}`).not.toContain('=undefined');
        }
      }
    });
  }
});
