import type { TestState } from './health-tests';
import type { SportMode } from './settings';

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
  is_surface?: boolean;
  original_temp?: number;
}

export interface StressData {
  stress: number;
  timestamp: number;
  progress?: number;
  status?: string;
  is_end?: boolean;
}

export interface BloodGlucoseData {
  glucose?: number;
  progress?: number;
  level?: string | number;
  state?: TestState;
  status?: string;
  timestamp?: number;
  is_end?: boolean;
  error?: string;
}

export interface SleepDataItem {
  date: string;
  sleep_time: string;
  wake_time: string;
  deep_sleep_minutes: number;
  light_sleep_minutes: number;
  total_sleep_minutes: number;
  sleep_quality: number;
  sleep_line: string;
  wake_up_count: number;
}

export interface SleepData {
  date: string;
  items: SleepDataItem[];
  summary: {
    total_deep_sleep_minutes: number;
    total_light_sleep_minutes: number;
    total_sleep_minutes: number;
    average_sleep_quality: number;
    total_wake_up_count: number;
  };
}

export interface DailyHealthData {
  date: string;
  step_count?: number;
  distance?: number;
  calories?: number;
  heart_rate?: number;
  blood_pressure?: BloodPressureData;
  blood_oxygen?: BloodOxygenData;
  temperature?: TemperatureData;
  stress?: StressData;
  blood_glucose?: BloodGlucoseData;
}

export interface SportStepData {
  date: string;
  step_count: number;
  distance: number;
  calories: number;
}

export interface DaySummaryData {
  date: string;
  all_step: number;
  sport_list: Array<{
    time: string;
    step: number;
    cal: number;
    dis: number;
  }>;
  rate_list: Array<{
    time: string;
    rate: number;
  }>;
  bp_list: Array<{
    time: string;
    high: number;
    low: number;
  }>;
}

export interface OriginData {
  time: string;
  heart_value: number;
  step_value: number;
  cal_value: number;
  dis_value: number;
  sport_value: number;
  systolic: number;
  diastolic: number;
  spo2_value: number;
  temp_value: number;
  stress_value: number;
  met: number;
  oxygens?: number[];
  ppgs?: number[];
  ecgs?: number[];
  res_rates?: number[];
  sleep_states?: number[];
  apnea_results?: number[];
  hypoxia_times?: number[];
  cardiac_loads?: number[];
  blood_glucose?: number;
}

export interface HalfHourData {
  time: string;
  heart_value?: number;
  sport_value?: number;
  step_value?: number;
  cal_value?: number;
  dis_value?: number;
  diastolic?: number;
  systolic?: number;
  spo2_value?: number;
  temp_value?: number;
  stress_value?: number;
  met?: number;
}

export interface Spo2OriginData {
  time: string;
  date: string;
  heart_value: number;
  value: number;
  rate: number;
  is_hypoxia: number;
  cardiac_load: number;
  temp1: number;
  sport_value: number;
  apnea_result: number;
  hypoxia_time: number;
  hypopnea: number;
  step_value: number;
  all_pack_number: number;
  current_pack_number: number;
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
  sleep_time: string;
  wake_time: string;
  /** Deep sleep duration in minutes */
  deep_duration: number;
  /** Light sleep duration in minutes */
  light_duration: number;
  /** REM duration in minutes (otherDuration on Android) */
  rem_duration: number;
  /** Wake/getUp duration in minutes */
  get_up_duration: number;
  /** Total sleep duration in minutes */
  sleep_duration: number;
  /** Number of wake-ups */
  get_up_times: number;
  /** Sleep quality 0–4 (0=worst, 4=best) */
  sleep_quality: number;
  /** Insomnia score */
  insomnia_score: number;
  /** Number of insomnia events */
  insomnia_times: number;
  /** Fall-asleep efficiency score */
  fall_asleep_score: number;
  /** Sleep efficiency score */
  sleep_efficiency_score: number;
  /** Per-minute sleep state curve */
  curve: SleepMinutePoint[];
}

export interface ExerciseMinuteData {
  heart_rate: number;
  distance: number;
  calories: number;
  steps: number;
  sport_value: number;
  is_paused: boolean;
}

export interface StoredTemperatureData {
  /** "YYYY-MM-DD HH:MM" */
  timestamp: string;
  /** Body temperature °C */
  temperature: number;
  /** Skin/surface temperature °C */
  body_temperature?: number;
}

export interface StoredBloodGlucoseData {
  /** "YYYY-MM-DD HH:MM" */
  timestamp: string;
  blood_glucose: number;
  /** Risk level: "low" | "normal" | "high" */
  level?: string;
}

export interface StoredHrvData {
  /** "YYYY-MM-DD HH:MM" */
  timestamp: string;
  hrv: number;
  /** RR interval values (each × 10 = milliseconds) */
  rr_intervals: number[];
}

export interface StoredEcgData {
  /** "YYYY-MM-DD HH:MM:SS" */
  timestamp: string;
  /** Duration in seconds */
  duration: number;
  ave_heart: number;
  ave_hrv: number;
  ave_res_rate: number;
  ave_qt?: number;
  filter_signals: number[];
}

export interface StoredBodyCompositionData {
  /** "YYYY-MM-DD HH:MM:SS" */
  timestamp: string;
  bmi: number;
  body_fat_percentage: number;
  fat_mass: number;
  lean_body_mass: number;
  muscle_rate: number;
  muscle_mass: number;
  subcutaneous_fat: number;
  body_moisture: number;
  water_content: number;
  skeletal_muscle_rate: number;
  bone_mass: number;
  proportion_of_protein: number;
  protein_amount: number;
  basal_metabolic_rate: number;
}

export interface ExerciseSession {
  /** Sport mode — null if ordinal is out of range or unknown. */
  type: SportMode | null;
  /** ISO-like timestamp string "YYYY-MM-DD HH:MM:SS" */
  begin_time: string;
  end_time: string;
  total_steps: number;
  total_distance: number;
  total_calories: number;
  /** Total active time in seconds */
  total_time: number;
  average_heart_rate: number;
  /** Average pace in seconds per km */
  average_pace: number;
  pause_count: number;
  /** Total paused time in seconds */
  pause_total_time: number;
  minute_data: ExerciseMinuteData[];
}
