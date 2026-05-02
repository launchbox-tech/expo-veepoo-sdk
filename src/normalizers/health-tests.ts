import type {
  BloodOxygenTestResult,
  BloodPressureTestResult,
  HeartRateTestResult,
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
