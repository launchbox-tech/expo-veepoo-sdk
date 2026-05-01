import type { TestState } from './health-tests.js';

export interface HeartRateData {
  value: number;
  timestamp: number;
}

export interface BloodPressureData {
  systolic: number;
  diastolic: number;
  pulse: number;
  timestamp: number;
}

export interface BloodOxygenData {
  spo2: number;
  timestamp: number;
}

export interface TemperatureData {
  temperature: number;
  timestamp: number;
  isSurface?: boolean;
  originalTemp?: number;
}

export interface StressData {
  stress: number;
  timestamp: number;
  progress?: number;
  status?: string;
  isEnd?: boolean;
}

export interface BloodGlucoseData {
  glucose?: number;
  progress?: number;
  level?: string | number;
  state?: TestState;
  status?: string;
  timestamp?: number;
  isEnd?: boolean;
  error?: string;
}

export interface SleepDataItem {
  date: string;
  sleepTime: string;
  wakeTime: string;
  deepSleepMinutes: number;
  lightSleepMinutes: number;
  totalSleepMinutes: number;
  sleepQuality: number;
  sleepLine: string;
  wakeUpCount: number;
}

export interface SleepData {
  date: string;
  items: SleepDataItem[];
  summary: {
    totalDeepSleepMinutes: number;
    totalLightSleepMinutes: number;
    totalSleepMinutes: number;
    averageSleepQuality: number;
    totalWakeUpCount: number;
  };
}

export interface DailyHealthData {
  date: string;
  stepCount?: number;
  distance?: number;
  calories?: number;
  heartRate?: number;
  bloodPressure?: BloodPressureData;
  bloodOxygen?: BloodOxygenData;
  temperature?: TemperatureData;
  stress?: StressData;
  bloodGlucose?: BloodGlucoseData;
}

export interface SportStepData {
  date: string;
  stepCount: number;
  distance: number;
  calories: number;
}

export interface DaySummaryData {
  date: string;
  allStep: number;
  sportList: Array<{
    time: string;
    step: number;
    cal: number;
    dis: number;
  }>;
  rateList: Array<{
    time: string;
    rate: number;
  }>;
  bpList: Array<{
    time: string;
    high: number;
    low: number;
  }>;
}

export interface OriginData {
  time: string;
  heartValue: number;
  stepValue: number;
  calValue: number;
  disValue: number;
  sportValue: number;
  systolic: number;
  diastolic: number;
  spo2Value: number;
  tempValue: number;
  stressValue: number;
  met: number;
  oxygens?: number[];
  ppgs?: number[];
  ecgs?: number[];
  resRates?: number[];
  sleepStates?: number[];
  apneaResults?: number[];
  hypoxiaTimes?: number[];
  cardiacLoads?: number[];
  bloodGlucose?: number;
}

export interface HalfHourData {
  time: string;
  heartValue?: number;
  sportValue?: number;
  stepValue?: number;
  calValue?: number;
  disValue?: number;
  diastolic?: number;
  systolic?: number;
  spo2Value?: number;
  tempValue?: number;
  stressValue?: number;
  met?: number;
}

export interface Spo2OriginData {
  time: string;
  date: string;
  heartValue: number;
  value: number;
  rate: number;
  isHypoxia: number;
  cardiacLoad: number;
  temp1: number;
  sportValue: number;
  apneaResult: number;
  hypoxiaTime: number;
  hypopnea: number;
  stepValue: number;
  allPackNumber: number;
  currentPackNumber: number;
}
