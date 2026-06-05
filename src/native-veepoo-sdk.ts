import { requireNativeModule, EventSubscription } from "expo-modules-core";

import type { VeepooEvent } from "./types/index";

import type { AlarmNativeMethods } from "./capabilities/alarms/native";
import type { AutoMeasureNativeMethods } from "./capabilities/auto-measure";
import type { BandDiscoveryNativeMethods } from "./capabilities/band-discovery/native";
import type { CalibrationNativeMethods } from "./capabilities/calibration";
import type { DeviceSwitchesNativeMethods } from "./capabilities/device-switches";
import type { BatteryNativeMethods } from "./capabilities/battery";
import type { BtStatusNativeMethods } from "./capabilities/bt-status";
import type { CameraNativeMethods } from "./capabilities/camera";
import type { ContactsNativeMethods } from "./capabilities/contacts/native";
import type { DaySummaryNativeMethods } from "./capabilities/day-summary";
import type { DeviceFunctionsNativeMethods } from "./capabilities/device-functions/native";
import type { DeviceTimeNativeMethods } from "./capabilities/device-time";
import type { DeviceVersionNativeMethods } from "./capabilities/device-version";
import type { DfuNativeMethods } from "./capabilities/dfu";
import type { FindDeviceNativeMethods } from "./capabilities/find-device";
import type { GpsTimezoneNativeMethods } from "./capabilities/gps-timezone";
import type { HistoricalQueryNativeMethods } from "./capabilities/historical-query";
import type { LanguageNativeMethods } from "./capabilities/language";
import type { MusicNativeMethods } from "./capabilities/music";
import type { OriginDataNativeMethods } from "./capabilities/origin-data/native";
import type { PersonalInfoNativeMethods } from "./capabilities/personal-info";
import type { RealtimeTestsNativeMethods } from "./capabilities/realtime-tests/native";
import type { ScreenLightNativeMethods } from "./capabilities/screen-light/native";
import type { SedentaryReminderNativeMethods } from "./capabilities/sedentary-reminder";
import type { SessionNativeMethods } from "./capabilities/session/native";
import type { SleepDataNativeMethods } from "./capabilities/sleep-data/native";
import type { SocialMsgNativeMethods } from "./capabilities/social-msg";
import type { SosNativeMethods } from "./capabilities/sos";
import type { SportModeNativeMethods } from "./capabilities/sport-mode/native";
import type { SportStepsNativeMethods } from "./capabilities/sport-steps";
import type { WatchFaceNativeMethods } from "./capabilities/watch-face";
import type { WeatherNativeMethods } from "./capabilities/weather/native";
import type { WomenHealthNativeMethods } from "./capabilities/women-health/native";
import type { WorldClockNativeMethods } from "./capabilities/world-clock";
import type { WristFlipNativeMethods } from "./capabilities/wrist-flip";

const LINKING_ERROR =
  "The package 'expo-veepoo-sdk' doesn't seem to be linked. Make sure:\n\n" +
  "- You rebuilt the app after installing the package\n" +
  "- You are not using Expo Go (this module requires a development build)\n";

export interface EventListenerMethods {
  addListener(event: VeepooEvent, listener: (payload: unknown) => void): EventSubscription;
  removeListeners(count: number): void;
}

export interface NativeVeepooSDKInterface
  extends AlarmNativeMethods,
    AutoMeasureNativeMethods,
    BandDiscoveryNativeMethods,
    BatteryNativeMethods,
    BtStatusNativeMethods,
    CalibrationNativeMethods,
    CameraNativeMethods,
    ContactsNativeMethods,
    DaySummaryNativeMethods,
    DeviceFunctionsNativeMethods,
    DeviceSwitchesNativeMethods,
    DeviceTimeNativeMethods,
    DeviceVersionNativeMethods,
    DfuNativeMethods,
    FindDeviceNativeMethods,
    GpsTimezoneNativeMethods,
    HistoricalQueryNativeMethods,
    LanguageNativeMethods,
    MusicNativeMethods,
    OriginDataNativeMethods,
    PersonalInfoNativeMethods,
    RealtimeTestsNativeMethods,
    ScreenLightNativeMethods,
    SedentaryReminderNativeMethods,
    SessionNativeMethods,
    SleepDataNativeMethods,
    SocialMsgNativeMethods,
    SosNativeMethods,
    SportModeNativeMethods,
    SportStepsNativeMethods,
    WatchFaceNativeMethods,
    WeatherNativeMethods,
    WomenHealthNativeMethods,
    WorldClockNativeMethods,
    WristFlipNativeMethods,
    EventListenerMethods {}

let NativeModule: NativeVeepooSDKInterface;
try {
  NativeModule = requireNativeModule("VeepooSDK");
} catch {
  NativeModule = new Proxy({} as NativeVeepooSDKInterface, {
    get() {
      throw new Error(LINKING_ERROR);
    },
  });
}

export { NativeModule as NativeVeepooSDK };
