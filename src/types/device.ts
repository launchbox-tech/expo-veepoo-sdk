export type FunctionStatus = 'unsupported' | 'support' | 'open' | 'close' | 'unknown';

export interface DeviceFunctionPackage1 {
  blood_pressure?: FunctionStatus;
  drinking?: FunctionStatus;
  sedentary_remind?: FunctionStatus;
  heart_rate_warning?: FunctionStatus;
  we_chat_sport?: FunctionStatus;
  camera?: FunctionStatus;
  fatigue?: FunctionStatus;
  spo_h?: FunctionStatus;
  spo2_h_adjustment?: FunctionStatus;
  spo_h_breath_break?: FunctionStatus;
  woman?: FunctionStatus;
  alarm?: FunctionStatus;
  new_calc_sport?: FunctionStatus;
  ambulatory_bp_adjustment?: FunctionStatus;
  screen_light?: FunctionStatus;
  heart_rate_detect?: FunctionStatus;
  night_turn_setting?: FunctionStatus;
  text_alarm?: FunctionStatus;
  temperature_function?: FunctionStatus;
}

export interface DeviceFunctionPackage2 {
  count_down?: FunctionStatus;
  sport_model_function?: FunctionStatus;
  hid_function?: FunctionStatus;
  screen_style_function?: FunctionStatus;
  breath_function?: FunctionStatus;
  hrv_function?: FunctionStatus;
  weather_function?: FunctionStatus;
  screen_light_time?: FunctionStatus;
  precision_sleep?: FunctionStatus;
  ecg_function?: FunctionStatus;
  mult_sport_mode?: FunctionStatus;
  low_power?: FunctionStatus;
  sleep_tag?: number;
  watch_data_day_number?: number;
  contact_msg_length?: number;
  all_msg_length?: number;
  sport_model_day?: number;
  screenstyle?: number;
  weather_style?: number;
  origin_protocol_version?: number;
  ecg_type?: number;
}

export interface DeviceFunctionPackage3 {
  big_data_tran_type?: number;
  watch_ui_server_count?: number;
  watch_ui_custom_count?: number;
  temperature_function?: FunctionStatus;
  temperature_type?: number;
  cpu_type?: number;
  stress_function?: FunctionStatus;
  stress_type?: number;
  contact_function?: FunctionStatus;
  contact_type?: number;
  music_style?: number;
  find_device_by_phone_function?: FunctionStatus;
  agps_function?: FunctionStatus;
  blood_glucose_tag?: number;
  blood_glucose?: number;
  blood_glucose_adjusting?: FunctionStatus;
  blood_glucose_multiple_adjusting?: FunctionStatus;
  blood_glucose_risk_assessment?: FunctionStatus;
  blood_component?: FunctionStatus;
  body_component?: FunctionStatus;
}

export interface DeviceFunctionPackage4 {
  blood_component?: FunctionStatus;
  blood_component_single_calibration?: FunctionStatus;
  body_component?: FunctionStatus;
  world_clock?: FunctionStatus;
  auto_measure?: FunctionStatus;
  temperature_alarm?: FunctionStatus;
  wallet?: FunctionStatus;
  postcard?: FunctionStatus;
  game_setting?: FunctionStatus;
  ai_qa?: FunctionStatus;
  ai_dial?: FunctionStatus;
  distance_calorie_goal?: FunctionStatus;
  video_dial?: FunctionStatus;
  photo_album?: FunctionStatus;
  mini_checkup?: FunctionStatus;
}

export interface DeviceFunctionPackage5 {
  text_image_push: FunctionStatus;
}

export interface DeviceFunctions {
  package1?: DeviceFunctionPackage1;
  package2?: DeviceFunctionPackage2;
  package3?: DeviceFunctionPackage3;
  package4?: DeviceFunctionPackage4;
  package5?: DeviceFunctionPackage5;
}

export interface DeviceVersion {
  hardware_version: string;
  firmware_version: string;
  software_version: string;
  device_number: string;
  new_version: string;
  description: string;
}

export type ChargeState = 'normal' | 'charging' | 'low_pressure' | 'full';

export interface BatteryInfo {
  level: number;
  percent: number;
  power_model: number;
  state: number;
  bat: number;
  is_percent: boolean;
  is_low_battery: boolean;
  charge_state?: ChargeState;
}

export type Sex = 0 | 1;

export interface PersonalInfo {
  sex: Sex;
  height: number;
  weight: number;
  age: number;
  step_aim: number;
  sleep_aim: number;
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
  high_threshold: number;
  low_threshold: number;
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
  night_start_hour: number;
  night_start_minute: number;
  night_end_hour: number;
  night_end_minute: number;
  night_level: number;
  day_level: number;
  auto_adjust: boolean;
  max_level: number;
  /** iOS: last manual day brightness gear */
  last_manual_day_level?: number;
}

/** Bright screen duration (seconds). */
export interface ScreenLightDuration {
  current_seconds: number;
  min_seconds: number;
  max_seconds: number;
  recommend_seconds?: number;
}

/** Sedentary / long-sit reminder window and threshold. Vendor `LongSeatSetting` / `VPDeviceLongSeatModel`. */
export interface SedentaryReminderSettings {
  start_hour: number;
  start_minute: number;
  end_hour: number;
  end_minute: number;
  /** Minutes still before the Band reminds (vendor gate; typically 30–240). */
  threshold_minutes: number;
  enabled: boolean;
}

/** Dial / watch-face category from vendor screen-style APIs (`EUIFromType` / `VPDeviceDialType`). */
export type WatchFaceDialType = 'default' | 'market' | 'photo';

/** Current watch face selection from the Band (read). */
export interface WatchFaceStyle {
  dial_type: WatchFaceDialType;
  /** Style slot index (vendor-specific). */
  screen_index: number;
  /** Native read includes this flag; omitted after normalization if unknown. */
  operation_success?: boolean;
}

/** Arguments for `setWatchFaceStyle`. */
export interface WatchFaceStyleSettings {
  screen_index: number;
  dial_type?: WatchFaceDialType;
}

/** Raise-to-wake / wrist-flip screen. Vendor `NightTurnWristSetting` / `VPDeviceRaiseHandModel`. */
export interface WristFlipWakeSettings {
  enabled: boolean;
  start_hour: number;
  start_minute: number;
  end_hour: number;
  end_minute: number;
  /** Sensitivity 1–10 (`level` / `sensitive`); 0 on read may mean not supported. */
  sensitivity_level: number;
  /** Android read: `isSupportCustomSettingTime`. */
  supports_custom_time_window?: boolean;
  /** Vendor default sensitivity when non-zero. */
  default_sensitivity_level?: number;
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
  menstrual_length_days?: number;
  menstrual_cycle_days?: number;
  /** Calendar date `yyyy-MM-dd`. */
  last_menstrual_date?: string;
  expected_delivery_date?: string;
  baby_birthday?: string;
  baby_sex?: WomenHealthBabySex;
  /** Some Bands report current-cycle day count on read. */
  current_menstrual_days?: number;
  /** Android-only: `EWomenOprateStatus` name when present. */
  operation_status?: string;
}

/** Weather temperature unit. Vendor `EWeatherType` / `VPWeatherConfigModel.weatherUnit`. */
export type WeatherUnit = 'C' | 'F';

/** Weather switch + unit state. Android `WeatherStatusData`; iOS `VPWeatherConfigModel`. */
export interface WeatherSettings {
  is_open: boolean;
  unit: WeatherUnit;
  /** CRC of current weather on device; pass back when pushing data to skip no-op updates. */
  crc: number;
}

/** 3-hour forecast entry. Android `WeatherEvery3Hour`; iOS `VPWeatherServerHourlyModel`. */
export interface WeatherHourlyForecast {
  /** ISO datetime "YYYY-MM-DD HH:mm" */
  time: string;
  temp_c: number;
  temp_f: number;
  /** Weather state code 0–155 (sunny→cloudy→rain→snow). See vendor docs for ranges. */
  weather_state: number;
  uv_index: number;
  /** Wind level e.g. "3" or "3-5". */
  wind_level: string;
  /** Visibility in metres. */
  visibility_m: number;
}

/** Daily forecast entry. Android `WeatherEveryDay`; iOS `VPWeatherServerForecastModel`. */
export interface WeatherDailyForecast {
  /** ISO date "YYYY-MM-DD" */
  date: string;
  max_temp_c: number;
  min_temp_c: number;
  max_temp_f: number;
  min_temp_f: number;
  weather_state_day: number;
  weather_state_night: number;
  uv_index?: number;
  wind_level?: string;
  visibility_m?: number;
}

/** Full weather payload to push to the Band. Android `WeatherData`; iOS `VPWeatherServerModel`. */
export interface WeatherData {
  city_name: string;
  /** CRC uniqueness key — Band skips write when CRC matches stored value. */
  crc: number;
  latitude?: number;
  longitude?: number;
  hourly: WeatherHourlyForecast[];
  daily: WeatherDailyForecast[];
}

export interface DeviceData {
  device_id: string;
  data: unknown;
}

/** A contact entry stored on the Band. Android `Contact`; iOS `VPDeviceContactsModel`. */
export interface DeviceContact {
  contact_id: number;
  /** Display name — vendor limit: 20 bytes UTF-8. */
  name: string;
  phone_number: string;
  /** Whether this contact is marked as an SOS (emergency) contact. */
  is_sos: boolean;
  /** Whether the Band supports designating this contact as SOS. Android-only; may be absent on iOS. */
  is_support_sos?: boolean;
}

/** Payload for `addContact` — the Band assigns the `contact_id`. */
export interface NewDeviceContact {
  name: string;
  phone_number: string;
  /** Mark as SOS on add; defaults to false. */
  is_sos?: boolean;
}

/** SOS call-attempt count from the Band. Vendor enforces `times` stays within `[min_times, max_times]`. */
export interface SosCallTimesSettings {
  times: number;
  min_times: number;
  max_times: number;
}

/** Camera shutter status emitted when the Band triggers a photo (`cameraShutter` event). */
export type CameraShutterStatus = 'canTake' | 'cannotTake';

/** Track metadata pushed to the Band display via `pushMusicData`. Android only. */
export interface MusicData {
  /** Optional music app identifier (vendor `musicAppId`). */
  app_id?: string;
  album?: string;
  name: string;
  artist: string;
  is_playing: boolean;
  /** Volume level 1–100 (vendor `musicVoiceLevel`). */
  volume: number;
}

/** Remote command emitted when the Band sends a music control action (`musicRemoteCommand` event). Android only. */
export type MusicRemoteCommand = 'next' | 'previous' | 'pause_play';

/**
 * GPS + timezone data pushed to the Band via `setDeviceGPSAndTimezone`.
 * iOS only — Android rejects with `CAPABILITY_UNSUPPORTED`.
 * Gate: check `readDeviceFunctions().package3.agps_function` before calling.
 */
export interface GPSAndTimezoneData {
  /** Latitude in decimal degrees (e.g. 39.904987). Range: -90 to 90. */
  latitude: number;
  /** Longitude in decimal degrees (e.g. 116.405289). Range: -180 to 180. */
  longitude: number;
  /** Altitude in meters. Optional. */
  altitude?: number;
  /** Timezone offset from UTC in minutes (must be multiple of 15). E.g. 480 for UTC+8. */
  timezone_offset_minutes: number;
}

/** Band's classic Bluetooth connection state (used in `deviceBTStateChanged` event). */
export type DeviceBTState = 'disconnected' | 'connected' | 'pairing';

/**
 * Band's classic Bluetooth status returned by `readDeviceBTStatus`.
 * Classic BT is the secondary radio used for phone-call audio forwarding.
 */
export interface DeviceBTStatus {
  /** Whether the Band's classic BT radio is on. */
  is_bt_open: boolean;
  /** Whether the Band auto-reconnects classic BT. */
  is_auto_connect: boolean;
  /** Whether multimedia audio is routed through the Band. */
  is_audio_open: boolean;
  /** Whether pairing info exists on the Band. */
  has_pair_info: boolean;
  /** Current connection state. */
  state: DeviceBTState;
}

/** Reminder type passed to `readHealthReminder` / `setHealthReminder`. */
export type HealthReminderType =
  | 'sedentary'
  | 'drink_water'
  | 'look_far_away'
  | 'sport'
  | 'take_medicine'
  | 'read'
  | 'trip'
  | 'wash_hands';

export interface HealthReminder {
  type: HealthReminderType;
  start_hour: number;
  start_minute: number;
  end_hour: number;
  end_minute: number;
  /** Reminder interval in minutes. */
  interval: number;
  enabled: boolean;
}

/** SpO₂ low-saturation alarm settings stored on the Band. */
export interface Spo2Alarm {
  enabled: boolean;
  /** SpO₂ percentage threshold (1–99) below which the alarm fires. */
  low_threshold: number;
}

export type DeviceSwitchType =
  | 'auto_hr' | 'auto_bp' | 'auto_spo2' | 'auto_temperature' | 'auto_hrv'
  | 'auto_blood_glucose' | 'auto_ppg' | 'wear_detection' | 'disconnect_remind'
  | 'sos_remind' | 'auto_answer' | 'exercise_detection' | 'accurate_sleep'
  | 'ecg_normally_open' | 'met' | 'stress' | 'music_control';

export type DeviceSwitches = Record<DeviceSwitchType, boolean>;
