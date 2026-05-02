export type FunctionStatus = 'unsupported' | 'support' | 'open' | 'close' | 'unknown';

export interface DeviceFunctionPackage1 {
  bloodPressure?: FunctionStatus;
  drinking?: FunctionStatus;
  sedentaryRemind?: FunctionStatus;
  heartRateWarning?: FunctionStatus;
  weChatSport?: FunctionStatus;
  camera?: FunctionStatus;
  fatigue?: FunctionStatus;
  spoH?: FunctionStatus;
  spo2HAdjustment?: FunctionStatus;
  spoHBreathBreak?: FunctionStatus;
  woman?: FunctionStatus;
  alarm?: FunctionStatus;
  newCalcSport?: FunctionStatus;
  ambulatoryBPAdjustment?: FunctionStatus;
  screenLight?: FunctionStatus;
  heartRateDetect?: FunctionStatus;
  nightTurnSetting?: FunctionStatus;
  textAlarm?: FunctionStatus;
  temperatureFunction?: FunctionStatus;
}

export interface DeviceFunctionPackage2 {
  countDown?: FunctionStatus;
  sportModelFunction?: FunctionStatus;
  hidFunction?: FunctionStatus;
  screenStyleFunction?: FunctionStatus;
  breathFunction?: FunctionStatus;
  hrvFunction?: FunctionStatus;
  weatherFunction?: FunctionStatus;
  screenLightTime?: FunctionStatus;
  precisionSleep?: FunctionStatus;
  ecgFunction?: FunctionStatus;
  multSportMode?: FunctionStatus;
  lowPower?: FunctionStatus;
  sleepTag?: number;
  watchDataDayNumber?: number;
  contactMsgLength?: number;
  allMsgLength?: number;
  sportModelDay?: number;
  screenstyle?: number;
  weatherStyle?: number;
  originProtocolVersion?: number;
  ecgType?: number;
}

export interface DeviceFunctionPackage3 {
  bigDataTranType?: number;
  watchUiServerCount?: number;
  watchUiCustomCount?: number;
  temperatureFunction?: FunctionStatus;
  temperatureType?: number;
  cpuType?: number;
  stressFunction?: FunctionStatus;
  stressType?: number;
  contactFunction?: FunctionStatus;
  contactType?: number;
  musicStyle?: number;
  findDeviceByPhoneFunction?: FunctionStatus;
  agpsFunction?: FunctionStatus;
  bloodGlucoseTag?: number;
  bloodGlucose?: number;
  bloodGlucoseAdjusting?: FunctionStatus;
  bloodGlucoseMultipleAdjusting?: FunctionStatus;
  bloodGlucoseRiskAssessment?: FunctionStatus;
  bloodComponent?: FunctionStatus;
  bodyComponent?: FunctionStatus;
}

export interface DeviceFunctionPackage4 {
  bloodComponent?: FunctionStatus;
  bloodComponentSingleCalibration?: FunctionStatus;
  bodyComponent?: FunctionStatus;
  worldClock?: FunctionStatus;
  autoMeasure?: FunctionStatus;
  temperatureAlarm?: FunctionStatus;
  wallet?: FunctionStatus;
  postcard?: FunctionStatus;
  gameSetting?: FunctionStatus;
  aiQA?: FunctionStatus;
  aiDial?: FunctionStatus;
  distanceCalorieGoal?: FunctionStatus;
  videoDial?: FunctionStatus;
  photoAlbum?: FunctionStatus;
  miniCheckup?: FunctionStatus;
}

export interface DeviceFunctionPackage5 {
  textImagePush: FunctionStatus;
}

export interface DeviceFunctions {
  package1?: DeviceFunctionPackage1;
  package2?: DeviceFunctionPackage2;
  package3?: DeviceFunctionPackage3;
  package4?: DeviceFunctionPackage4;
  package5?: DeviceFunctionPackage5;
}

export interface DeviceVersion {
  hardwareVersion: string;
  firmwareVersion: string;
  softwareVersion: string;
  deviceNumber: string;
  newVersion: string;
  description: string;
}

export type ChargeState = 'normal' | 'charging' | 'lowPressure' | 'full';

export interface BatteryInfo {
  level: number;
  percent: number;
  powerModel: number;
  state: number;
  bat: number;
  isPercent: boolean;
  isLowBattery: boolean;
  chargeState?: ChargeState;
}

export type Sex = 0 | 1;

export interface PersonalInfo {
  sex: Sex;
  height: number;
  weight: number;
  age: number;
  stepAim: number;
  sleepAim: number;
}

export interface SocialMsgData {
  phone: FunctionStatus;
  sms: FunctionStatus;
  wechat: FunctionStatus;
  qq: FunctionStatus;
  facebook: FunctionStatus;
  twitter: FunctionStatus;
  instagram: FunctionStatus;
  linkedin: FunctionStatus;
  whatsapp: FunctionStatus;
  line: FunctionStatus;
  skype: FunctionStatus;
  email: FunctionStatus;
  other: FunctionStatus;
}

export interface CustomSettingData {
  [key: string]: string | number | boolean;
}

export interface DeviceAlarm {
  id: number;
  enabled: boolean;
  hour: number;
  minute: number;
  repeat: number[];
  scene?: number;
  type?: 'normal' | 'text';
  text?: string;
}

export interface HeartRateAlarm {
  enabled: boolean;
  highThreshold: number;
  lowThreshold: number;
}

/** Phone → Band find / anti-loss (vibrate, screen on). Emitted on `findDeviceState`. */
export type FindDevicePhase =
  | 'unsupported'
  | 'searching'
  | 'found'
  | 'timeout'
  | 'stopped';

/** Screen brightness schedule (night window + day levels). Vendor `ScreenSetting` / `VPDeviceBrightModel`. */
export interface ScreenLightSettings {
  nightStartHour: number;
  nightStartMinute: number;
  nightEndHour: number;
  nightEndMinute: number;
  nightLevel: number;
  dayLevel: number;
  autoAdjust: boolean;
  maxLevel: number;
  /** iOS: last manual day brightness gear */
  lastManualDayLevel?: number;
}

/** Bright screen duration (seconds). */
export interface ScreenLightDuration {
  currentSeconds: number;
  minSeconds: number;
  maxSeconds: number;
  recommendSeconds?: number;
}

export interface DeviceData {
  deviceId: string;
  data: unknown;
}
