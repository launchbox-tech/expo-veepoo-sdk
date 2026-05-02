import { requireNativeModule, EventSubscription } from 'expo-modules-core';

import type {
  ConnectionStatus,
  DeviceAlarm,
  OperationStatus,
  PersonalInfo,
  VeepooEvent,
  ScanOptions,
  ConnectOptions,
  Language,
  AutoMeasureSetting,
  PermissionsResult,
  SocialMsgData,
} from './types/index.js';

const LINKING_ERROR =
  "The package 'expo-veepoo-sdk' doesn't seem to be linked. Make sure:\n\n" +
  '- You rebuilt the app after installing the package\n' +
  '- You are not using Expo Go (this module requires a development build)\n';

export interface NativeVeepooSDKInterface {
  init(): Promise<void>;
  isBluetoothEnabled(): Promise<boolean>;
  requestPermissions(): Promise<PermissionsResult>;
  startScan(options?: ScanOptions): Promise<void>;
  stopScan(): Promise<void>;
  connect(deviceId: string, options?: ConnectOptions): Promise<void>;
  disconnect(deviceId: string): Promise<void>;
  getConnectionStatus(deviceId: string): Promise<ConnectionStatus>;
  verifyPassword(password: string, is24Hour: boolean): Promise<unknown>;
  readBattery(): Promise<unknown>;
  syncPersonalInfo(info: PersonalInfo): Promise<boolean>;
  readDeviceFunctions(): Promise<unknown>;
  readSocialMsgData(): Promise<unknown>;
  writeSocialMsgData(data: Partial<SocialMsgData>): Promise<OperationStatus>;
  readDeviceVersion(): Promise<unknown>;
  startReadOriginData(): Promise<void>;
  readDeviceAllData(): Promise<boolean>;
  readSleepData(date?: string): Promise<unknown>;
  readSportStepData(date?: string): Promise<unknown>;
  readOriginData(dayOffset?: number): Promise<unknown>;
  readDaySummaryData(dayOffset?: number): Promise<unknown>;
  readAutoMeasureSetting(): Promise<unknown>;
  modifyAutoMeasureSetting(setting: Partial<AutoMeasureSetting>): Promise<unknown>;
  setLanguage(language: Language): Promise<boolean>;
  startHeartRateTest(): Promise<void>;
  stopHeartRateTest(): Promise<void>;
  startBloodPressureTest(): Promise<void>;
  stopBloodPressureTest(): Promise<void>;
  startBloodOxygenTest(): Promise<void>;
  stopBloodOxygenTest(): Promise<void>;
  startTemperatureTest(): Promise<void>;
  stopTemperatureTest(): Promise<void>;
  startStressTest(): Promise<void>;
  stopStressTest(): Promise<void>;
  startBloodGlucoseTest(): Promise<void>;
  stopBloodGlucoseTest(): Promise<void>;
  setDeviceTime(time?: Date): Promise<boolean>;
  readAlarms(): Promise<unknown>;
  setAlarm(alarm: DeviceAlarm): Promise<OperationStatus>;
  deleteAlarm(alarmId: number): Promise<OperationStatus>;
  addListener(event: VeepooEvent, listener: (payload: unknown) => void): EventSubscription;
  removeListeners(count: number): void;
}

let NativeModule: NativeVeepooSDKInterface;

try {
  NativeModule = requireNativeModule('VeepooSDK');
} catch {
  NativeModule = new Proxy({} as NativeVeepooSDKInterface, {
    get() {
      throw new Error(LINKING_ERROR);
    },
  });
}

export { NativeModule as NativeVeepooSDK };
