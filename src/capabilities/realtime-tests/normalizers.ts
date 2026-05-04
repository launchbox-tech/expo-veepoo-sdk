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
} from "../../types/index.js";
import { isRecord, toInt, toNumber, toStringValue, normalizeTestState } from "../../normalizers/primitives.js";

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
    originalTemp: toNumber(record.originalTemp ?? record.originalTempValue),
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
    rawState: typeof record.rawState === 'string' ? record.rawState : undefined,
  };
}

export function normalizeEcgTestResult(value: unknown): EcgTestResult {
  const record = isRecord(value) ? value : {};
  return {
    state: normalizeTestState(record.rawState ?? record.state),
    progress: toInt(record.progress),
    heartRate: toInt(record.heartRate ?? record.hr),
    hrv: toInt(record.hrv),
    rawState: typeof record.rawState === 'string' ? record.rawState : undefined,
    waveform: normalizeWaveform(record.waveform),
  };
}

export function normalizeFatigueTestResult(value: unknown): FatigueTestResult {
  const record = isRecord(value) ? value : {};
  return {
    state: normalizeTestState(record.rawState ?? record.state),
    progress: toInt(record.progress),
    level: toInt(record.level ?? record.fatigueLevel),
    rawState: typeof record.rawState === 'string' ? record.rawState : undefined,
  };
}

export function normalizeBreathingTestResult(value: unknown): BreathingTestResult {
  const record = isRecord(value) ? value : {};
  return {
    state: normalizeTestState(record.rawState ?? record.state),
    progress: toInt(record.progress),
    rate: toInt(record.rate ?? record.breathingRate),
    rawState: typeof record.rawState === 'string' ? record.rawState : undefined,
  };
}

export function normalizeBodyCompositionMetrics(value: unknown): BodyCompositionMetrics | undefined {
  if (!isRecord(value)) return undefined;
  const r = value;
  const mt = r.measurementTime;
  const timeRec = isRecord(mt) ? mt : undefined;
  return {
    date: typeof r.date === 'string' ? r.date : undefined,
    testTime: typeof r.testTime === 'string' ? r.testTime : undefined,
    isDeviceTest: typeof r.isDeviceTest === 'boolean' ? r.isDeviceTest : undefined,
    statureCm: toInt(r.statureCm ?? r.stature),
    weightKg: toInt(r.weightKg ?? r.weight),
    gender: toInt(r.gender),
    bmi: toNumber(r.bmi),
    bodyFatPercentage: toNumber(r.bodyFatPercentage),
    fatMassKg: toNumber(r.fatMassKg ?? r.fatMass),
    leanBodyMassKg: toNumber(r.leanBodyMassKg ?? r.leanBodyMass),
    muscleRate: toNumber(r.muscleRate),
    muscleMassKg: toNumber(r.muscleMassKg ?? r.muscleMass),
    subcutaneousFatPercentage: toNumber(r.subcutaneousFatPercentage ?? r.subcutaneousFat),
    bodyWaterPercentage: toNumber(r.bodyWaterPercentage ?? r.bodyMoisture),
    waterMassKg: toNumber(r.waterMassKg ?? r.waterContent),
    skeletalMuscleRate: toNumber(r.skeletalMuscleRate),
    boneMassKg: toNumber(r.boneMassKg ?? r.boneMass),
    proteinPercentage: toNumber(r.proteinPercentage ?? r.proportionOfProtein),
    proteinMassKg: toNumber(r.proteinMassKg ?? r.proteinAmount),
    basalMetabolicRateKcal: toNumber(r.basalMetabolicRateKcal ?? r.basalMetabolicRate),
    measurementDurationSeconds: toInt(r.measurementDurationSeconds ?? r.duration),
    sourceIdType: toInt(r.sourceIdType ?? r.idType),
    measurementTime:
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
    rawState: typeof raw === 'string' || typeof raw === 'number' ? raw : undefined,
    isEnd: typeof record.isEnd === 'boolean' ? record.isEnd : undefined,
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
    isEnd: typeof record.isEnd === 'boolean' ? record.isEnd : undefined,
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
    isEnd: typeof record.isEnd === 'boolean' ? record.isEnd : undefined,
    error: toStringValue(record.error),
  };
}
