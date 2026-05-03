export type TestState =
  | 'idle'
  | 'start'
  | 'testing'
  | 'notWear'
  | 'deviceBusy'
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
  originalTemp?: number;
  progress?: number;
  enable?: boolean;
}

export interface BloodGlucoseTestResult {
  state: TestState;
  glucose?: number;
  progress?: number;
  level?: string | number;
  isEnd?: boolean;
}

/** Realtime HRV manual test (Android: manual-data read path). */
export interface HrvTestResult {
  state: TestState | string;
  /** HRV score or ms depending on Band firmware */
  value?: number;
  progress?: number;
  rawState?: string;
}

/** Options for {@link VeepooSDKModuleInterface.startEcgTest}. */
export interface EcgTestOptions {
  /** When true, native may attach waveform samples to `ecgTestResult` events (Band + platform dependent). */
  includeWaveform?: boolean;
}

/** Realtime ECG manual test. Waveform samples only when opted in on native side. */
export interface EcgTestResult {
  state: TestState | string;
  progress?: number;
  heartRate?: number;
  hrv?: number;
  rawState?: string;
  /** Present when `startEcgTest({ includeWaveform: true })` and Band supports it */
  waveform?: number[];
}

/** Fatigue manual test — vendor fatigue level often 1–4. */
export interface FatigueTestResult {
  state: TestState | string;
  progress?: number;
  /** 1–4: none / mild / moderate / severe (vendor convention) */
  level?: number;
  rawState?: string;
}

/** Breathing rate manual test (breaths per minute style value). */
export interface BreathingTestResult {
  state: TestState | string;
  progress?: number;
  rate?: number;
  rawState?: string;
}

/** Normalized body-composition metrics (manual test). Vendor strings scaled per firmware; values are best-effort doubles. */
export interface BodyCompositionMetrics {
  date?: string;
  testTime?: string;
  isDeviceTest?: boolean;
  statureCm?: number;
  weightKg?: number;
  /** Vendor: 0 female, 1 male */
  gender?: number;
  bmi?: number;
  bodyFatPercentage?: number;
  fatMassKg?: number;
  leanBodyMassKg?: number;
  muscleRate?: number;
  muscleMassKg?: number;
  subcutaneousFatPercentage?: number;
  bodyWaterPercentage?: number;
  waterMassKg?: number;
  skeletalMuscleRate?: number;
  boneMassKg?: number;
  proteinPercentage?: number;
  proteinMassKg?: number;
  basalMetabolicRateKcal?: number;
  measurementDurationSeconds?: number;
  /** Android: 1 device test, 2 app test */
  sourceIdType?: number;
  measurementTime?: { year?: number; month?: number; day?: number; hour?: number; minute?: number };
}

export interface BodyCompositionTestResult {
  state: TestState | string;
  progress?: number;
  /** iOS progress callback: 0 lead OK, 1 lead off */
  lead?: number;
  rawState?: number | string;
  isEnd?: boolean;
  composition?: BodyCompositionMetrics;
}

/** Blood lipid panel + uric acid from the blood analysis (blood component) test. */
export interface BloodAnalysisValues {
  /** Uric acid μmol/L (1 decimal place) */
  uricAcid: number;
  /** Total cholesterol mmol/L (2 decimal places) */
  totalCholesterol: number;
  /** Triglyceride mmol/L (2 decimal places) */
  triglyceride: number;
  /** HDL cholesterol mmol/L (2 decimal places) */
  highDensityLipoprotein: number;
  /** LDL cholesterol mmol/L (2 decimal places) */
  lowDensityLipoprotein: number;
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
  emotionLevel: number | null;
  /** Skin moisture percentage 0–100 */
  skinMoisture: number | null;
  /** Sympathetic nervous system activation 0–100 */
  snsActivation: number | null;
  /** Raw cortisol value from device */
  cortisolValue: number | null;
}

export type PttState = 'active' | 'inactive';

/** PTT (Pulse Transit Time) electrode test result. iOS only — Android stubs CAPABILITY_UNSUPPORTED. */
export interface PttTestResult {
  heartRate: number;
  hrv: number;
  qtInterval: number;
  /** Signal quality: 100 = normal, 0 = lead fail or device busy */
  signalQuality: number;
  progress: number;
}

export type ReadState = 'idle' | 'start' | 'reading' | 'complete' | 'invalid';

export interface ReadOriginProgress {
  readState: ReadState;
  totalDays: number;
  currentDay: number;
  progress: number;
}
