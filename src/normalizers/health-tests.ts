import type {
  BloodOxygenTestResult,
  BloodPressureTestResult,
  BreathingTestResult,
  EcgTestResult,
  FatigueTestResult,
  HeartRateTestResult,
  HrvTestResult,
  TemperatureTestResult,
} from '../types/index.js';
import { isRecord, toInt, toNumber, normalizeTestState } from './shared.js';

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
