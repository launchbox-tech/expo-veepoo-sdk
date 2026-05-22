import type { VeepooEvent, VeepooEventPayload } from "./types/index";
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
  // Lifecycle & event API
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
}

const sdk = new VeepooSDK();
export default sdk;
