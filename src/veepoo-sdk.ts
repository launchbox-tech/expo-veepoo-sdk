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
  MusicData,
  NewDeviceContact,
  OperationStatus,
  OriginData,
  PasswordData,
  PermissionsResult,
  PersonalInfo,
  RealtimeTestModality,
  ScanOptions,
  ScreenLightDuration,
  ScreenLightSettings,
  SedentaryReminderSettings,
  SleepData,
  SocialMsgData,
  SosCallTimesSettings,
  SportMode,
  SportModeStatus,
  SportStepData,
  Spo2Alarm,
  VeepooEvent,
  VeepooEventPayload,
  WatchFaceDialType,
  WatchFaceStyle,
  WatchFaceStyleSettings,
  WeatherData,
  WeatherSettings,
  WomenHealthSettings,
  WristFlipWakeSettings,
} from "./types/index";
import type { NativeVeepooSDKInterface } from "./native-veepoo-sdk";
import { NativeVeepooSDK } from "./native-veepoo-sdk";
import type { LogListener } from "./veepoo-sdk-module";
import { VeepooSDKRuntime } from "./sdk/veepoo-sdk-runtime";
import { SdkLifecycle } from "./sdk/sdk-lifecycle";

import { AlarmsCapability } from "./capabilities/alarms/index";
import { AutoMeasureCapability } from "./capabilities/auto-measure/index";
import { CalibrationCapability } from "./capabilities/calibration/index";
import { DeviceSwitchesCapability } from "./capabilities/device-switches/index";
import { BandDiscoveryCapability } from "./capabilities/band-discovery/index";
import { BatteryCapability } from "./capabilities/battery/index";
import { BtStatusCapability } from "./capabilities/bt-status/index";
import { CameraCapability } from "./capabilities/camera/index";
import { ContactsCapability } from "./capabilities/contacts/index";
import { DaySummaryCapability } from "./capabilities/day-summary/index";
import { DeviceFunctionsCapability } from "./capabilities/device-functions/index";
import { DeviceTimeCapability } from "./capabilities/device-time/index";
import { DeviceVersionCapability } from "./capabilities/device-version/index";
import { DfuCapability } from "./capabilities/dfu/index";
import { FindDeviceCapability } from "./capabilities/find-device/index";
import { GpsTimezoneCapability } from "./capabilities/gps-timezone/index";
import { HistoricalQueryCapability } from "./capabilities/historical-query/index";
import { LanguageCapability } from "./capabilities/language/index";
import { MusicCapability } from "./capabilities/music/index";
import { OriginDataCapability } from "./capabilities/origin-data/index";
import { PersonalInfoCapability } from "./capabilities/personal-info/index";
import { RealtimeTestsCapability } from "./capabilities/realtime-tests/index";
import { ScreenLightCapability } from "./capabilities/screen-light/index";
import { SedentaryReminderCapability } from "./capabilities/sedentary-reminder/index";
import { SessionCapability } from "./capabilities/session/index";
import { SleepDataCapability } from "./capabilities/sleep-data/index";
import { SocialMsgCapability } from "./capabilities/social-msg/index";
import { SosCapability } from "./capabilities/sos/index";
import { SportModeCapability } from "./capabilities/sport-mode/index";
import { SportStepsCapability } from "./capabilities/sport-steps/index";
import { WatchFaceCapability } from "./capabilities/watch-face/index";
import { WeatherCapability } from "./capabilities/weather/index";
import { WomenHealthCapability } from "./capabilities/women-health/index";
import { WorldClockCapability } from "./capabilities/world-clock/index";
import { WristFlipCapability } from "./capabilities/wrist-flip/index";

export interface VeepooSDKInterface {
  // Lifecycle (flat, not namespaced)
  init(): Promise<void>;
  destroy(): void;
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

  // Capabilities (namespaced)
  alarms: AlarmsCapability;
  autoMeasure: AutoMeasureCapability;
  battery: BatteryCapability;
  calibration: CalibrationCapability;
  deviceSwitches: DeviceSwitchesCapability;
  btStatus: BtStatusCapability;
  camera: CameraCapability;
  contacts: ContactsCapability;
  daySummary: DaySummaryCapability;
  deviceFunctions: DeviceFunctionsCapability;
  deviceTime: DeviceTimeCapability;
  deviceVersion: DeviceVersionCapability;
  dfu: DfuCapability;
  discovery: BandDiscoveryCapability;
  findDevice: FindDeviceCapability;
  gpsTimezone: GpsTimezoneCapability;
  historicalQuery: HistoricalQueryCapability;
  language: LanguageCapability;
  music: MusicCapability;
  originData: OriginDataCapability;
  personalInfo: PersonalInfoCapability;
  realtimeTests: RealtimeTestsCapability;
  screenLight: ScreenLightCapability;
  sedentaryReminder: SedentaryReminderCapability;
  session: SessionCapability;
  sleepData: SleepDataCapability;
  socialMsg: SocialMsgCapability;
  sos: SosCapability;
  sportMode: SportModeCapability;
  sportSteps: SportStepsCapability;
  watchFace: WatchFaceCapability;
  weather: WeatherCapability;
  womenHealth: WomenHealthCapability;
  worldClock: WorldClockCapability;
  wristFlip: WristFlipCapability;
}

export class VeepooSDK implements VeepooSDKInterface {
  private readonly rt: VeepooSDKRuntime;
  private readonly lifecycle: SdkLifecycle;

  readonly alarms: AlarmsCapability;
  readonly autoMeasure: AutoMeasureCapability;
  readonly battery: BatteryCapability;
  readonly calibration: CalibrationCapability;
  readonly deviceSwitches: DeviceSwitchesCapability;
  readonly btStatus: BtStatusCapability;
  readonly camera: CameraCapability;
  readonly contacts: ContactsCapability;
  readonly daySummary: DaySummaryCapability;
  readonly deviceFunctions: DeviceFunctionsCapability;
  readonly deviceTime: DeviceTimeCapability;
  readonly deviceVersion: DeviceVersionCapability;
  readonly dfu: DfuCapability;
  readonly discovery: BandDiscoveryCapability;
  readonly findDevice: FindDeviceCapability;
  readonly gpsTimezone: GpsTimezoneCapability;
  readonly historicalQuery: HistoricalQueryCapability;
  readonly language: LanguageCapability;
  readonly music: MusicCapability;
  readonly originData: OriginDataCapability;
  readonly personalInfo: PersonalInfoCapability;
  readonly realtimeTests: RealtimeTestsCapability;
  readonly screenLight: ScreenLightCapability;
  readonly sedentaryReminder: SedentaryReminderCapability;
  readonly session: SessionCapability;
  readonly sleepData: SleepDataCapability;
  readonly socialMsg: SocialMsgCapability;
  readonly sos: SosCapability;
  readonly sportMode: SportModeCapability;
  readonly sportSteps: SportStepsCapability;
  readonly watchFace: WatchFaceCapability;
  readonly weather: WeatherCapability;
  readonly womenHealth: WomenHealthCapability;
  readonly worldClock: WorldClockCapability;
  readonly wristFlip: WristFlipCapability;

  constructor(native: NativeVeepooSDKInterface = NativeVeepooSDK) {
    this.rt = new VeepooSDKRuntime(native);
    const ctx = this.rt.createCapabilityContext();
    this.lifecycle = new SdkLifecycle(this.rt);

    this.alarms = new AlarmsCapability(ctx);
    this.autoMeasure = new AutoMeasureCapability(ctx);
    this.battery = new BatteryCapability(ctx);
    this.calibration = new CalibrationCapability(ctx);
    this.deviceSwitches = new DeviceSwitchesCapability(ctx);
    this.btStatus = new BtStatusCapability(ctx);
    this.camera = new CameraCapability(ctx);
    this.contacts = new ContactsCapability(ctx);
    this.daySummary = new DaySummaryCapability(ctx);
    this.deviceFunctions = new DeviceFunctionsCapability(ctx);
    this.deviceTime = new DeviceTimeCapability(ctx);
    this.deviceVersion = new DeviceVersionCapability(ctx);
    this.dfu = new DfuCapability(ctx);
    this.discovery = new BandDiscoveryCapability(ctx);
    this.findDevice = new FindDeviceCapability(ctx);
    this.gpsTimezone = new GpsTimezoneCapability(ctx);
    this.historicalQuery = new HistoricalQueryCapability(ctx);
    this.language = new LanguageCapability(ctx);
    this.music = new MusicCapability(ctx);
    this.originData = new OriginDataCapability(ctx);
    this.personalInfo = new PersonalInfoCapability(ctx);
    this.realtimeTests = new RealtimeTestsCapability(ctx);
    this.screenLight = new ScreenLightCapability(ctx);
    this.sedentaryReminder = new SedentaryReminderCapability(ctx);
    this.session = new SessionCapability(ctx);
    this.sleepData = new SleepDataCapability(ctx);
    this.socialMsg = new SocialMsgCapability(ctx);
    this.sos = new SosCapability(ctx);
    this.sportMode = new SportModeCapability(ctx);
    this.sportSteps = new SportStepsCapability(ctx);
    this.watchFace = new WatchFaceCapability(ctx);
    this.weather = new WeatherCapability(ctx);
    this.womenHealth = new WomenHealthCapability(ctx);
    this.worldClock = new WorldClockCapability(ctx);
    this.wristFlip = new WristFlipCapability(ctx);
  }

  // ── Lifecycle ────────────────────────────────────────────────────────────────
  init(): Promise<void> { return this.lifecycle.init(); }
  destroy(): void { this.lifecycle.destroy(); }

  setLogEnabled(enabled: boolean): this {
    this.rt.setLogEnabled(enabled);
    return this;
  }

  isLogEnabled(): boolean { return this.rt.isLogEnabled(); }

  setLogger(logger: LogListener | null): this {
    this.rt.setLogger(logger);
    return this;
  }

  isScanningActive(): boolean { return this.rt.state.isScanning; }
  isSDKInitialized(): boolean { return this.rt.state.isInitialized; }
  getConnectedDeviceId(): string | null { return this.rt.state.connectedDeviceId; }

  on<K extends VeepooEvent>(event: K, listener: (payload: VeepooEventPayload[K]) => void): this {
    this.rt.on(event, listener);
    return this;
  }

  off<K extends VeepooEvent>(event: K, listener: (payload: VeepooEventPayload[K]) => void): this {
    this.rt.off(event, listener);
    return this;
  }

  once<K extends VeepooEvent>(event: K, listener: (payload: VeepooEventPayload[K]) => void): this {
    this.rt.once(event, listener);
    return this;
  }

  removeAllListeners(event?: VeepooEvent): this {
    this.rt.removeAllListeners(event);
    return this;
  }

  // ── Flat legacy API (delegates to namespaced capabilities) ───────────────────
  checkBluetoothStatus(): Promise<boolean> { return this.discovery.checkBluetoothStatus(); }
  requestPermissions(): Promise<PermissionsResult> { return this.discovery.requestPermissions(); }
  startScan(options?: ScanOptions): Promise<void> { return this.discovery.startScan(options); }
  stopScan(): Promise<void> { return this.discovery.stopScan(); }

  connect(deviceId: string, options?: ConnectOptions): Promise<void> { return this.session.connect(deviceId, options); }
  disconnect(deviceId?: string): Promise<void> { return this.session.disconnect(deviceId); }
  getConnectionStatus(deviceId?: string): Promise<ConnectionStatus> { return this.session.getConnectionStatus(deviceId); }
  verifyPassword(password?: string, is24Hour?: boolean): Promise<PasswordData> { return this.session.verifyPassword(password, is24Hour); }

  readBattery(): Promise<BatteryInfo> { return this.battery.readBattery(); }

  syncPersonalInfo = (info: PersonalInfo): Promise<boolean> => this.personalInfo.syncPersonalInfo(info);

  readDeviceFunctions(): Promise<DeviceFunctions> { return this.deviceFunctions.readDeviceFunctions(); }

  readSocialMsgData(): Promise<SocialMsgData> { return this.socialMsg.readSocialMsgData(); }
  writeSocialMsgData(data: Partial<SocialMsgData>): Promise<OperationStatus> { return this.socialMsg.writeSocialMsgData(data); }

  readDeviceVersion(): Promise<DeviceVersion> { return this.deviceVersion.readDeviceVersion(); }

  startReadOriginData = (): Promise<void> => this.historicalQuery.startReadOriginData();
  readDeviceAllData = (): Promise<boolean> => this.historicalQuery.readDeviceAllData();

  readSleepData(date?: string): Promise<SleepData[]> { return this.sleepData.readSleepData(date); }
  readSportStepData(date?: string): Promise<SportStepData> { return this.sportSteps.readSportStepData(date); }
  readOriginData(dayOffset?: number): Promise<OriginData[]> { return this.originData.readOriginData(dayOffset); }
  readDaySummaryData(dayOffset?: number): Promise<DaySummaryData> { return this.daySummary.readDaySummaryData(dayOffset); }

  readAutoMeasureSetting(): Promise<AutoMeasureSetting[]> { return this.autoMeasure.readAutoMeasureSetting(); }
  modifyAutoMeasureSetting(setting: Partial<AutoMeasureSetting>): Promise<AutoMeasureSetting[]> { return this.autoMeasure.modifyAutoMeasureSetting(setting); }

  setLanguage = (language: Language): Promise<boolean> => this.language.setLanguage(language);

  setDeviceTime(time?: Date): Promise<boolean> { return this.deviceTime.setDeviceTime(time); }

  readAlarms(): Promise<DeviceAlarm[]> { return this.alarms.readAlarms(); }
  setAlarm(alarm: DeviceAlarm): Promise<OperationStatus> { return this.alarms.setAlarm(alarm); }
  deleteAlarm(alarmId: number): Promise<OperationStatus> { return this.alarms.deleteAlarm(alarmId); }
  readHeartRateAlarm(): Promise<HeartRateAlarm> { return this.alarms.readHeartRateAlarm(); }
  setHeartRateAlarm(alarm: HeartRateAlarm): Promise<OperationStatus> { return this.alarms.setHeartRateAlarm(alarm); }
  readSpo2Alarm(): Promise<Spo2Alarm> { return this.alarms.readSpo2Alarm(); }
  setSpo2Alarm(alarm: Spo2Alarm): Promise<OperationStatus> { return this.alarms.setSpo2Alarm(alarm); }

  startFindDevice = (): Promise<void> => this.findDevice.startFindDevice();
  stopFindDevice = (): Promise<void> => this.findDevice.stopFindDevice();

  readScreenLightSettings = (): Promise<ScreenLightSettings> => this.screenLight.readScreenLightSettings();
  setScreenLightSettings = (settings: ScreenLightSettings): Promise<void> => this.screenLight.setScreenLightSettings(settings);
  readScreenLightDuration = (): Promise<ScreenLightDuration> => this.screenLight.readScreenLightDuration();
  setScreenLightDuration = (seconds: number): Promise<void> => this.screenLight.setScreenLightDuration(seconds);

  readSedentaryReminder = (): Promise<SedentaryReminderSettings> => this.sedentaryReminder.readSedentaryReminder();
  setSedentaryReminder = (settings: SedentaryReminderSettings): Promise<void> => this.sedentaryReminder.setSedentaryReminder(settings);

  readWristFlipWakeSettings = (): Promise<WristFlipWakeSettings> => this.wristFlip.readWristFlipWakeSettings();
  setWristFlipWakeSettings = (settings: WristFlipWakeSettings): Promise<void> => this.wristFlip.setWristFlipWakeSettings(settings);

  readWomenHealthSettings = (): Promise<WomenHealthSettings> => this.womenHealth.readWomenHealthSettings();
  setWomenHealthSettings = (settings: WomenHealthSettings): Promise<void> => this.womenHealth.setWomenHealthSettings(settings);

  readWeatherSettings = (): Promise<WeatherSettings> => this.weather.readWeatherSettings();
  setWeatherSettings = (settings: WeatherSettings): Promise<void> => this.weather.setWeatherSettings(settings);
  pushWeatherData = (data: WeatherData): Promise<void> => this.weather.pushWeatherData(data);

  startLocalFirmwareDfu = (filePath: string): Promise<void> => this.dfu.startLocalFirmwareDfu(filePath);

  readWatchFaceStyle = (options?: { dial_type?: WatchFaceDialType }): Promise<WatchFaceStyle> => this.watchFace.readWatchFaceStyle(options);
  setWatchFaceStyle = (settings: WatchFaceStyleSettings): Promise<void> => this.watchFace.setWatchFaceStyle(settings);

  readContacts = (crc?: number): Promise<DeviceContact[]> => this.contacts.readContacts(crc);
  addContact = (contact: NewDeviceContact): Promise<void> => this.contacts.addContact(contact);
  deleteContact = (contactId: number): Promise<void> => this.contacts.deleteContact(contactId);
  setContactSosState = (contactId: number, isOpen: boolean): Promise<void> => this.contacts.setContactSosState(contactId, isOpen);

  readSosCallTimes = (): Promise<SosCallTimesSettings> => this.sos.readSosCallTimes();
  setSosCallTimes = (times: number): Promise<void> => this.sos.setSosCallTimes(times);

  enterCameraMode = (): Promise<void> => this.camera.enterCameraMode();
  exitCameraMode = (): Promise<void> => this.camera.exitCameraMode();

  setMusicControlEnabled = (enabled: boolean): Promise<void> => this.music.setMusicControlEnabled(enabled);
  pushMusicData = (data: MusicData): Promise<void> => this.music.pushMusicData(data);

  setDeviceGPSAndTimezone = (data: GPSAndTimezoneData): Promise<void> => this.gpsTimezone.setDeviceGPSAndTimezone(data);

  readDeviceBTStatus = (): Promise<DeviceBTStatus> => this.btStatus.readDeviceBTStatus();
  setDeviceBTSwitch = (open: boolean): Promise<void> => this.btStatus.setDeviceBTSwitch(open);

  startTest = (modality: RealtimeTestModality): Promise<void> => this.realtimeTests.startTest(modality);
  stopTest = (modality: RealtimeTestModality): Promise<void> => this.realtimeTests.stopTest(modality);

  startEcgTest(options?: EcgTestOptions): Promise<void> { return this.realtimeTests.startEcgTest(options); }
  stopEcgTest = (): Promise<void> => this.realtimeTests.stopEcgTest();

  readSportMode = (): Promise<SportModeStatus> => this.sportMode.readSportMode();
  setSportMode = (mode: SportMode): Promise<OperationStatus> => this.sportMode.setSportMode(mode);
  stopSportMode = (): Promise<OperationStatus> => this.sportMode.stopSportMode();

  renameDevice = (name: string): Promise<OperationStatus> => this.session.renameDevice(name);
  isConnectionConfirmEnabled = (): Promise<boolean> => this.session.isConnectionConfirmEnabled();
  setConnectionConfirmEnabled = (enabled: boolean): Promise<OperationStatus> => this.session.setConnectionConfirmEnabled(enabled);
  setConnectionConfirmTimeout = (seconds: number): Promise<OperationStatus> => this.session.setConnectionConfirmTimeout(seconds);
}

const sdk = new VeepooSDK();
export default sdk;
