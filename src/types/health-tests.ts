export type TestState =
  | 'idle'
  | 'start'
  | 'testing'
  | 'not_wear'
  | 'device_busy'
  | 'over'
  | 'error';

export interface HeartRateTestResult {
  state: TestState;
  value?: number;
  progress?: number;
}

export interface BloodPressureTestResult {
  state: TestState;
  systolic?: number;
  diastolic?: number;
  pulse?: number;
  progress?: number;
}

export interface BloodOxygenTestResult {
  state: TestState;
  value?: number;
  rate?: number;
  progress?: number;
}

export interface TemperatureTestResult {
  state: TestState;
  value?: number;
  original_temp?: number;
  progress?: number;
  enable?: boolean;
}

export interface BloodGlucoseTestResult {
  state: TestState;
  glucose?: number;
  progress?: number;
  level?: string | number;
  is_end?: boolean;
}

/** Realtime HRV manual test (Android: manual-data read path). */
export interface HrvTestResult {
  state: TestState | string;
  /** HRV score or ms depending on Band firmware */
  value?: number;
  progress?: number;
  raw_state?: string;
}

/** Options for {@link VeepooSDKModuleInterface.startEcgTest}. */
export interface EcgTestOptions {
  /** When true, native may attach waveform samples to `ecgTestResult` events (Band + platform dependent). */
  include_waveform?: boolean;
}

/** Realtime ECG manual test. Waveform samples only when opted in on native side. */
export interface EcgTestResult {
  state: TestState | string;
  progress?: number;
  heart_rate?: number;
  hrv?: number;
  raw_state?: string;
  /** Present when `startEcgTest({ include_waveform: true })` and Band supports it */
  waveform?: number[];
}

/** Fatigue manual test — vendor fatigue level often 1–4. */
export interface FatigueTestResult {
  state: TestState | string;
  progress?: number;
  /** 1–4: none / mild / moderate / severe (vendor convention) */
  level?: number;
  raw_state?: string;
}

/** Breathing rate manual test (breaths per minute style value). */
export interface BreathingTestResult {
  state: TestState | string;
  progress?: number;
  rate?: number;
  raw_state?: string;
}

/** Normalized body-composition metrics (manual test). Vendor strings scaled per firmware; values are best-effort doubles. */
export interface BodyCompositionMetrics {
  date?: string;
  test_time?: string;
  is_device_test?: boolean;
  stature_cm?: number;
  weight_kg?: number;
  /** Vendor: 0 female, 1 male */
  gender?: number;
  bmi?: number;
  body_fat_percentage?: number;
  fat_mass_kg?: number;
  lean_body_mass_kg?: number;
  muscle_rate?: number;
  muscle_mass_kg?: number;
  subcutaneous_fat_percentage?: number;
  body_water_percentage?: number;
  water_mass_kg?: number;
  skeletal_muscle_rate?: number;
  bone_mass_kg?: number;
  protein_percentage?: number;
  protein_mass_kg?: number;
  basal_metabolic_rate_kcal?: number;
  measurement_duration_seconds?: number;
  /** Android: 1 device test, 2 app test */
  source_id_type?: number;
  measurement_time?: { year?: number; month?: number; day?: number; hour?: number; minute?: number };
}

export interface BodyCompositionTestResult {
  state: TestState | string;
  progress?: number;
  /** iOS progress callback: 0 lead OK, 1 lead off */
  lead?: number;
  raw_state?: number | string;
  is_end?: boolean;
  composition?: BodyCompositionMetrics;
}

/** Blood lipid panel + uric acid from the blood analysis (blood component) test. */
export interface BloodAnalysisValues {
  /** Uric acid μmol/L (1 decimal place) */
  uric_acid: number;
  /** Total cholesterol mmol/L (2 decimal places) */
  total_cholesterol: number;
  /** Triglyceride mmol/L (2 decimal places) */
  triglyceride: number;
  /** HDL cholesterol mmol/L (2 decimal places) */
  high_density_lipoprotein: number;
  /** LDL cholesterol mmol/L (2 decimal places) */
  low_density_lipoprotein: number;
}

export interface BloodAnalysisTestResult {
  state: TestState | string;
  progress: number;
  values: BloodAnalysisValues | null;
}

/** GSR (Galvanic Skin Response) test result. Android only — iOS stubs CAPABILITY_UNSUPPORTED. */
export interface GsrTestResult {
  state: TestState | string;
  progress: number;
  /** Emotion level 0–10 */
  emotion_level: number | null;
  /** Skin moisture percentage 0–100 */
  skin_moisture: number | null;
  /** Sympathetic nervous system activation 0–100 */
  sns_activation: number | null;
  /** Raw cortisol value from device */
  cortisol_value: number | null;
}

export type PttState = 'active' | 'inactive';

/** PTT (Pulse Transit Time) electrode test result. iOS only — Android stubs CAPABILITY_UNSUPPORTED. */
export interface PttTestResult {
  heart_rate: number;
  hrv: number;
  qt_interval: number;
  /** Signal quality: 100 = normal, 0 = lead fail or device busy */
  signal_quality: number;
  progress: number;
}

export const RealtimeTest = {
  HEART_RATE: 'heart_rate',
  BLOOD_PRESSURE: 'blood_pressure',
  BLOOD_OXYGEN: 'blood_oxygen',
  TEMPERATURE: 'temperature',
  STRESS: 'stress',
  BLOOD_GLUCOSE: 'blood_glucose',
  HRV: 'hrv',
  FATIGUE: 'fatigue',
  BREATHING: 'breathing',
  BODY_COMPOSITION: 'body_composition',
} as const;

export type RealtimeTestModality = typeof RealtimeTest[keyof typeof RealtimeTest];

export type ReadState = 'idle' | 'start' | 'reading' | 'complete' | 'invalid';

export interface ReadOriginProgress {
  read_state: ReadState;
  total_days: number;
  current_day: number;
  progress: number;
}
