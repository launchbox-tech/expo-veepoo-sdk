import type {
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
  EcgTestOptions,
  HeartRateAlarm,
  ScanOptions,
  ConnectOptions,
  ConnectionStatus,
  DeviceAlarm,
  OperationStatus,
} from "./types/index.js";
import type { NativeVeepooSDKInterface } from "./NativeVeepooSDK.js";
import { NativeVeepooSDK } from "./NativeVeepooSDK.js";
import type { VeepooSDKModuleInterface, LogListener } from "./VeepooSDKModule.js";
import { VeepooSDKRuntime } from "./sdk/veepoo-sdk-runtime.js";
import { SdkLifecycle } from "./sdk/sdk-lifecycle.js";
import { BandDiscovery } from "./sdk/band-discovery.js";
import { SessionConnection } from "./sdk/session-connection.js";
import { HealthData } from "./sdk/health-data.js";
import { DeviceSettings } from "./sdk/device-settings.js";
import { RealtimeTests } from "./sdk/realtime-tests.js";

export class VeepooSDK implements VeepooSDKModuleInterface {
  private readonly rt: VeepooSDKRuntime;
  private readonly lifecycle: SdkLifecycle;
  private readonly discovery: BandDiscovery;
  private readonly session: SessionConnection;
  private readonly health: HealthData;
  private readonly deviceSettings: DeviceSettings;
  private readonly realtime: RealtimeTests;

  constructor(native: NativeVeepooSDKInterface = NativeVeepooSDK) {
    this.rt = new VeepooSDKRuntime(native);
    this.lifecycle = new SdkLifecycle(this.rt);
    this.discovery = new BandDiscovery(this.rt);
    this.session = new SessionConnection(this.rt);
    this.health = new HealthData(this.rt);
    this.deviceSettings = new DeviceSettings(this.rt);
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
    this.deviceSettings.syncPersonalInfo(info);

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
    return this.deviceSettings.readAutoMeasureSetting();
  }

  modifyAutoMeasureSetting(
    setting: Partial<AutoMeasureSetting>,
  ): Promise<AutoMeasureSetting[]> {
    return this.deviceSettings.modifyAutoMeasureSetting(setting);
  }

  setLanguage = (language: Language): Promise<boolean> =>
    this.deviceSettings.setLanguage(language);

  setDeviceTime(time?: Date): Promise<boolean> {
    return this.deviceSettings.setDeviceTime(time);
  }

  readAlarms(): Promise<DeviceAlarm[]> {
    return this.deviceSettings.readAlarms();
  }

  setAlarm(alarm: DeviceAlarm): Promise<OperationStatus> {
    return this.deviceSettings.setAlarm(alarm);
  }

  deleteAlarm(alarmId: number): Promise<OperationStatus> {
    return this.deviceSettings.deleteAlarm(alarmId);
  }

  readHeartRateAlarm(): Promise<HeartRateAlarm> {
    return this.deviceSettings.readHeartRateAlarm();
  }

  setHeartRateAlarm(alarm: HeartRateAlarm): Promise<OperationStatus> {
    return this.deviceSettings.setHeartRateAlarm(alarm);
  }

  startHeartRateTest = (): Promise<void> => this.realtime.startHeartRateTest();

  stopHeartRateTest = (): Promise<void> => this.realtime.stopHeartRateTest();

  startBloodPressureTest = (): Promise<void> => this.realtime.startBloodPressureTest();

  stopBloodPressureTest = (): Promise<void> => this.realtime.stopBloodPressureTest();

  startBloodOxygenTest = (): Promise<void> => this.realtime.startBloodOxygenTest();

  stopBloodOxygenTest = (): Promise<void> => this.realtime.stopBloodOxygenTest();

  startTemperatureTest = (): Promise<void> => this.realtime.startTemperatureTest();

  stopTemperatureTest = (): Promise<void> => this.realtime.stopTemperatureTest();

  startStressTest = (): Promise<void> => this.realtime.startStressTest();

  stopStressTest = (): Promise<void> => this.realtime.stopStressTest();

  startBloodGlucoseTest = (): Promise<void> => this.realtime.startBloodGlucoseTest();

  stopBloodGlucoseTest = (): Promise<void> => this.realtime.stopBloodGlucoseTest();

  startHrvTest = (): Promise<void> => this.realtime.startHrvTest();

  stopHrvTest = (): Promise<void> => this.realtime.stopHrvTest();

  startEcgTest(options?: EcgTestOptions): Promise<void> {
    return this.realtime.startEcgTest(options);
  }

  stopEcgTest = (): Promise<void> => this.realtime.stopEcgTest();

  startFatigueTest = (): Promise<void> => this.realtime.startFatigueTest();

  stopFatigueTest = (): Promise<void> => this.realtime.stopFatigueTest();

  startBreathingTest = (): Promise<void> => this.realtime.startBreathingTest();

  stopBreathingTest = (): Promise<void> => this.realtime.stopBreathingTest();

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
    return this.rt.isScanning;
  }

  isSDKInitialized(): boolean {
    return this.rt.isInitialized;
  }

  getConnectedDeviceId(): string | null {
    return this.rt.connectedDeviceId;
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
