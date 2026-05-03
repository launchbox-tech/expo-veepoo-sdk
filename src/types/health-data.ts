import type { TestState } from './health-tests.js';
import type { SportMode } from './settings.js';

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

/** Sleep state for a single minute point in the detailed sleep curve. */
export type SleepMinuteState = 'deep' | 'light' | 'rem' | 'insomnia' | 'awake';

export interface SleepMinutePoint {
  /** 0-based minute index from sleep start. */
  index: number;
  state: SleepMinuteState;
}

/** Detailed sleep session from the accurate-sleep read path. */
export interface AccurateSleepSession {
  /** Timestamp string "YYYY-MM-DD HH:MM:SS" */
  sleepTime: string;
  wakeTime: string;
  /** Deep sleep duration in minutes */
  deepDuration: number;
  /** Light sleep duration in minutes */
  lightDuration: number;
  /** REM duration in minutes (otherDuration on Android) */
  remDuration: number;
  /** Wake/getUp duration in minutes */
  getUpDuration: number;
  /** Total sleep duration in minutes */
  sleepDuration: number;
  /** Number of wake-ups */
  getUpTimes: number;
  /** Sleep quality 0–4 (0=worst, 4=best) */
  sleepQuality: number;
  /** Insomnia score */
  insomniaScore: number;
  /** Number of insomnia events */
  insomniaTimes: number;
  /** Fall-asleep efficiency score */
  fallAsleepScore: number;
  /** Sleep efficiency score */
  sleepEfficiencyScore: number;
  /** Per-minute sleep state curve */
  curve: SleepMinutePoint[];
}

export interface ExerciseMinuteData {
  heartRate: number;
  distance: number;
  calories: number;
  steps: number;
  sportValue: number;
  isPaused: boolean;
}

export interface StoredTemperatureData {
  /** "YYYY-MM-DD HH:MM" */
  timestamp: string;
  /** Body temperature °C */
  temperature: number;
  /** Skin/surface temperature °C */
  bodyTemperature?: number;
}

export interface StoredBloodGlucoseData {
  /** "YYYY-MM-DD HH:MM" */
  timestamp: string;
  bloodGlucose: number;
  /** Risk level: "low" | "normal" | "high" */
  level?: string;
}

export interface StoredHrvData {
  /** "YYYY-MM-DD HH:MM" */
  timestamp: string;
  hrv: number;
  /** RR interval values (each × 10 = milliseconds) */
  rrIntervals: number[];
}

export interface StoredEcgData {
  /** "YYYY-MM-DD HH:MM:SS" */
  timestamp: string;
  /** Duration in seconds */
  duration: number;
  aveHeart: number;
  aveHrv: number;
  aveResRate: number;
  aveQT?: number;
  filterSignals: number[];
}

export interface StoredBodyCompositionData {
  /** "YYYY-MM-DD HH:MM:SS" */
  timestamp: string;
  bmi: number;
  bodyFatPercentage: number;
  fatMass: number;
  leanBodyMass: number;
  muscleRate: number;
  muscleMass: number;
  subcutaneousFat: number;
  bodyMoisture: number;
  waterContent: number;
  skeletalMuscleRate: number;
  boneMass: number;
  proportionOfProtein: number;
  proteinAmount: number;
  basalMetabolicRate: number;
}

export interface ExerciseSession {
  /** Sport mode — null if ordinal is out of range or unknown. */
  type: SportMode | null;
  /** ISO-like timestamp string "YYYY-MM-DD HH:MM:SS" */
  beginTime: string;
  endTime: string;
  totalSteps: number;
  totalDistance: number;
  totalCalories: number;
  /** Total active time in seconds */
  totalTime: number;
  averageHeartRate: number;
  /** Average pace in seconds per km */
  averagePace: number;
  pauseCount: number;
  /** Total paused time in seconds */
  pauseTotalTime: number;
  minuteData: ExerciseMinuteData[];
}

