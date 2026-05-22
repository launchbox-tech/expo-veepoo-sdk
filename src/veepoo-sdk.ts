import type { LogListener, VeepooEvent, VeepooEventPayload } from "./types/index";
import type { NativeVeepooSDKInterface } from "./native-veepoo-sdk";
import { NativeVeepooSDK } from "./native-veepoo-sdk";
import { VeepooSDKRuntime } from "./sdk/veepoo-sdk-runtime";
import { CAPABILITIES } from "./sdk/capability-registry";

import type { AlarmsCapability } from "./capabilities/alarms/index";
import type { AutoMeasureCapability } from "./capabilities/auto-measure";
import type { BandDiscoveryCapability } from "./capabilities/band-discovery/index";
import type { BatteryCapability } from "./capabilities/battery";
import type { BtStatusCapability } from "./capabilities/bt-status";
import type { CalibrationCapability } from "./capabilities/calibration";
import type { CameraCapability } from "./capabilities/camera";
import type { ContactsCapability } from "./capabilities/contacts/index";
import type { DaySummaryCapability } from "./capabilities/day-summary";
import type { DeviceFunctionsCapability } from "./capabilities/device-functions/index";
import type { DeviceSwitchesCapability } from "./capabilities/device-switches";
import type { DeviceTimeCapability } from "./capabilities/device-time";
import type { DeviceVersionCapability } from "./capabilities/device-version";
import type { DfuCapability } from "./capabilities/dfu";
import type { FindDeviceCapability } from "./capabilities/find-device";
import type { GpsTimezoneCapability } from "./capabilities/gps-timezone";
import type { HistoricalQueryCapability } from "./capabilities/historical-query";
import type { LanguageCapability } from "./capabilities/language";
import type { MusicCapability } from "./capabilities/music";
import type { OriginDataCapability } from "./capabilities/origin-data/index";
import type { PersonalInfoCapability } from "./capabilities/personal-info";
import type { RealtimeTestsCapability } from "./capabilities/realtime-tests/index";
import type { ScreenLightCapability } from "./capabilities/screen-light/index";
import type { SedentaryReminderCapability } from "./capabilities/sedentary-reminder";
import type { SessionCapability } from "./capabilities/session/index";
import type { SleepDataCapability } from "./capabilities/sleep-data/index";
import type { SocialMsgCapability } from "./capabilities/social-msg";
import type { SosCapability } from "./capabilities/sos";
import type { SportModeCapability } from "./capabilities/sport-mode/index";
import type { SportStepsCapability } from "./capabilities/sport-steps";
import type { WatchFaceCapability } from "./capabilities/watch-face";
import type { WeatherCapability } from "./capabilities/weather/index";
import type { WomenHealthCapability } from "./capabilities/women-health/index";
import type { WorldClockCapability } from "./capabilities/world-clock";
import type { WristFlipCapability } from "./capabilities/wrist-flip";

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

/**
 * The capability properties (`sdk.battery`, `sdk.session`, …) are assigned by
 * looping over `CAPABILITIES` in the constructor — see ADR 0010. The
 * `readonly` declarations below stay hand-typed so `sdk.battery` resolves to
 * `BatteryCapability` in one IDE hop. The constructor uses non-null assertion
 * (`!`) on each declaration because the assignment happens in the loop, not
 * inline.
 */
export class VeepooSDK implements VeepooSDKInterface {
  private readonly rt: VeepooSDKRuntime;

  readonly alarms!: AlarmsCapability;
  readonly autoMeasure!: AutoMeasureCapability;
  readonly battery!: BatteryCapability;
  readonly btStatus!: BtStatusCapability;
  readonly calibration!: CalibrationCapability;
  readonly camera!: CameraCapability;
  readonly contacts!: ContactsCapability;
  readonly daySummary!: DaySummaryCapability;
  readonly deviceFunctions!: DeviceFunctionsCapability;
  readonly deviceSwitches!: DeviceSwitchesCapability;
  readonly deviceTime!: DeviceTimeCapability;
  readonly deviceVersion!: DeviceVersionCapability;
  readonly dfu!: DfuCapability;
  readonly discovery!: BandDiscoveryCapability;
  readonly findDevice!: FindDeviceCapability;
  readonly gpsTimezone!: GpsTimezoneCapability;
  readonly historicalQuery!: HistoricalQueryCapability;
  readonly language!: LanguageCapability;
  readonly music!: MusicCapability;
  readonly originData!: OriginDataCapability;
  readonly personalInfo!: PersonalInfoCapability;
  readonly realtimeTests!: RealtimeTestsCapability;
  readonly screenLight!: ScreenLightCapability;
  readonly sedentaryReminder!: SedentaryReminderCapability;
  readonly session!: SessionCapability;
  readonly sleepData!: SleepDataCapability;
  readonly socialMsg!: SocialMsgCapability;
  readonly sos!: SosCapability;
  readonly sportMode!: SportModeCapability;
  readonly sportSteps!: SportStepsCapability;
  readonly watchFace!: WatchFaceCapability;
  readonly weather!: WeatherCapability;
  readonly womenHealth!: WomenHealthCapability;
  readonly worldClock!: WorldClockCapability;
  readonly wristFlip!: WristFlipCapability;

  constructor(native: NativeVeepooSDKInterface = NativeVeepooSDK) {
    this.rt = new VeepooSDKRuntime(native);
    const ctx = this.rt.createCapabilityContext();

    for (const [key, Ctor] of Object.entries(CAPABILITIES)) {
      (this as unknown as Record<string, unknown>)[key] = new Ctor(ctx);
    }
  }

  // ── Lifecycle ────────────────────────────────────────────────────────────────
  init(): Promise<void> { return this.rt.init(); }
  destroy(): void { this.rt.destroy(); }

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
