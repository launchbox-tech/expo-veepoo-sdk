jest.mock('expo-modules-core', () => ({
  requireNativeModule: jest.fn().mockReturnValue({}),
}));
jest.mock('react-native', () => ({
  Platform: { OS: 'ios' },
}));

import { REALTIME_TEST_DEFINITIONS } from '@/capabilities/realtime-tests/registry';
import { EVENT_DEFINITIONS } from '@/bridge/event-registry';
import {
  normalizeBloodAnalysisTestResult,
  normalizeBloodGlucoseData,
  normalizeBloodOxygenTestResult,
  normalizeBloodPressureTestResult,
  normalizeBodyCompositionTestResult,
  normalizeBreathingTestResult,
  normalizeEcgTestResult,
  normalizeFatigueTestResult,
  normalizeGsrTestResult,
  normalizeHeartRateTestResult,
  normalizeHrvTestResult,
  normalizePttTestResult,
  normalizeStressData,
  normalizeTemperatureTestResult,
} from '@/capabilities/realtime-tests/normalizers';
import { makeMockNative, type MockNative } from '@/__tests__/helpers/mock-native';

describe('REALTIME_TEST_DEFINITIONS registry', () => {
  // ── Coverage: every realtime-test result event is in the table ──────────

  it('has a row for every realtime-test result event', () => {
    expect(Object.keys(REALTIME_TEST_DEFINITIONS).sort()).toEqual(
      [
        'blood_analysis',
        'blood_glucose',
        'blood_oxygen',
        'blood_pressure',
        'body_composition',
        'breathing',
        'ecg',
        'fatigue',
        'gsr',
        'heart_rate',
        'hrv',
        'ptt',
        'stress',
        'temperature',
      ].sort(),
    );
  });

  // ── Row shape: each row binds its event, eventField, normalize ─────────

  it.each([
    ['heart_rate',       'heart_rate_test_result',        'result', normalizeHeartRateTestResult],
    ['blood_pressure',   'blood_pressure_test_result',    'result', normalizeBloodPressureTestResult],
    ['blood_oxygen',     'blood_oxygen_test_result',      'result', normalizeBloodOxygenTestResult],
    ['temperature',      'temperature_test_result',       'result', normalizeTemperatureTestResult],
    ['stress',           'stress_data',                   'data',   normalizeStressData],
    ['blood_glucose',    'blood_glucose_data',            'data',   normalizeBloodGlucoseData],
    ['hrv',              'hrv_test_result',               'result', normalizeHrvTestResult],
    ['ecg',              'ecg_test_result',               'result', normalizeEcgTestResult],
    ['fatigue',          'fatigue_test_result',           'result', normalizeFatigueTestResult],
    ['breathing',        'breathing_test_result',         'result', normalizeBreathingTestResult],
    ['body_composition', 'body_composition_test_result',  'result', normalizeBodyCompositionTestResult],
    ['blood_analysis',   'blood_analysis_test_result',    'result', normalizeBloodAnalysisTestResult],
    ['gsr',              'gsr_test_result',               'result', normalizeGsrTestResult],
    ['ptt',              'ptt_test_result',               'result', normalizePttTestResult],
  ] as const)(
    'row "%s" declares event "%s" with field "%s" and the matching normalizer',
    (key, expectedEvent, expectedField, expectedNormalize) => {
      const row = REALTIME_TEST_DEFINITIONS[key];
      expect(row.event).toBe(expectedEvent);
      expect(row.eventField).toBe(expectedField);
      expect(row.normalize).toBe(expectedNormalize);
    },
  );

  // ── Controllable rows: have a control surface; receive-only rows do not ──

  const controllable = [
    'heart_rate', 'blood_pressure', 'blood_oxygen', 'temperature',
    'stress', 'blood_glucose', 'hrv', 'ecg',
    'fatigue', 'breathing', 'body_composition',
  ] as const;

  const receiveOnly = ['blood_analysis', 'gsr', 'ptt'] as const;

  it.each(controllable)('row "%s" has a control surface', (key) => {
    expect(REALTIME_TEST_DEFINITIONS[key].control).toBeDefined();
  });

  it.each(receiveOnly)('row "%s" is receive-only (no control surface)', (key) => {
    expect(REALTIME_TEST_DEFINITIONS[key].control).toBeUndefined();
  });

  // ── control.start / control.stop dispatch to the right native method ────

  describe('control surface dispatches to the declared native method', () => {
    let native: MockNative;
    beforeEach(() => { native = makeMockNative(); });

    it.each([
      ['heart_rate',       'startHeartRateTest',       'stopHeartRateTest'],
      ['blood_pressure',   'startBloodPressureTest',   'stopBloodPressureTest'],
      ['blood_oxygen',     'startBloodOxygenTest',     'stopBloodOxygenTest'],
      ['temperature',      'startTemperatureTest',     'stopTemperatureTest'],
      ['stress',           'startStressTest',          'stopStressTest'],
      ['blood_glucose',    'startBloodGlucoseTest',    'stopBloodGlucoseTest'],
      ['hrv',              'startHrvTest',             'stopHrvTest'],
      ['fatigue',          'startFatigueTest',         'stopFatigueTest'],
      ['breathing',        'startBreathingTest',       'stopBreathingTest'],
      ['body_composition', 'startBodyCompositionTest', 'stopBodyCompositionTest'],
    ] as const)(
      '%s.control.start/stop → native %s / %s',
      async (key, startMethod, stopMethod) => {
        const row = REALTIME_TEST_DEFINITIONS[key];
        if (!row.control) throw new Error(`row ${key} has no control`);
        await row.control.start(native);
        await row.control.stop(native);
        expect((native as unknown as Record<string, jest.Mock>)[startMethod]).toHaveBeenCalledTimes(1);
        expect((native as unknown as Record<string, jest.Mock>)[stopMethod]).toHaveBeenCalledTimes(1);
      },
    );

    it('ecg.control.start passes camelCase options through to native', async () => {
      const row = REALTIME_TEST_DEFINITIONS.ecg;
      if (!row.control) throw new Error('ecg has no control');
      await row.control.start(native, { include_waveform: true });
      expect(native.startEcgTest).toHaveBeenCalledWith({ includeWaveform: true });
    });

    it('ecg.control.start with no options passes undefined to native', async () => {
      const row = REALTIME_TEST_DEFINITIONS.ecg;
      if (!row.control) throw new Error('ecg has no control');
      await row.control.start(native);
      expect(native.startEcgTest).toHaveBeenCalledWith(undefined);
    });
  });

  // ── event-registry derives its result-event defs from the table ────────

  describe('event-registry derives result-event defs from REALTIME_TEST_DEFINITIONS', () => {
    it.each(Object.values(REALTIME_TEST_DEFINITIONS).map((r) => r.event))(
      'EVENT_DEFINITIONS has a derived entry for "%s"',
      (eventName) => {
        const def = (EVENT_DEFINITIONS as unknown as Record<string, { jsName: string; normalize: (raw: unknown) => unknown }>)[eventName];
        expect(def).toBeDefined();
        expect(def.jsName).toBe(eventName);
      },
    );

    it('derived def.normalize wraps the inner payload via wrapInner(row.eventField, row.normalize)', () => {
      const row = REALTIME_TEST_DEFINITIONS.heart_rate;
      const def = (EVENT_DEFINITIONS as unknown as Record<string, { normalize: (raw: unknown) => unknown }>)[row.event];
      const sample = { device_id: 'abc', [row.eventField]: { value: 120, progress: 50, rawState: 'testing' } };
      const out = def.normalize(sample) as {
        device_id: string;
        result: { value: number; progress: number; state: string };
      };
      expect(out.device_id).toBe('abc');
      expect(out.result.value).toBe(120);
      expect(out.result.progress).toBe(50);
      expect(out.result.state).toBe('testing');
    });

    it('stress derived def normalizes via the "data" envelope field', () => {
      const row = REALTIME_TEST_DEFINITIONS.stress;
      const def = (EVENT_DEFINITIONS as unknown as Record<string, { normalize: (raw: unknown) => unknown }>)[row.event];
      const sample = { device_id: 'xyz', data: { stress: 45, timestamp: 1000, progress: 30 } };
      const out = def.normalize(sample) as {
        device_id: string;
        data: { stress: number; progress: number };
      };
      expect(out.device_id).toBe('xyz');
      expect(out.data.stress).toBe(45);
      expect(out.data.progress).toBe(30);
    });
  });
});
