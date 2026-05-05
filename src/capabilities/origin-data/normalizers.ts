import type { HalfHourData, OriginData, Spo2OriginData } from "@/types/index";
import { isRecord, toInt, toNumber, toStringValue } from "@/normalizers/primitives";

function normalizeOriginItem(value: Record<string, unknown>): OriginData {
  const rawBloodGlucose = toNumber(value.bloodGlucose ?? value.glucose);
  return {
    time: toStringValue(value.time),
    heart_value: toInt(value.heartValue ?? value.heart_value),
    step_value: toInt(value.stepValue ?? value.step_value),
    cal_value: toNumber(value.calValue ?? value.cal_value) ?? 0,
    dis_value: toNumber(value.disValue ?? value.dis_value) ?? 0,
    sport_value: toInt(value.sportValue ?? value.sport_value),
    systolic: toInt(value.systolic ?? value.highValue),
    diastolic: toInt(value.diastolic ?? value.lowValue),
    spo2_value: toInt(value.spo2Value ?? value.spo2_value),
    temp_value: toNumber(value.tempValue ?? value.temp_value) ?? 0,
    stress_value: toInt(value.stressValue ?? value.stress_value ?? value.stress ?? value.pressure),
    met: toNumber(value.met) ?? 0,
    oxygens: Array.isArray(value.oxygens) ? value.oxygens.map((item) => toInt(item)) : undefined,
    ppgs: Array.isArray(value.ppgs) ? value.ppgs.map((item) => toInt(item)) : undefined,
    ecgs: Array.isArray(value.ecgs) ? value.ecgs.map((item) => toInt(item)) : undefined,
    res_rates: Array.isArray(value.resRates ?? value.res_rates) ? ((value.resRates ?? value.res_rates) as unknown[]).map((item) => toInt(item)) : undefined,
    sleep_states: Array.isArray(value.sleepStates ?? value.sleep_states)
      ? ((value.sleepStates ?? value.sleep_states) as unknown[]).map((item) => toInt(item))
      : undefined,
    apnea_results: Array.isArray(value.apneaResults ?? value.apnea_results)
      ? ((value.apneaResults ?? value.apnea_results) as unknown[]).map((item) => toInt(item))
      : undefined,
    hypoxia_times: Array.isArray(value.hypoxiaTimes ?? value.hypoxia_times)
      ? ((value.hypoxiaTimes ?? value.hypoxia_times) as unknown[]).map((item) => toInt(item))
      : undefined,
    cardiac_loads: Array.isArray(value.cardiacLoads ?? value.cardiac_loads)
      ? ((value.cardiacLoads ?? value.cardiac_loads) as unknown[]).map((item) => toInt(item))
      : undefined,
    blood_glucose: rawBloodGlucose === undefined ? undefined : rawBloodGlucose,
  };
}

export function normalizeOriginDataList(value: unknown): OriginData[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter(isRecord)
    .map((item) => normalizeOriginItem(item))
    .sort((a, b) => a.time.localeCompare(b.time));
}

export function normalizeHalfHourData(value: unknown): HalfHourData {
  const record = isRecord(value) ? value : {};
  return {
    time: toStringValue(record.time),
    heart_value: toInt(record.heartValue ?? record.heart_value),
    sport_value: toInt(record.sportValue ?? record.sport_value),
    step_value: toInt(record.stepValue ?? record.step_value),
    cal_value: toNumber(record.calValue ?? record.cal_value) ?? 0,
    dis_value: toNumber(record.disValue ?? record.dis_value) ?? 0,
    diastolic: toInt(record.diastolic),
    systolic: toInt(record.systolic),
    spo2_value: toInt(record.spo2Value ?? record.spo2_value),
    temp_value: toNumber(record.tempValue ?? record.temp_value),
    stress_value: toInt(record.stressValue ?? record.stress_value),
    met: toNumber(record.met),
  };
}

export function normalizeSpo2OriginData(value: unknown): Spo2OriginData {
  const record = isRecord(value) ? value : {};
  return {
    time: toStringValue(record.time),
    date: toStringValue(record.date),
    heart_value: toInt(record.heartValue ?? record.heart_value),
    value: toInt(record.value),
    rate: toInt(record.rate),
    is_hypoxia: toInt(record.isHypoxia ?? record.is_hypoxia),
    cardiac_load: toInt(record.cardiacLoad ?? record.cardiac_load),
    temp1: toInt(record.temp1),
    sport_value: toInt(record.sportValue ?? record.sport_value),
    apnea_result: toInt(record.apneaResult ?? record.apnea_result),
    hypoxia_time: toInt(record.hypoxiaTime ?? record.hypoxia_time),
    hypopnea: toInt(record.hypopnea),
    step_value: toInt(record.stepValue ?? record.step_value),
    all_pack_number: toInt(record.allPackNumber ?? record.all_pack_number),
    current_pack_number: toInt(record.currentPackNumber ?? record.current_pack_number),
  };
}
