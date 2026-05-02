import type {
  BloodGlucoseData,
  DaySummaryData,
  HalfHourData,
  OriginData,
  SleepData,
  Spo2OriginData,
  SportStepData,
  StressData,
} from '../types/index.js';
import { isRecord, toNumber, toInt, toStringValue, normalizeTestState } from './shared.js';

function normalizeSleepRecord(value: Record<string, unknown>): SleepData | null {
  if (Array.isArray(value.items) && isRecord(value.summary)) {
    return {
      date: toStringValue(value.date),
      items: value.items.map((item) => {
        const record = isRecord(item) ? item : {};
        return {
          date: toStringValue(record.date),
          sleepTime: toStringValue(record.sleepTime),
          wakeTime: toStringValue(record.wakeTime),
          deepSleepMinutes: toInt(record.deepSleepMinutes),
          lightSleepMinutes: toInt(record.lightSleepMinutes),
          totalSleepMinutes: toInt(record.totalSleepMinutes),
          sleepQuality: toInt(record.sleepQuality),
          sleepLine: toStringValue(record.sleepLine),
          wakeUpCount: toInt(record.wakeUpCount),
        };
      }),
      summary: {
        totalDeepSleepMinutes: toInt(value.summary.totalDeepSleepMinutes),
        totalLightSleepMinutes: toInt(value.summary.totalLightSleepMinutes),
        totalSleepMinutes: toInt(value.summary.totalSleepMinutes),
        averageSleepQuality: toInt(value.summary.averageSleepQuality),
        totalWakeUpCount: toInt(value.summary.totalWakeUpCount),
      },
    };
  }

  const sleepTime = toStringValue(value.SLEEP_TIME ?? value.sleepTime);
  const wakeTime = toStringValue(value.WAKE_TIME ?? value.wakeTime);
  if (!sleepTime && !wakeTime) return null;

  const deepSleepMinutes = Math.trunc((toNumber(value.DEEP_HOUR) ?? 0) * 60);
  const lightSleepMinutes = Math.trunc((toNumber(value.LIGHT_HOUR) ?? 0) * 60);
  const totalSleepMinutes =
    toInt(value.totalSleepMinutes, -1) >= 0
      ? toInt(value.totalSleepMinutes)
      : Math.trunc((toNumber(value.SLE_HOUR) ?? 0) * 60 + (toNumber(value.SLE_MINUTE) ?? 0));
  const sleepQuality = toInt(value.SLEEP_LEVEL ?? value.sleepQuality);
  const wakeUpCount = toInt(value.WakeUpTime ?? value.wakeUpCount);
  const date = toStringValue(value.date || (wakeTime ? wakeTime.slice(0, 10) : ''));

  return {
    date,
    items: [
      {
        date,
        sleepTime,
        wakeTime,
        deepSleepMinutes,
        lightSleepMinutes,
        totalSleepMinutes,
        sleepQuality,
        sleepLine: toStringValue(value.SLE_LINE ?? value.sleepLine),
        wakeUpCount,
      },
    ],
    summary: {
      totalDeepSleepMinutes: deepSleepMinutes,
      totalLightSleepMinutes: lightSleepMinutes,
      totalSleepMinutes,
      averageSleepQuality: sleepQuality,
      totalWakeUpCount: wakeUpCount,
    },
  };
}

function normalizeOriginItem(value: Record<string, unknown>): OriginData {
  const rawBloodGlucose = toNumber(value.bloodGlucose ?? value.glucose);
  return {
    time: toStringValue(value.time),
    heartValue: toInt(value.heartValue),
    stepValue: toInt(value.stepValue),
    calValue: toNumber(value.calValue) ?? 0,
    disValue: toNumber(value.disValue) ?? 0,
    sportValue: toInt(value.sportValue),
    systolic: toInt(value.systolic ?? value.highValue),
    diastolic: toInt(value.diastolic ?? value.lowValue),
    spo2Value: toInt(value.spo2Value),
    tempValue: toNumber(value.tempValue) ?? 0,
    stressValue: toInt(value.stressValue ?? value.stress ?? value.pressure),
    met: toNumber(value.met) ?? 0,
    oxygens: Array.isArray(value.oxygens) ? value.oxygens.map((item) => toInt(item)) : undefined,
    ppgs: Array.isArray(value.ppgs) ? value.ppgs.map((item) => toInt(item)) : undefined,
    ecgs: Array.isArray(value.ecgs) ? value.ecgs.map((item) => toInt(item)) : undefined,
    resRates: Array.isArray(value.resRates) ? value.resRates.map((item) => toInt(item)) : undefined,
    sleepStates: Array.isArray(value.sleepStates)
      ? value.sleepStates.map((item) => toInt(item))
      : undefined,
    apneaResults: Array.isArray(value.apneaResults)
      ? value.apneaResults.map((item) => toInt(item))
      : undefined,
    hypoxiaTimes: Array.isArray(value.hypoxiaTimes)
      ? value.hypoxiaTimes.map((item) => toInt(item))
      : undefined,
    cardiacLoads: Array.isArray(value.cardiacLoads)
      ? value.cardiacLoads.map((item) => toInt(item))
      : undefined,
    bloodGlucose: rawBloodGlucose === undefined ? undefined : rawBloodGlucose,
  };
}

export function normalizeSleepDataList(value: unknown): SleepData[] {
  if (!Array.isArray(value)) {
    if (isRecord(value)) {
      const single = normalizeSleepRecord(value);
      return single ? [single] : [];
    }
    return [];
  }
  return value
    .map((item) => (isRecord(item) ? normalizeSleepRecord(item) : null))
    .filter((item): item is SleepData => item !== null);
}

export function normalizeSportStepData(value: unknown): SportStepData {
  const record = isRecord(value) ? value : {};
  return {
    date: toStringValue(record.date),
    stepCount: toInt(record.stepCount ?? record.step),
    distance: toNumber(record.distance ?? record.dis) ?? 0,
    calories: toNumber(record.calories ?? record.kcal ?? record.cal) ?? 0,
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
    heartValue: toInt(record.heartValue),
    sportValue: toInt(record.sportValue),
    stepValue: toInt(record.stepValue),
    calValue: toNumber(record.calValue) ?? 0,
    disValue: toNumber(record.disValue) ?? 0,
    diastolic: toInt(record.diastolic),
    systolic: toInt(record.systolic),
    spo2Value: toInt(record.spo2Value),
    tempValue: toNumber(record.tempValue),
    stressValue: toInt(record.stressValue),
    met: toNumber(record.met),
  };
}

export function normalizeDaySummaryData(value: unknown): DaySummaryData {
  const record = isRecord(value) ? value : {};
  return {
    date: toStringValue(record.date),
    allStep: toInt(record.allStep),
    sportList: Array.isArray(record.sportList)
      ? record.sportList
          .filter(isRecord)
          .map((item) => ({
            time: toStringValue(item.time),
            step: toInt(item.step),
            cal: toNumber(item.cal) ?? 0,
            dis: toNumber(item.dis) ?? 0,
          }))
      : [],
    rateList: Array.isArray(record.rateList)
      ? record.rateList
          .filter(isRecord)
          .map((item) => ({
            time: toStringValue(item.time),
            rate: toInt(item.rate),
          }))
      : [],
    bpList: Array.isArray(record.bpList)
      ? record.bpList
          .filter(isRecord)
          .map((item) => ({
            time: toStringValue(item.time),
            high: toInt(item.high),
            low: toInt(item.low),
          }))
      : [],
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

export function normalizeSpo2OriginData(value: unknown): Spo2OriginData {
  const record = isRecord(value) ? value : {};
  return {
    time: toStringValue(record.time),
    date: toStringValue(record.date),
    heartValue: toInt(record.heartValue),
    value: toInt(record.value),
    rate: toInt(record.rate),
    isHypoxia: toInt(record.isHypoxia),
    cardiacLoad: toInt(record.cardiacLoad),
    temp1: toInt(record.temp1),
    sportValue: toInt(record.sportValue),
    apneaResult: toInt(record.apneaResult),
    hypoxiaTime: toInt(record.hypoxiaTime),
    hypopnea: toInt(record.hypopnea),
    stepValue: toInt(record.stepValue),
    allPackNumber: toInt(record.allPackNumber),
    currentPackNumber: toInt(record.currentPackNumber),
  };
}

