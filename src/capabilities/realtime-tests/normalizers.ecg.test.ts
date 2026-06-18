import { normalizeEcgTestResult } from '@/capabilities/realtime-tests/normalizers';

// Locks the ADR-0047 Tier B diagnostic parse/scale contract: vendor strings →
// numbers, ×100 fields → mV, and absence → omitted (never a 0-stamp).
describe('normalizeEcgTestResult — Tier B diagnostics', () => {
  it('omits every diagnostic field on a non-terminal event', () => {
    const r = normalizeEcgTestResult({
      rawState: 'VPTestECGState(rawValue: 1)',
      progress: 50,
      heartRate: 70,
    });
    expect(r.qt_ms).toBeUndefined();
    expect(r.sdnn_ms).toBeUndefined();
    expect(r.rmssd_ms).toBeUndefined();
    expect(r.qrs_amplitude_mv).toBeUndefined();
    expect(r.st_amplitude_mv).toBeUndefined();
    expect(r.mental_stress_index).toBeUndefined();
    expect(r.fatigue_index).toBeUndefined();
    expect(r.rhythm_diagnosis).toBeUndefined();
  });

  it('parses and scales the vendor report on the terminal event', () => {
    const r = normalizeEcgTestResult({
      rawState: 'VPTestECGState(rawValue: 6)',
      progress: 100,
      heartRate: 67,
      hrv: 16,
      qtMs: '374',
      sdnnMs: '43',
      rmssdMs: '56',
      qrsDurationMs: '66',
      qrsAmpX100: '138',
      stAmpX100: '3',
      mentalStressIndex: '62',
      fatigueIndex: '60',
      minHr: 61,
      maxHr: 74,
    });
    expect(r.qt_ms).toBe(374);
    expect(r.sdnn_ms).toBe(43);
    expect(r.rmssd_ms).toBe(56);
    expect(r.qrs_duration_ms).toBe(66);
    expect(r.qrs_amplitude_mv).toBeCloseTo(1.38);
    expect(r.st_amplitude_mv).toBeCloseTo(0.03);
    expect(r.mental_stress_index).toBe(62);
    expect(r.fatigue_index).toBe(60);
    expect(r.min_hr).toBe(61);
    expect(r.max_hr).toBe(74);
  });

  it('drops unparseable vendor placeholders ("<nil>") rather than coercing to 0', () => {
    const r = normalizeEcgTestResult({
      rawState: 'VPTestECGState(rawValue: 6)',
      qtMs: '<nil>',
      sdnnMs: '43',
    });
    expect(r.qt_ms).toBeUndefined();
    expect(r.sdnn_ms).toBe(43);
  });

  it('surfaces vendor rhythm labels when present, omits when the array is empty', () => {
    expect(
      normalizeEcgTestResult({ rhythmDiagnosis: ['atrial_fibrillation'] }).rhythm_diagnosis,
    ).toEqual(['atrial_fibrillation']);
    expect(normalizeEcgTestResult({ rhythmDiagnosis: [] }).rhythm_diagnosis).toBeUndefined();
  });
});
