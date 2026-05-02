import type {
  ConnectionStatus,
  DeviceAlarm,
  OperationStatus,
  ScanOptions,
  ConnectOptions,
  LogEntry,
  BatteryInfo,
  PersonalInfo,
  DeviceFunctions,
  DeviceVersion,
  PasswordData,
  SocialMsgData,
  Language,
  AutoMeasureSetting,
  SleepData,
  SportStepData,
  OriginData,
  DaySummaryData,
  VeepooEvent,
  VeepooEventPayload,
  PermissionsResult,
} from './types/index.js';

export type LogListener = (entry: LogEntry) => void;

export interface VeepooSDKModuleInterface {
  init(): Promise<void>;
  checkBluetoothStatus(): Promise<boolean>;
  requestPermissions(): Promise<PermissionsResult>;
  startScan(options?: ScanOptions): Promise<void>;
  stopScan(): Promise<void>;
  connect(deviceId: string, options?: ConnectOptions): Promise<void>;
  disconnect(deviceId?: string): Promise<void>;
  getConnectionStatus(deviceId?: string): Promise<ConnectionStatus>;
  verifyPassword(password?: string, is24Hour?: boolean): Promise<PasswordData>;
  readBattery(): Promise<BatteryInfo>;
  syncPersonalInfo(info: PersonalInfo): Promise<boolean>;
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
  readAutoMeasureSetting(): Promise<AutoMeasureSetting[]>;
  modifyAutoMeasureSetting(setting: Partial<AutoMeasureSetting>): Promise<AutoMeasureSetting[]>;
  setLanguage(language: Language): Promise<boolean>;
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
  setDeviceTime(time?: Date): Promise<boolean>;
  readAlarms(): Promise<DeviceAlarm[]>;
  setAlarm(alarm: DeviceAlarm): Promise<OperationStatus>;
  deleteAlarm(alarmId: number): Promise<OperationStatus>;
  setLogEnabled(enabled: boolean): this;
  isLogEnabled(): boolean;
  setLogger(logger: LogListener | null): this;
  isScanningActive(): boolean;
  isSDKInitialized(): boolean;
  getConnectedDeviceId(): string | null;
  on<K extends VeepooEvent>(event: K, listener: (payload: VeepooEventPayload[K]) => void): this;
  off<K extends VeepooEvent>(event: K, listener: (payload: VeepooEventPayload[K]) => void): this;
  once<K extends VeepooEvent>(event: K, listener: (payload: VeepooEventPayload[K]) => void): this;
  removeAllListeners(event?: VeepooEvent): this;
  destroy(): void;
}
