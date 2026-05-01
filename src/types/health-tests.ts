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

export type ReadState = 'idle' | 'start' | 'reading' | 'complete' | 'invalid';

export interface ReadOriginProgress {
  readState: ReadState;
  totalDays: number;
  currentDay: number;
  progress: number;
}
