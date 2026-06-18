import type {
  BloodAnalysisTestResult,
  BloodAnalysisValues,
  BloodGlucoseData,
  BloodOxygenTestResult,
  BloodPressureTestResult,
  BodyCompositionMetrics,
  BodyCompositionTestResult,
  BreathingTestResult,
  EcgTestResult,
  FatigueTestResult,
  GsrTestResult,
  HealthGlanceResult,
  HeartRateTestResult,
  HrvTestResult,
  PttTestResult,
  StressData,
  TemperatureTestResult,
} from "@/types/index";
import { isRecord, toInt, toNumber, toStringValue, normalizeTestState } from "@/shared/primitives";

export function normalizeHeartRateTestResult(value: unknown): HeartRateTestResult {
  const record = isRecord(value) ? value : {};
  return {
    state: normalizeTestState(record.rawState ?? record.state),
    value: toInt(record.value),
    progress: toInt(record.progress),
  };
}

export function normalizeBloodPressureTestResult(value: unknown): BloodPressureTestResult {
  const record = isRecord(value) ? value : {};
  return {
    state: normalizeTestState(record.rawState ?? record.state),
    systolic: toInt(record.systolic ?? record.highPressure),
    diastolic: toInt(record.diastolic ?? record.lowPressure),
    pulse: toInt(record.pulse),
    progress: toInt(record.progress),
  };
}

export function normalizeBloodOxygenTestResult(value: unknown): BloodOxygenTestResult {
  const record = isRecord(value) ? value : {};
  return {
    state: normalizeTestState(record.rawState ?? record.state),
    value: toInt(record.value ?? record.oxygenValue),
    rate: toInt(record.rate ?? record.rateValue),
    progress: toInt(record.progress),
  };
}

export function normalizeTemperatureTestResult(value: unknown): TemperatureTestResult {
  const record = isRecord(value) ? value : {};
  return {
    state: normalizeTestState(record.rawState ?? record.state),
    value: toNumber(record.value ?? record.tempValue),
    original_temp: toNumber(record.originalTemp ?? record.original_temp ?? record.originalTempValue),
    progress: toInt(record.progress),
    enable: typeof record.enable === 'boolean' ? record.enable : undefined,
  };
}

function normalizeWaveform(value: unknown): number[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const out: number[] = [];
  for (const x of value) {
    const n = typeof x === 'number' ? x : toInt(x);
    if (n !== undefined) out.push(n);
  }
  return out.length ? out : undefined;
}

export function normalizeHrvTestResult(value: unknown): HrvTestResult {
  const record = isRecord(value) ? value : {};
  return {
    state: normalizeTestState(record.rawState ?? record.state),
    value: toInt(record.value ?? record.hrv),
    progress: toInt(record.progress),
    raw_state: typeof record.rawState === 'string' ? record.rawState : undefined,
  };
}

export function normalizeEcgTestResult(value: unknown): EcgTestResult {
  const record = isRecord(value) ? value : {};
  // Diagnostic fields (ADR-0047 Tier B) arrive ONLY on the terminal event as raw
  // vendor strings. `int`/`mv` return undefined when absent (unlike `toInt`,
  // whose 0-fallback would stamp every non-terminal event), so the fields are
  // simply omitted until the report is present. `mv` undoes the vendor ×100.
  const int = (v: unknown): number | undefined => {
    const n = toNumber(v);
    return n === undefined ? undefined : Math.trunc(n);
  };
  const mv = (v: unknown): number | undefined => {
    const n = toNumber(v);
    return n === undefined ? undefined : n / 100;
  };
  const rhythm =
    Array.isArray(record.rhythmDiagnosis) ?
      record.rhythmDiagnosis.filter((s): s is string => typeof s === 'string' && s.length > 0)
    : undefined;
  return {
    state: normalizeTestState(record.rawState ?? record.state),
    progress: toInt(record.progress),
    heart_rate: toInt(record.heartRate ?? record.hr),
    hrv: toInt(record.hrv),
    raw_state: typeof record.rawState === 'string' ? record.rawState : undefined,
    waveform: normalizeWaveform(record.waveform),
    qt_ms: int(record.qtMs),
    sdnn_ms: int(record.sdnnMs),
    rmssd_ms: int(record.rmssdMs),
    qrs_duration_ms: int(record.qrsDurationMs),
    qrs_amplitude_mv: mv(record.qrsAmpX100),
    st_amplitude_mv: mv(record.stAmpX100),
    mental_stress_index: int(record.mentalStressIndex),
    fatigue_index: int(record.fatigueIndex),
    min_hr: int(record.minHr),
    max_hr: int(record.maxHr),
    rhythm_diagnosis: rhythm && rhythm.length > 0 ? rhythm : undefined,
  };
}

export function normalizeFatigueTestResult(value: unknown): FatigueTestResult {
  const record = isRecord(value) ? value : {};
  return {
    state: normalizeTestState(record.rawState ?? record.state),
    progress: toInt(record.progress),
    level: toInt(record.level ?? record.fatigueLevel),
    raw_state: typeof record.rawState === 'string' ? record.rawState : undefined,
  };
}

export function normalizeBreathingTestResult(value: unknown): BreathingTestResult {
  const record = isRecord(value) ? value : {};
  return {
    state: normalizeTestState(record.rawState ?? record.state),
    progress: toInt(record.progress),
    rate: toInt(record.rate ?? record.breathingRate),
    raw_state: typeof record.rawState === 'string' ? record.rawState : undefined,
  };
}

function normalizeBodyCompositionMetrics(value: unknown): BodyCompositionMetrics | undefined {
  if (!isRecord(value)) return undefined;
  const r = value;
  const mt = r.measurementTime;
  const timeRec = isRecord(mt) ? mt : undefined;
  return {
    date: typeof r.date === 'string' ? r.date : undefined,
    test_time: typeof r.testTime === 'string' ? r.testTime : undefined,
    is_device_test: typeof r.isDeviceTest === 'boolean' ? r.isDeviceTest : undefined,
    stature_cm: toInt(r.statureCm ?? r.stature),
    weight_kg: toInt(r.weightKg ?? r.weight),
    gender: toInt(r.gender),
    bmi: toNumber(r.bmi),
    body_fat_percentage: toNumber(r.bodyFatPercentage),
    fat_mass_kg: toNumber(r.fatMassKg ?? r.fatMass),
    lean_body_mass_kg: toNumber(r.leanBodyMassKg ?? r.leanBodyMass),
    muscle_rate: toNumber(r.muscleRate),
    muscle_mass_kg: toNumber(r.muscleMassKg ?? r.muscleMass),
    subcutaneous_fat_percentage: toNumber(r.subcutaneousFatPercentage ?? r.subcutaneousFat),
    body_water_percentage: toNumber(r.bodyWaterPercentage ?? r.bodyMoisture),
    water_mass_kg: toNumber(r.waterMassKg ?? r.waterContent),
    skeletal_muscle_rate: toNumber(r.skeletalMuscleRate),
    bone_mass_kg: toNumber(r.boneMassKg ?? r.boneMass),
    protein_percentage: toNumber(r.proteinPercentage ?? r.proportionOfProtein),
    protein_mass_kg: toNumber(r.proteinMassKg ?? r.proteinAmount),
    basal_metabolic_rate_kcal: toNumber(r.basalMetabolicRateKcal ?? r.basalMetabolicRate),
    measurement_duration_seconds: toInt(r.measurementDurationSeconds ?? r.duration),
    source_id_type: toInt(r.sourceIdType ?? r.idType),
    measurement_time:
      timeRec ?
        {
          year: toInt(timeRec.year),
          month: toInt(timeRec.month),
          day: toInt(timeRec.day),
          hour: toInt(timeRec.hour),
          minute: toInt(timeRec.minute),
        }
      : undefined,
  };
}

export function normalizeBodyCompositionTestResult(value: unknown): BodyCompositionTestResult {
  const record = isRecord(value) ? value : {};
  const raw = record.rawState;
  return {
    state: normalizeTestState(record.state),
    progress: toInt(record.progress),
    lead: toInt(record.lead),
    raw_state: typeof raw === 'string' || typeof raw === 'number' ? raw : undefined,
    is_end: typeof record.isEnd === 'boolean' ? record.isEnd : undefined,
    composition: normalizeBodyCompositionMetrics(record.composition),
  };
}

export function normalizeHealthGlanceResult(value: unknown): HealthGlanceResult {
  const r = isRecord(value) ? value : {};
  const raw = r.rawState;
  const pos = (v: unknown): number | undefined => {
    const n = toNumber(v);
    return typeof n === 'number' && n > 0 ? n : undefined;
  };
  return {
    state: normalizeTestState(r.state),
    progress: toInt(r.progress),
    raw_state: typeof raw === 'string' || typeof raw === 'number' ? raw : undefined,
    is_end: typeof r.isEnd === 'boolean' ? r.isEnd : undefined,
    heart_rate: pos(r.heartRate),
    blood_oxygen: pos(r.bloodOxygen),
    stress: pos(r.stress),
    hrv: pos(r.hrv),
    body_temperature: pos(r.bodyTemperature),
    systolic: pos(r.systolic),
    diastolic: pos(r.diastolic),
    blood_sugar: pos(r.bloodSugar),
    fatigue_level: pos(r.fatigueLevel),
  };
}

export function normalizeStressData(value: unknown): StressData {
  const record = isRecord(value) ? value : {};
  return {
    stress: toInt(record.stress ?? record.value),
    timestamp: toInt(record.timestamp, Date.now()),
    progress: toInt(record.progress),
    status: toStringValue(record.status || normalizeTestState(record.rawState ?? record.state)),
    is_end: typeof record.isEnd === 'boolean' ? record.isEnd : undefined,
  };
}

export function normalizeBloodGlucoseData(value: unknown): BloodGlucoseData {
  const record = isRecord(value) ? value : {};
  return {
    glucose: toNumber(record.glucose ?? record.bloodGlucose),
    progress: toInt(record.progress),
    level:
      record.level === undefined || typeof record.level === 'number' || typeof record.level === 'string'
        ? (record.level as string | number | undefined)
        : undefined,
    state:
      record.state === undefined
        ? normalizeTestState(record.rawState ?? record.status)
        : normalizeTestState(record.rawState ?? record.state),
    status: toStringValue(record.status),
    timestamp: toInt(record.timestamp, Date.now()),
    is_end: typeof record.isEnd === 'boolean' ? record.isEnd : undefined,
    error: toStringValue(record.error),
  };
}

export function normalizeGsrTestResult(value: unknown): GsrTestResult {
  const record = isRecord(value) ? value : {};
  const elRaw = record.emotionLevel ?? record.emotion_level;
  return {
    state: normalizeTestState(record.state),
    progress: toInt(record.progress) ?? 0,
    emotion_level: elRaw != null ? toInt(elRaw) : null,
    skin_moisture: toNumber(record.skinMoisture ?? record.skin_moisture) ?? null,
    sns_activation: toNumber(record.snsActivation ?? record.sns_activation) ?? null,
    cortisol_value: toNumber(record.cortisolValue ?? record.cortisol_value) ?? null,
  };
}

function normalizeBloodAnalysisValues(value: unknown): BloodAnalysisValues | null {
  if (!isRecord(value)) return null;
  const r = value;
  return {
    uric_acid: toNumber(r.uricAcid ?? r.uric_acid) ?? 0,
    total_cholesterol: toNumber(r.totalCholesterol ?? r.total_cholesterol) ?? 0,
    triglyceride: toNumber(r.triglyceride) ?? 0,
    high_density_lipoprotein: toNumber(r.highDensityLipoprotein ?? r.high_density_lipoprotein) ?? 0,
    low_density_lipoprotein: toNumber(r.lowDensityLipoprotein ?? r.low_density_lipoprotein) ?? 0,
  };
}

export function normalizeBloodAnalysisTestResult(value: unknown): BloodAnalysisTestResult {
  const record = isRecord(value) ? value : {};
  return {
    state: normalizeTestState(record.state),
    progress: toInt(record.progress) ?? 0,
    values: isRecord(record.values) ? normalizeBloodAnalysisValues(record.values) : null,
  };
}

export function normalizePttTestResult(value: unknown): PttTestResult {
  const record = isRecord(value) ? value : {};
  return {
    heart_rate: toInt(record.heartRate ?? record.heart_rate) ?? 0,
    hrv: toInt(record.hrv) ?? 0,
    qt_interval: toInt(record.qtInterval ?? record.qt_interval) ?? 0,
    signal_quality: toInt(record.signalQuality ?? record.signal_quality) ?? 0,
    progress: toInt(record.progress) ?? 0,
  };
}
