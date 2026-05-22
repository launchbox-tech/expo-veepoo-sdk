import type { CapabilityContext } from "@/capabilities/shared/context";
import type { NativeVeepooSDKInterface } from "@/native-veepoo-sdk";

import { AlarmsCapability } from "@/capabilities/alarms/index";
import { AutoMeasureCapability } from "@/capabilities/auto-measure";
import { BandDiscoveryCapability } from "@/capabilities/band-discovery/index";
import { BatteryCapability } from "@/capabilities/battery";
import { BtStatusCapability } from "@/capabilities/bt-status";
import { CalibrationCapability } from "@/capabilities/calibration";
import { CameraCapability } from "@/capabilities/camera";
import { ContactsCapability } from "@/capabilities/contacts/index";
import { DaySummaryCapability } from "@/capabilities/day-summary";
import { DeviceFunctionsCapability } from "@/capabilities/device-functions/index";
import { DeviceSwitchesCapability } from "@/capabilities/device-switches";
import { DeviceTimeCapability } from "@/capabilities/device-time";
import { DeviceVersionCapability } from "@/capabilities/device-version";
import { DfuCapability } from "@/capabilities/dfu";
import { FindDeviceCapability } from "@/capabilities/find-device";
import { GpsTimezoneCapability } from "@/capabilities/gps-timezone";
import { HistoricalQueryCapability } from "@/capabilities/historical-query";
import { LanguageCapability } from "@/capabilities/language";
import { MusicCapability } from "@/capabilities/music";
import { OriginDataCapability } from "@/capabilities/origin-data/index";
import { PersonalInfoCapability } from "@/capabilities/personal-info";
import { RealtimeTestsCapability } from "@/capabilities/realtime-tests/index";
import { ScreenLightCapability } from "@/capabilities/screen-light/index";
import { SedentaryReminderCapability } from "@/capabilities/sedentary-reminder";
import { SessionCapability } from "@/capabilities/session/index";
import { SleepDataCapability } from "@/capabilities/sleep-data/index";
import { SocialMsgCapability } from "@/capabilities/social-msg";
import { SosCapability } from "@/capabilities/sos";
import { SportModeCapability } from "@/capabilities/sport-mode/index";
import { SportStepsCapability } from "@/capabilities/sport-steps";
import { WatchFaceCapability } from "@/capabilities/watch-face";
import { WeatherCapability } from "@/capabilities/weather/index";
import { WomenHealthCapability } from "@/capabilities/women-health/index";
import { WorldClockCapability } from "@/capabilities/world-clock";
import { WristFlipCapability } from "@/capabilities/wrist-flip";

/**
 * A capability constructor: takes the runtime-built `CapabilityContext` and
 * produces the capability instance the facade exposes (e.g. `sdk.battery`).
 * The `TNative` type per capability narrows the context to just the native
 * methods that capability needs — the runtime hands every capability the same
 * shared context shape, and TypeScript widens accordingly at the call site.
 */
export type CapabilityCtor = new (
  ctx: CapabilityContext<NativeVeepooSDKInterface>,
) => unknown;

/**
 * Single source of truth for the capabilities the facade exposes. The
 * `VeepooSDK` constructor iterates this map to assign one instance per key.
 * The class declares matching `readonly` properties so `sdk.battery` resolves
 * to `BatteryCapability` in one IDE hop (per ADR-0005's "interface by
 * construction" — see ADR 0010 for the rationale on this light split).
 */
export const CAPABILITIES = {
  alarms: AlarmsCapability,
  autoMeasure: AutoMeasureCapability,
  battery: BatteryCapability,
  btStatus: BtStatusCapability,
  calibration: CalibrationCapability,
  camera: CameraCapability,
  contacts: ContactsCapability,
  daySummary: DaySummaryCapability,
  deviceFunctions: DeviceFunctionsCapability,
  deviceSwitches: DeviceSwitchesCapability,
  deviceTime: DeviceTimeCapability,
  deviceVersion: DeviceVersionCapability,
  dfu: DfuCapability,
  discovery: BandDiscoveryCapability,
  findDevice: FindDeviceCapability,
  gpsTimezone: GpsTimezoneCapability,
  historicalQuery: HistoricalQueryCapability,
  language: LanguageCapability,
  music: MusicCapability,
  originData: OriginDataCapability,
  personalInfo: PersonalInfoCapability,
  realtimeTests: RealtimeTestsCapability,
  screenLight: ScreenLightCapability,
  sedentaryReminder: SedentaryReminderCapability,
  session: SessionCapability,
  sleepData: SleepDataCapability,
  socialMsg: SocialMsgCapability,
  sos: SosCapability,
  sportMode: SportModeCapability,
  sportSteps: SportStepsCapability,
  watchFace: WatchFaceCapability,
  weather: WeatherCapability,
  womenHealth: WomenHealthCapability,
  worldClock: WorldClockCapability,
  wristFlip: WristFlipCapability,
} as const satisfies Record<string, CapabilityCtor>;

export type CapabilityKey = keyof typeof CAPABILITIES;
