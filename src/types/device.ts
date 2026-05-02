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

/** Sedentary / long-sit reminder window and threshold. Vendor `LongSeatSetting` / `VPDeviceLongSeatModel`. */
export interface SedentaryReminderSettings {
  startHour: number;
  startMinute: number;
  endHour: number;
  endMinute: number;
  /** Minutes still before the Band reminds (vendor gate; typically 30–240). */
  thresholdMinutes: number;
  enabled: boolean;
}

/** Dial / watch-face category from vendor screen-style APIs (`EUIFromType` / `VPDeviceDialType`). */
export type WatchFaceDialType = 'default' | 'market' | 'photo';

/** Current watch face selection from the Band (read). */
export interface WatchFaceStyle {
  dialType: WatchFaceDialType;
  /** Style slot index (vendor-specific). */
  screenIndex: number;
  /** Native read includes this flag; omitted after normalization if unknown. */
  operationSuccess?: boolean;
}

/** Arguments for `setWatchFaceStyle`. */
export interface WatchFaceStyleSettings {
  screenIndex: number;
  dialType?: WatchFaceDialType;
}

/** Raise-to-wake / wrist-flip screen. Vendor `NightTurnWristSetting` / `VPDeviceRaiseHandModel`. */
export interface WristFlipWakeSettings {
  enabled: boolean;
  startHour: number;
  startMinute: number;
  endHour: number;
  endMinute: number;
  /** Sensitivity 1–10 (`level` / `sensitive`); 0 on read may mean not supported. */
  sensitivityLevel: number;
  /** Android read: `isSupportCustomSettingTime`. */
  supportsCustomTimeWindow?: boolean;
  /** Vendor default sensitivity when non-zero. */
  defaultSensitivityLevel?: number;
}

/** Vendor `EWomenStatus` / `VPDeviceFemaleState` (physiology mode, not user sex). */
export type WomenHealthStatus =
  | 'none'
  | 'menstrual'
  | 'pregnancy_prep'
  | 'pregnancy'
  | 'postpartum';

export type WomenHealthBabySex = 'female' | 'male';

/** Women's health / cycle settings. Android `WomenSetting` / `WomenData`; iOS `VPDeviceFemaleModel`. */
export interface WomenHealthSettings {
  status: WomenHealthStatus;
  /** Menstrual length in days (vendor range typically 4–28). */
  menstrualLengthDays?: number;
  menstrualCycleDays?: number;
  /** Calendar date `yyyy-MM-dd`. */
  lastMenstrualDate?: string;
  expectedDeliveryDate?: string;
  babyBirthday?: string;
  babySex?: WomenHealthBabySex;
  /** Some Bands report current-cycle day count on read. */
  currentMenstrualDays?: number;
  /** Android-only: `EWomenOprateStatus` name when present. */
  operationStatus?: string;
}

/** Weather temperature unit. Vendor `EWeatherType` / `VPWeatherConfigModel.weatherUnit`. */
export type WeatherUnit = 'C' | 'F';

/** Weather switch + unit state. Android `WeatherStatusData`; iOS `VPWeatherConfigModel`. */
export interface WeatherSettings {
  isOpen: boolean;
  unit: WeatherUnit;
  /** CRC of current weather on device; pass back when pushing data to skip no-op updates. */
  crc: number;
}

/** 3-hour forecast entry. Android `WeatherEvery3Hour`; iOS `VPWeatherServerHourlyModel`. */
export interface WeatherHourlyForecast {
  /** ISO datetime "YYYY-MM-DD HH:mm" */
  time: string;
  tempC: number;
  tempF: number;
  /** Weather state code 0–155 (sunny→cloudy→rain→snow). See vendor docs for ranges. */
  weatherState: number;
  uvIndex: number;
  /** Wind level e.g. "3" or "3-5". */
  windLevel: string;
  /** Visibility in metres. */
  visibilityM: number;
}

/** Daily forecast entry. Android `WeatherEveryDay`; iOS `VPWeatherServerForecastModel`. */
export interface WeatherDailyForecast {
  /** ISO date "YYYY-MM-DD" */
  date: string;
  maxTempC: number;
  minTempC: number;
  maxTempF: number;
  minTempF: number;
  weatherStateDay: number;
  weatherStateNight: number;
  uvIndex?: number;
  windLevel?: string;
  visibilityM?: number;
}

/** Full weather payload to push to the Band. Android `WeatherData`; iOS `VPWeatherServerModel`. */
export interface WeatherData {
  cityName: string;
  /** CRC uniqueness key — Band skips write when CRC matches stored value. */
  crc: number;
  latitude?: number;
  longitude?: number;
  hourly: WeatherHourlyForecast[];
  daily: WeatherDailyForecast[];
}

export interface DeviceData {
  deviceId: string;
  data: unknown;
}

/** A contact entry stored on the Band. Android `Contact`; iOS `VPDeviceContactsModel`. */
export interface DeviceContact {
  contactID: number;
  /** Display name — vendor limit: 20 bytes UTF-8. */
  name: string;
  phoneNumber: string;
  /** Whether this contact is marked as an SOS (emergency) contact. */
  isSOS: boolean;
  /** Whether the Band supports designating this contact as SOS. Android-only; may be absent on iOS. */
  isSupportSOS?: boolean;
}

/** Payload for `addContact` — the Band assigns the `contactID`. */
export interface NewDeviceContact {
  name: string;
  phoneNumber: string;
  /** Mark as SOS on add; defaults to false. */
  isSOS?: boolean;
}

/** SOS call-attempt count from the Band. Vendor enforces `times` stays within `[minTimes, maxTimes]`. */
export interface SosCallTimesSettings {
  times: number;
  minTimes: number;
  maxTimes: number;
}
