import type { CapabilityContext } from "../capabilities/shared/context";
import type { NativeVeepooSDKInterface } from "../native-veepoo-sdk";
import { AlarmsCapability } from "../capabilities/alarms/index";
import { AutoMeasureCapability } from "../capabilities/auto-measure";
import { BandDiscoveryCapability } from "../capabilities/band-discovery/index";
import { BatteryCapability } from "../capabilities/battery";
import { BtStatusCapability } from "../capabilities/bt-status";
import { CalibrationCapability } from "../capabilities/calibration";
import { CameraCapability } from "../capabilities/camera";
import { ContactsCapability } from "../capabilities/contacts/index";
import { DaySummaryCapability } from "../capabilities/day-summary";
import { DeviceFunctionsCapability } from "../capabilities/device-functions/index";
import { DeviceSwitchesCapability } from "../capabilities/device-switches";
import { DeviceTimeCapability } from "../capabilities/device-time";
import { DeviceVersionCapability } from "../capabilities/device-version";
import { DfuCapability } from "../capabilities/dfu";
import { FindDeviceCapability } from "../capabilities/find-device";
import { GpsTimezoneCapability } from "../capabilities/gps-timezone";
import { HistoricalQueryCapability } from "../capabilities/historical-query";
import { LanguageCapability } from "../capabilities/language";
import { MusicCapability } from "../capabilities/music";
import { OriginDataCapability } from "../capabilities/origin-data/index";
import { PersonalInfoCapability } from "../capabilities/personal-info";
import { RealtimeTestsCapability } from "../capabilities/realtime-tests/index";
import { ScreenLightCapability } from "../capabilities/screen-light/index";
import { SedentaryReminderCapability } from "../capabilities/sedentary-reminder";
import { SessionCapability } from "../capabilities/session/index";
import { SleepDataCapability } from "../capabilities/sleep-data/index";
import { SocialMsgCapability } from "../capabilities/social-msg";
import { SosCapability } from "../capabilities/sos";
import { SportModeCapability } from "../capabilities/sport-mode/index";
import { SportStepsCapability } from "../capabilities/sport-steps";
import { WatchFaceCapability } from "../capabilities/watch-face";
import { WeatherCapability } from "../capabilities/weather/index";
import { WomenHealthCapability } from "../capabilities/women-health/index";
import { WorldClockCapability } from "../capabilities/world-clock";
import { WristFlipCapability } from "../capabilities/wrist-flip";
/**
 * A capability constructor: takes the runtime-built `CapabilityContext` and
 * produces the capability instance the facade exposes (e.g. `sdk.battery`).
 * The `TNative` type per capability narrows the context to just the native
 * methods that capability needs — the runtime hands every capability the same
 * shared context shape, and TypeScript widens accordingly at the call site.
 */
export type CapabilityCtor = new (ctx: CapabilityContext<NativeVeepooSDKInterface>) => unknown;
/**
 * Single source of truth for the capabilities the facade exposes. The
 * `VeepooSDK` constructor iterates this map to assign one instance per key.
 * The class declares matching `readonly` properties so `sdk.battery` resolves
 * to `BatteryCapability` in one IDE hop (per ADR-0005's "interface by
 * construction" — see ADR 0010 for the rationale on this light split).
 */
export declare const CAPABILITIES: {
    readonly alarms: typeof AlarmsCapability;
    readonly autoMeasure: typeof AutoMeasureCapability;
    readonly battery: typeof BatteryCapability;
    readonly btStatus: typeof BtStatusCapability;
    readonly calibration: typeof CalibrationCapability;
    readonly camera: typeof CameraCapability;
    readonly contacts: typeof ContactsCapability;
    readonly daySummary: typeof DaySummaryCapability;
    readonly deviceFunctions: typeof DeviceFunctionsCapability;
    readonly deviceSwitches: typeof DeviceSwitchesCapability;
    readonly deviceTime: typeof DeviceTimeCapability;
    readonly deviceVersion: typeof DeviceVersionCapability;
    readonly dfu: typeof DfuCapability;
    readonly discovery: typeof BandDiscoveryCapability;
    readonly findDevice: typeof FindDeviceCapability;
    readonly gpsTimezone: typeof GpsTimezoneCapability;
    readonly historicalQuery: typeof HistoricalQueryCapability;
    readonly language: typeof LanguageCapability;
    readonly music: typeof MusicCapability;
    readonly originData: typeof OriginDataCapability;
    readonly personalInfo: typeof PersonalInfoCapability;
    readonly realtimeTests: typeof RealtimeTestsCapability;
    readonly screenLight: typeof ScreenLightCapability;
    readonly sedentaryReminder: typeof SedentaryReminderCapability;
    readonly session: typeof SessionCapability;
    readonly sleepData: typeof SleepDataCapability;
    readonly socialMsg: typeof SocialMsgCapability;
    readonly sos: typeof SosCapability;
    readonly sportMode: typeof SportModeCapability;
    readonly sportSteps: typeof SportStepsCapability;
    readonly watchFace: typeof WatchFaceCapability;
    readonly weather: typeof WeatherCapability;
    readonly womenHealth: typeof WomenHealthCapability;
    readonly worldClock: typeof WorldClockCapability;
    readonly wristFlip: typeof WristFlipCapability;
};
export type CapabilityKey = keyof typeof CAPABILITIES;
//# sourceMappingURL=capability-registry.d.ts.map