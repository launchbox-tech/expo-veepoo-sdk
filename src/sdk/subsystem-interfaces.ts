import type {
  AutoMeasureSetting,
  BatteryInfo,
  ConnectOptions,
  ConnectionStatus,
  DaySummaryData,
  DeviceAlarm,
  DeviceBTStatus,
  DeviceContact,
  DeviceFunctions,
  DeviceVersion,
  EcgTestOptions,
  GPSAndTimezoneData,
  HeartRateAlarm,
  Language,
  LogLevel,
  LogScope,
  MusicData,
  NewDeviceContact,
  OperationStatus,
  OriginData,
  PasswordData,
  PermissionsResult,
  PersonalInfo,
  ScanOptions,
  ScreenLightDuration,
  ScreenLightSettings,
  SedentaryReminderSettings,
  SleepData,
  SocialMsgData,
  SosCallTimesSettings,
  SportStepData,
  VeepooError,
  VeepooEvent,
  VeepooEventPayload,
  WatchFaceDialType,
  WatchFaceStyle,
  WatchFaceStyleSettings,
  WeatherData,
  WeatherSettings,
  WomenHealthSettings,
  WristFlipWakeSettings,
} from "../types/index.js";
import type { NativeVeepooSDKInterface } from "../NativeVeepooSDK.js";
import type { LogListener } from "../VeepooSDKModule.js";
import type { VeepooSdkState } from "./veepoo-sdk-state.js";

// ── Constructor input interfaces ────────────────────────────────────────────

/** Minimal runtime surface all subsystems depend on. */
export interface SubsystemRuntime {
  readonly native: NativeVeepooSDKInterface;
  readonly state: VeepooSdkState;
  log(
    level: LogLevel,
    scope: LogScope,
    action: string,
    message: string,
    options?: { deviceId?: string; data?: unknown; error?: unknown },
  ): void;
  emitLocal(event: VeepooEvent, payload: unknown): void;
  handleError(
    error: unknown,
    fallbackCode: VeepooError["code"],
    deviceId?: string,
  ): VeepooError;
  nativeOpFailed(error: unknown): never;
}

/** Runtime surface needed by `SdkLifecycle`. */
export interface LifecycleRuntime extends SubsystemRuntime {
  setupEventListeners(): void;
  teardownNativeListeners(): void;
  resetAfterDestroy(): void;
}

// ── Subsystem output interfaces ─────────────────────────────────────────────

export interface SdkLifecycleInterface {
  init(): Promise<void>;
  destroy(): void;
  setLogEnabled(enabled: boolean): this;
  isLogEnabled(): boolean;
  setLogger(logger: LogListener | null): this;
  isScanningActive(): boolean;
  isSDKInitialized(): boolean;
  getConnectedDeviceId(): string | null;
  on<K extends VeepooEvent>(
    event: K,
    listener: (payload: VeepooEventPayload[K]) => void,
  ): this;
  off<K extends VeepooEvent>(
    event: K,
    listener: (payload: VeepooEventPayload[K]) => void,
  ): this;
  once<K extends VeepooEvent>(
    event: K,
    listener: (payload: VeepooEventPayload[K]) => void,
  ): this;
  removeAllListeners(event?: VeepooEvent): this;
}

export interface BandDiscoveryInterface {
  checkBluetoothStatus(): Promise<boolean>;
  requestPermissions(): Promise<PermissionsResult>;
  startScan(options?: ScanOptions): Promise<void>;
  stopScan(): Promise<void>;
}

export interface SessionInterface {
  connect(deviceId: string, options?: ConnectOptions): Promise<void>;
  disconnect(deviceId?: string): Promise<void>;
  getConnectionStatus(deviceId?: string): Promise<ConnectionStatus>;
  verifyPassword(password?: string, is24Hour?: boolean): Promise<PasswordData>;
}

export interface HealthDataInterface {
  readBattery(): Promise<BatteryInfo>;
  readDeviceFunctions(): Promise<DeviceFunctions>;
  readSocialMsgData(): Promise<SocialMsgData>;
  writeSocialMsgData(data: Partial<SocialMsgData>): Promise<OperationStatus>;
  readDeviceVersion(): Promise<DeviceVersion>;
  startReadOriginData(): Promise<void>;
  readDeviceAllData(): Promise<boolean>;
  readSleepData(date?: string): Promise<SleepData[]>;
  readSportStepData(date?: string): Promise<SportStepData>;
  readOriginData(dayOffset?: number): Promise<OriginData[]>;
  readDaySummaryData(dayOffset?: number): Promise<DaySummaryData>;
}

export interface AlarmSettingsInterface {
  readAlarms(): Promise<DeviceAlarm[]>;
  setAlarm(alarm: DeviceAlarm): Promise<OperationStatus>;
  deleteAlarm(alarmId: number): Promise<OperationStatus>;
  readHeartRateAlarm(): Promise<HeartRateAlarm>;
  setHeartRateAlarm(alarm: HeartRateAlarm): Promise<OperationStatus>;
}

export interface DisplaySettingsInterface {
  readScreenLightSettings(): Promise<ScreenLightSettings>;
  setScreenLightSettings(settings: ScreenLightSettings): Promise<void>;
  readScreenLightDuration(): Promise<ScreenLightDuration>;
  setScreenLightDuration(seconds: number): Promise<void>;
  readWristFlipWakeSettings(): Promise<WristFlipWakeSettings>;
  setWristFlipWakeSettings(settings: WristFlipWakeSettings): Promise<void>;
  readWatchFaceStyle(options?: { dialType?: WatchFaceDialType }): Promise<WatchFaceStyle>;
  setWatchFaceStyle(settings: WatchFaceStyleSettings): Promise<void>;
}

export interface HealthConfigInterface {
  syncPersonalInfo(info: PersonalInfo): Promise<boolean>;
  readAutoMeasureSetting(): Promise<AutoMeasureSetting[]>;
  modifyAutoMeasureSetting(setting: Partial<AutoMeasureSetting>): Promise<AutoMeasureSetting[]>;
  readSedentaryReminder(): Promise<SedentaryReminderSettings>;
  setSedentaryReminder(settings: SedentaryReminderSettings): Promise<void>;
  readWomenHealthSettings(): Promise<WomenHealthSettings>;
  setWomenHealthSettings(settings: WomenHealthSettings): Promise<void>;
}

export interface EmergencySettingsInterface {
  readContacts(crc?: number): Promise<DeviceContact[]>;
  addContact(contact: NewDeviceContact): Promise<void>;
  deleteContact(contactId: number): Promise<void>;
  setContactSosState(contactId: number, isOpen: boolean): Promise<void>;
  readSosCallTimes(): Promise<SosCallTimesSettings>;
  setSosCallTimes(times: number): Promise<void>;
}

export interface MediaInteractionInterface {
  startFindDevice(): Promise<void>;
  stopFindDevice(): Promise<void>;
  enterCameraMode(): Promise<void>;
  exitCameraMode(): Promise<void>;
  setMusicControlEnabled(enabled: boolean): Promise<void>;
  pushMusicData(data: MusicData): Promise<void>;
}

export interface SystemSettingsInterface {
  setLanguage(language: Language): Promise<boolean>;
  setDeviceTime(time?: Date): Promise<boolean>;
  setDeviceGPSAndTimezone(data: GPSAndTimezoneData): Promise<void>;
  readDeviceBTStatus(): Promise<DeviceBTStatus>;
  setDeviceBTSwitch(open: boolean): Promise<void>;
  readWeatherSettings(): Promise<WeatherSettings>;
  setWeatherSettings(settings: WeatherSettings): Promise<void>;
  pushWeatherData(data: WeatherData): Promise<void>;
  startLocalFirmwareDfu(filePath: string): Promise<void>;
}

export interface DeviceSettingsInterface
  extends AlarmSettingsInterface,
    DisplaySettingsInterface,
    HealthConfigInterface,
    EmergencySettingsInterface,
    MediaInteractionInterface,
    SystemSettingsInterface {}

export interface RealtimeTestsInterface {
  startHeartRateTest(): Promise<void>;
  stopHeartRateTest(): Promise<void>;
  startBloodPressureTest(): Promise<void>;
  stopBloodPressureTest(): Promise<void>;
  startBloodOxygenTest(): Promise<void>;
  stopBloodOxygenTest(): Promise<void>;
  startTemperatureTest(): Promise<void>;
  stopTemperatureTest(): Promise<void>;
  startStressTest(): Promise<void>;
  stopStressTest(): Promise<void>;
  startBloodGlucoseTest(): Promise<void>;
  stopBloodGlucoseTest(): Promise<void>;
  startHrvTest(): Promise<void>;
  stopHrvTest(): Promise<void>;
  startEcgTest(options?: EcgTestOptions): Promise<void>;
  stopEcgTest(): Promise<void>;
  startFatigueTest(): Promise<void>;
  stopFatigueTest(): Promise<void>;
  startBreathingTest(): Promise<void>;
  stopBreathingTest(): Promise<void>;
  startBodyCompositionTest(): Promise<void>;
  stopBodyCompositionTest(): Promise<void>;
}
