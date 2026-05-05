import { requireNativeModule, EventSubscription } from "expo-modules-core";

import type { VeepooEvent } from "./types/index";

import type { AlarmNativeMethods } from "./capabilities/alarms/native";
import type { AutoMeasureNativeMethods } from "./capabilities/auto-measure/native";
import type { BandDiscoveryNativeMethods } from "./capabilities/band-discovery/native";
import type { BatteryNativeMethods } from "./capabilities/battery/native";
import type { BtStatusNativeMethods } from "./capabilities/bt-status/native";
import type { CameraNativeMethods } from "./capabilities/camera/native";
import type { ContactsNativeMethods } from "./capabilities/contacts/native";
import type { DaySummaryNativeMethods } from "./capabilities/day-summary/native";
import type { DeviceFunctionsNativeMethods } from "./capabilities/device-functions/native";
import type { DeviceTimeNativeMethods } from "./capabilities/device-time/native";
import type { DeviceVersionNativeMethods } from "./capabilities/device-version/native";
import type { DfuNativeMethods } from "./capabilities/dfu/native";
import type { FindDeviceNativeMethods } from "./capabilities/find-device/native";
import type { GpsTimezoneNativeMethods } from "./capabilities/gps-timezone/native";
import type { HistoricalQueryNativeMethods } from "./capabilities/historical-query/native";
import type { LanguageNativeMethods } from "./capabilities/language/native";
import type { MusicNativeMethods } from "./capabilities/music/native";
import type { OriginDataNativeMethods } from "./capabilities/origin-data/native";
import type { PersonalInfoNativeMethods } from "./capabilities/personal-info/native";
import type { RealtimeTestsNativeMethods } from "./capabilities/realtime-tests/native";
import type { ScreenLightNativeMethods } from "./capabilities/screen-light/native";
import type { SedentaryReminderNativeMethods } from "./capabilities/sedentary-reminder/native";
import type { SessionNativeMethods } from "./capabilities/session/native";
import type { SleepDataNativeMethods } from "./capabilities/sleep-data/native";
import type { SocialMsgNativeMethods } from "./capabilities/social-msg/native";
import type { SosNativeMethods } from "./capabilities/sos/native";
import type { SportStepsNativeMethods } from "./capabilities/sport-steps/native";
import type { WatchFaceNativeMethods } from "./capabilities/watch-face/native";
import type { WeatherNativeMethods } from "./capabilities/weather/native";
import type { WomenHealthNativeMethods } from "./capabilities/women-health/native";
import type { WristFlipNativeMethods } from "./capabilities/wrist-flip/native";

const LINKING_ERROR =
  "The package '@gaozh1024/expo-veepoo-sdk' doesn't seem to be linked. Make sure:\n\n" +
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
    CameraNativeMethods,
    ContactsNativeMethods,
    DaySummaryNativeMethods,
    DeviceFunctionsNativeMethods,
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
    SportStepsNativeMethods,
    WatchFaceNativeMethods,
    WeatherNativeMethods,
    WomenHealthNativeMethods,
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
