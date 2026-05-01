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
export type OperationStatus = 'success' | 'fail' | 'unknown';
