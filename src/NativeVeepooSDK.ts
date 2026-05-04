import { requireNativeModule, EventSubscription } from "expo-modules-core";

import type { VeepooEvent } from "./types/index.js";

import type { AlarmNativeMethods } from "./capabilities/alarms/native.js";
import type { AutoMeasureNativeMethods } from "./capabilities/auto-measure/native.js";
import type { BandDiscoveryNativeMethods } from "./capabilities/band-discovery/native.js";
import type { BatteryNativeMethods } from "./capabilities/battery/native.js";
import type { BtStatusNativeMethods } from "./capabilities/bt-status/native.js";
import type { CameraNativeMethods } from "./capabilities/camera/native.js";
import type { ContactsNativeMethods } from "./capabilities/contacts/native.js";
import type { DaySummaryNativeMethods } from "./capabilities/day-summary/native.js";
import type { DeviceFunctionsNativeMethods } from "./capabilities/device-functions/native.js";
import type { DeviceTimeNativeMethods } from "./capabilities/device-time/native.js";
import type { DeviceVersionNativeMethods } from "./capabilities/device-version/native.js";
import type { DfuNativeMethods } from "./capabilities/dfu/native.js";
import type { FindDeviceNativeMethods } from "./capabilities/find-device/native.js";
import type { GpsTimezoneNativeMethods } from "./capabilities/gps-timezone/native.js";
import type { HistoricalQueryNativeMethods } from "./capabilities/historical-query/native.js";
import type { LanguageNativeMethods } from "./capabilities/language/native.js";
import type { MusicNativeMethods } from "./capabilities/music/native.js";
import type { OriginDataNativeMethods } from "./capabilities/origin-data/native.js";
import type { PersonalInfoNativeMethods } from "./capabilities/personal-info/native.js";
import type { RealtimeTestsNativeMethods } from "./capabilities/realtime-tests/native.js";
import type { ScreenLightNativeMethods } from "./capabilities/screen-light/native.js";
import type { SedentaryReminderNativeMethods } from "./capabilities/sedentary-reminder/native.js";
import type { SessionNativeMethods } from "./capabilities/session/native.js";
import type { SleepDataNativeMethods } from "./capabilities/sleep-data/native.js";
import type { SocialMsgNativeMethods } from "./capabilities/social-msg/native.js";
import type { SosNativeMethods } from "./capabilities/sos/native.js";
import type { SportStepsNativeMethods } from "./capabilities/sport-steps/native.js";
import type { WatchFaceNativeMethods } from "./capabilities/watch-face/native.js";
import type { WeatherNativeMethods } from "./capabilities/weather/native.js";
import type { WomenHealthNativeMethods } from "./capabilities/women-health/native.js";
import type { WristFlipNativeMethods } from "./capabilities/wrist-flip/native.js";

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
