export interface AutoMeasureSetting {
  protocolType: number;
  funType: number;
  isSwitchOpen: boolean;
  stepUnit: number;
  isSlotModify: boolean;
  isIntervalModify: boolean;
  supportStartMinute: number;
  supportEndMinute: number;
  measureInterval: number;
  currentStartMinute: number;
  currentEndMinute: number;
}

export type Language =
  | 'chinese'
  | 'chineseTraditional'
  | 'english'
  | 'japanese'
  | 'korean'
  | 'german'
  | 'russian'
  | 'spanish'
  | 'italian'
  | 'french'
  | 'vietnamese'
  | 'portuguese'
  | 'thai'
  | 'polish'
  | 'swedish'
  | 'turkish'
  | 'dutch'
  | 'czech'
  | 'arabic'
  | 'hungarian'
  | 'greek'
  | 'romanian'
  | 'slovak'
  | 'indonesian'
  | 'brazilianPortuguese'
  | 'croatian'
  | 'lithuanian'
  | 'ukrainian'
  | 'hindi'
  | 'hebrew'
  | 'danish'
  | 'persian'
  | 'finnish'
  | 'malay';

export type TemperatureUnit = 'celsius' | 'fahrenheit';
export type DistanceUnit = 'metric' | 'imperial';
export type TimeFormat = '12hour' | '24hour';
export type BloodGlucoseUnit = 'mmolL' | 'mgdL';
/** SpO2 apnea alert settings. iOS only — Android rejects with CAPABILITY_UNSUPPORTED. */
export interface ApneaRemindSettings {
  enabled: boolean;
  /** SpO2 threshold (%) below which the apnea alert fires. */
  threshold: number;
}

/** 1 = lightest (closest to white), 6 = darkest. Gate: Android skinType==2, iOS peripheralModel.skinType==2. */
export type SkinTone = 1 | 2 | 3 | 4 | 5 | 6;
export type CustomSettings = {
  temperatureUnit: TemperatureUnit;
  bloodGlucoseUnit: BloodGlucoseUnit;
  skinTone: SkinTone;
};
export type OperationStatus = 'success' | 'fail' | 'unknown';
