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

export type ReadState = 'idle' | 'start' | 'reading' | 'complete' | 'invalid';

export interface ReadOriginProgress {
  readState: ReadState;
  totalDays: number;
  currentDay: number;
  progress: number;
}
