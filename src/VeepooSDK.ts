import type {
  BatteryInfo,
  DeviceContact,
  PersonalInfo,
  DeviceFunctions,
  DeviceVersion,
  NewDeviceContact,
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
  EcgTestOptions,
  HeartRateAlarm,
  ScreenLightDuration,
  ScreenLightSettings,
  SedentaryReminderSettings,
  SosCallTimesSettings,
  WristFlipWakeSettings,
  WomenHealthSettings,
  WatchFaceDialType,
  WatchFaceStyle,
  WatchFaceStyleSettings,
  WeatherSettings,
  WeatherData,
  MusicData,
  GPSAndTimezoneData,
  DeviceBTStatus,
  ScanOptions,
  ConnectOptions,
  ConnectionStatus,
  DeviceAlarm,
  OperationStatus,
  RealtimeTestModality,
} from "./types/index.js";
import type { NativeVeepooSDKInterface } from "./NativeVeepooSDK.js";
import { NativeVeepooSDK } from "./NativeVeepooSDK.js";
import type { VeepooSDKModuleInterface, LogListener } from "./VeepooSDKModule.js";
import { VeepooSDKRuntime } from "./sdk/veepoo-sdk-runtime.js";
import { SdkLifecycle } from "./sdk/sdk-lifecycle.js";
import { BandDiscovery } from "./sdk/band-discovery.js";
import { SessionConnection } from "./sdk/session-connection.js";
import { HealthData } from "./sdk/health-data.js";
import {
  AlarmSettings,
  DisplaySettings,
  HealthConfig,
  EmergencySettings,
  MediaInteraction,
  SystemSettings,
} from "./sdk/device-settings/index.js";
import { RealtimeTests } from "./sdk/realtime-tests.js";

export class VeepooSDK implements VeepooSDKModuleInterface {
  private readonly rt: VeepooSDKRuntime;
  private readonly lifecycle: SdkLifecycle;
  private readonly discovery: BandDiscovery;
  private readonly session: SessionConnection;
  private readonly health: HealthData;
  private readonly alarmSettings: AlarmSettings;
  private readonly displaySettings: DisplaySettings;
  private readonly healthConfig: HealthConfig;
  private readonly emergencySettings: EmergencySettings;
  private readonly mediaInteraction: MediaInteraction;
  private readonly systemSettings: SystemSettings;
  private readonly realtime: RealtimeTests;

  constructor(native: NativeVeepooSDKInterface = NativeVeepooSDK) {
    this.rt = new VeepooSDKRuntime(native);
    this.lifecycle = new SdkLifecycle(this.rt);
    this.discovery = new BandDiscovery(this.rt);
    this.session = new SessionConnection(this.rt);
    this.health = new HealthData(this.rt);
    this.alarmSettings = new AlarmSettings(this.rt);
    this.displaySettings = new DisplaySettings(this.rt);
    this.healthConfig = new HealthConfig(this.rt);
    this.emergencySettings = new EmergencySettings(this.rt);
    this.mediaInteraction = new MediaInteraction(this.rt);
    this.systemSettings = new SystemSettings(this.rt);
    this.realtime = new RealtimeTests(this.rt);
  }

  init(): Promise<void> {
    return this.lifecycle.init();
  }

  destroy(): void {
    this.lifecycle.destroy();
  }

  checkBluetoothStatus(): Promise<boolean> {
    return this.discovery.checkBluetoothStatus();
  }

  requestPermissions(): Promise<PermissionsResult> {
    return this.discovery.requestPermissions();
  }

  startScan(options?: ScanOptions): Promise<void> {
    return this.discovery.startScan(options);
  }

  stopScan(): Promise<void> {
    return this.discovery.stopScan();
  }

  connect(deviceId: string, options?: ConnectOptions): Promise<void> {
    return this.session.connect(deviceId, options);
  }

  disconnect(deviceId?: string): Promise<void> {
    return this.session.disconnect(deviceId);
  }

  getConnectionStatus(deviceId?: string): Promise<ConnectionStatus> {
    return this.session.getConnectionStatus(deviceId);
  }

  verifyPassword(password?: string, is24Hour?: boolean): Promise<PasswordData> {
    return this.session.verifyPassword(password, is24Hour);
  }

  readBattery(): Promise<BatteryInfo> {
    return this.health.readBattery();
  }

  syncPersonalInfo = (info: PersonalInfo): Promise<boolean> =>
    this.healthConfig.syncPersonalInfo(info);

  readDeviceFunctions(): Promise<DeviceFunctions> {
    return this.health.readDeviceFunctions();
  }

  readSocialMsgData(): Promise<SocialMsgData> {
    return this.health.readSocialMsgData();
  }

  writeSocialMsgData(data: Partial<SocialMsgData>): Promise<OperationStatus> {
    return this.health.writeSocialMsgData(data);
  }

  readDeviceVersion(): Promise<DeviceVersion> {
    return this.health.readDeviceVersion();
  }

  startReadOriginData = (): Promise<void> => this.health.startReadOriginData();

  readDeviceAllData = (): Promise<boolean> => this.health.readDeviceAllData();

  readSleepData(date?: string): Promise<SleepData[]> {
    return this.health.readSleepData(date);
  }

  readSportStepData(date?: string): Promise<SportStepData> {
    return this.health.readSportStepData(date);
  }

  readOriginData(dayOffset?: number): Promise<OriginData[]> {
    return this.health.readOriginData(dayOffset);
  }

  readDaySummaryData(dayOffset?: number): Promise<DaySummaryData> {
    return this.health.readDaySummaryData(dayOffset);
  }

  readAutoMeasureSetting(): Promise<AutoMeasureSetting[]> {
    return this.healthConfig.readAutoMeasureSetting();
  }

  modifyAutoMeasureSetting(
    setting: Partial<AutoMeasureSetting>,
  ): Promise<AutoMeasureSetting[]> {
    return this.healthConfig.modifyAutoMeasureSetting(setting);
  }

  setLanguage = (language: Language): Promise<boolean> =>
    this.systemSettings.setLanguage(language);

  setDeviceTime(time?: Date): Promise<boolean> {
    return this.systemSettings.setDeviceTime(time);
  }

  readAlarms(): Promise<DeviceAlarm[]> {
    return this.alarmSettings.readAlarms();
  }

  setAlarm(alarm: DeviceAlarm): Promise<OperationStatus> {
    return this.alarmSettings.setAlarm(alarm);
  }

  deleteAlarm(alarmId: number): Promise<OperationStatus> {
    return this.alarmSettings.deleteAlarm(alarmId);
  }

  readHeartRateAlarm(): Promise<HeartRateAlarm> {
    return this.alarmSettings.readHeartRateAlarm();
  }

  setHeartRateAlarm(alarm: HeartRateAlarm): Promise<OperationStatus> {
    return this.alarmSettings.setHeartRateAlarm(alarm);
  }

  startFindDevice = (): Promise<void> => this.mediaInteraction.startFindDevice();

  stopFindDevice = (): Promise<void> => this.mediaInteraction.stopFindDevice();

  readScreenLightSettings = (): Promise<ScreenLightSettings> =>
    this.displaySettings.readScreenLightSettings();

  setScreenLightSettings = (settings: ScreenLightSettings): Promise<void> =>
    this.displaySettings.setScreenLightSettings(settings);

  readScreenLightDuration = (): Promise<ScreenLightDuration> =>
    this.displaySettings.readScreenLightDuration();

  setScreenLightDuration = (seconds: number): Promise<void> =>
    this.displaySettings.setScreenLightDuration(seconds);

  readSedentaryReminder = (): Promise<SedentaryReminderSettings> =>
    this.healthConfig.readSedentaryReminder();

  setSedentaryReminder = (settings: SedentaryReminderSettings): Promise<void> =>
    this.healthConfig.setSedentaryReminder(settings);

  readWristFlipWakeSettings = (): Promise<WristFlipWakeSettings> =>
    this.displaySettings.readWristFlipWakeSettings();

  setWristFlipWakeSettings = (settings: WristFlipWakeSettings): Promise<void> =>
    this.displaySettings.setWristFlipWakeSettings(settings);

  readWomenHealthSettings = (): Promise<WomenHealthSettings> =>
    this.healthConfig.readWomenHealthSettings();

  setWomenHealthSettings = (settings: WomenHealthSettings): Promise<void> =>
    this.healthConfig.setWomenHealthSettings(settings);

  readWeatherSettings = (): Promise<WeatherSettings> =>
    this.systemSettings.readWeatherSettings();

  setWeatherSettings = (settings: WeatherSettings): Promise<void> =>
    this.systemSettings.setWeatherSettings(settings);

  pushWeatherData = (data: WeatherData): Promise<void> =>
    this.systemSettings.pushWeatherData(data);

  startLocalFirmwareDfu = (filePath: string): Promise<void> =>
    this.systemSettings.startLocalFirmwareDfu(filePath);

  readWatchFaceStyle = (options?: { dialType?: WatchFaceDialType }): Promise<WatchFaceStyle> =>
    this.displaySettings.readWatchFaceStyle(options);

  setWatchFaceStyle = (settings: WatchFaceStyleSettings): Promise<void> =>
    this.displaySettings.setWatchFaceStyle(settings);

  readContacts = (crc?: number): Promise<DeviceContact[]> =>
    this.emergencySettings.readContacts(crc);

  addContact = (contact: NewDeviceContact): Promise<void> =>
    this.emergencySettings.addContact(contact);

  deleteContact = (contactId: number): Promise<void> =>
    this.emergencySettings.deleteContact(contactId);

  setContactSosState = (contactId: number, isOpen: boolean): Promise<void> =>
    this.emergencySettings.setContactSosState(contactId, isOpen);

  readSosCallTimes = (): Promise<SosCallTimesSettings> =>
    this.emergencySettings.readSosCallTimes();

  setSosCallTimes = (times: number): Promise<void> =>
    this.emergencySettings.setSosCallTimes(times);

  enterCameraMode = (): Promise<void> =>
    this.mediaInteraction.enterCameraMode();

  exitCameraMode = (): Promise<void> =>
    this.mediaInteraction.exitCameraMode();

  setMusicControlEnabled = (enabled: boolean): Promise<void> =>
    this.mediaInteraction.setMusicControlEnabled(enabled);

  pushMusicData = (data: MusicData): Promise<void> =>
    this.mediaInteraction.pushMusicData(data);

  setDeviceGPSAndTimezone = (data: GPSAndTimezoneData): Promise<void> =>
    this.systemSettings.setDeviceGPSAndTimezone(data);

  readDeviceBTStatus = (): Promise<DeviceBTStatus> =>
    this.systemSettings.readDeviceBTStatus();

  setDeviceBTSwitch = (open: boolean): Promise<void> =>
    this.systemSettings.setDeviceBTSwitch(open);

  startTest = (modality: RealtimeTestModality): Promise<void> => this.realtime.startTest(modality);

  stopTest = (modality: RealtimeTestModality): Promise<void> => this.realtime.stopTest(modality);

  startEcgTest(options?: EcgTestOptions): Promise<void> {
    return this.realtime.startEcgTest(options);
  }

  stopEcgTest = (): Promise<void> => this.realtime.stopEcgTest();

  setLogEnabled(enabled: boolean): this {
    this.rt.setLogEnabled(enabled);
    return this;
  }

  isLogEnabled(): boolean {
    return this.rt.isLogEnabled();
  }

  setLogger(logger: LogListener | null): this {
    this.rt.setLogger(logger);
    return this;
  }

  isScanningActive(): boolean {
    return this.rt.state.isScanning;
  }

  isSDKInitialized(): boolean {
    return this.rt.state.isInitialized;
  }

  getConnectedDeviceId(): string | null {
    return this.rt.state.connectedDeviceId;
  }

  on<K extends VeepooEvent>(
    event: K,
    listener: (payload: VeepooEventPayload[K]) => void,
  ): this {
    this.rt.on(event, listener);
    return this;
  }

  off<K extends VeepooEvent>(
    event: K,
    listener: (payload: VeepooEventPayload[K]) => void,
  ): this {
    this.rt.off(event, listener);
    return this;
  }

  once<K extends VeepooEvent>(
    event: K,
    listener: (payload: VeepooEventPayload[K]) => void,
  ): this {
    this.rt.once(event, listener);
    return this;
  }

  removeAllListeners(event?: VeepooEvent): this {
    this.rt.removeAllListeners(event);
    return this;
  }
}

const sdk = new VeepooSDK();
export default sdk;
