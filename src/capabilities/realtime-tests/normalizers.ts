import type {
  BloodGlucoseData,
  BloodOxygenTestResult,
  BloodPressureTestResult,
  BodyCompositionMetrics,
  BodyCompositionTestResult,
  BreathingTestResult,
  EcgTestResult,
  FatigueTestResult,
  HeartRateTestResult,
  HrvTestResult,
  StressData,
  TemperatureTestResult,
} from "@/types/index";
import { isRecord, toInt, toNumber, toStringValue, normalizeTestState } from "@/normalizers/primitives";

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
  return {
    state: normalizeTestState(record.rawState ?? record.state),
    progress: toInt(record.progress),
    heart_rate: toInt(record.heartRate ?? record.hr),
    hrv: toInt(record.hrv),
    raw_state: typeof record.rawState === 'string' ? record.rawState : undefined,
    waveform: normalizeWaveform(record.waveform),
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

export function normalizeBodyCompositionMetrics(value: unknown): BodyCompositionMetrics | undefined {
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
