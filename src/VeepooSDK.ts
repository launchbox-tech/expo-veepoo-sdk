import { requireNativeModule } from 'expo-modules-core';
import type { EventSubscription } from 'expo-modules-core';

import type {
  ConnectionStatus,
  ScanOptions,
  ConnectOptions,
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
  VeepooError,
  OriginData,
  DaySummaryData,
  VeepooEvent,
  VeepooEventPayload,
  PermissionsResult,
} from './types.js';
import type { NativeVeepooSDKInterface } from './NativeVeepooSDK.js';
import {
  normalizeAutoMeasureSettings,
  normalizeBatteryInfo,
  normalizeBluetoothStatus,
  normalizeBloodGlucoseData,
  normalizeBloodOxygenTestResult,
  normalizeBloodPressureTestResult,
  normalizeDaySummaryData,
  normalizeDeviceFunctions,
  normalizeDeviceVersion,
  normalizeHalfHourData,
  normalizeHeartRateTestResult,
  normalizeOriginDataList,
  normalizePasswordData,
  normalizePermissionsResult,
  normalizeReadOriginProgressPayload,
  normalizeSleepDataList,
  normalizeSocialMsgData,
  normalizeSportStepData,
  normalizeStressData,
  normalizeTemperatureTestResult,
} from './normalizers.js';

type EventListener = (payload: unknown) => void;

const LINKING_ERROR =
  "The package 'expo-veepoo-sdk' doesn't seem to be linked. Make sure:\n\n" +
  '- You rebuilt the app after installing the package\n' +
  '- You are not using Expo Go (this module requires a development build)\n';

let NativeModule: NativeVeepooSDKInterface;
try {
  NativeModule = requireNativeModule<NativeVeepooSDKInterface>('VeepooSDK');
} catch {
  NativeModule = new Proxy({} as NativeVeepooSDKInterface, {
    get() {
      throw new Error(LINKING_ERROR);
    },
  });
}

export class VeepooSDK {
  private isScanning = false;
  private isInitialized = false;
  private connectedDeviceId: string | null = null;
  private eventListenersSetup = false;
  private listeners: Map<VeepooEvent, Set<EventListener>> = new Map();
  private nativeSubscriptions: EventSubscription[] = [];

  private setupEventListeners(): void {
    if (this.eventListenersSetup) return;
    this.eventListenersSetup = true;

    const events: VeepooEvent[] = [
      'deviceFound',
      'deviceConnected',
      'deviceDisconnected',
      'deviceConnectStatus',
      'deviceReady',
      'bluetoothStateChanged',
      'deviceFunction',
      'deviceVersion',
      'passwordData',
      'socialMsgData',
      'readOriginProgress',
      'readOriginComplete',
      'originFiveMinuteData',
      'originHalfHourData',
      'sleepData',
      'sportStepData',
      'heartRateTestResult',
      'bloodPressureTestResult',
      'bloodOxygenTestResult',
      'temperatureTestResult',
      'stressData',
      'bloodGlucoseData',
      'batteryData',
      'connectionStatusChanged',
      'error',
    ];

    events.forEach((event) => {
      const subscription = (NativeModule as unknown as { addListener: (event: string, listener: (payload: unknown) => void) => EventSubscription }).addListener(
        event,
        (payload: unknown) => {
          this.emitLocal(event, payload);
        }
      );
      this.nativeSubscriptions.push(subscription);
    });
  }

  private emitLocal(event: VeepooEvent, payload: unknown): void {
    const normalizedPayload =
      event === 'bluetoothStateChanged'
        ? normalizeBluetoothStatus(payload)
        : event === 'readOriginProgress'
          ? normalizeReadOriginProgressPayload(payload)
          : event === 'deviceFunction' && this.isEventRecord(payload)
            ? {
                ...payload,
                data: normalizeDeviceFunctions(payload.data ?? payload.functions),
                functions: normalizeDeviceFunctions(payload.functions ?? payload.data),
              }
            : event === 'deviceVersion' && this.isEventRecord(payload)
              ? { ...payload, version: normalizeDeviceVersion(payload.version) }
              : event === 'passwordData' && this.isEventRecord(payload)
                ? { ...payload, data: normalizePasswordData(payload.data) }
                : event === 'socialMsgData' && this.isEventRecord(payload)
                  ? { ...payload, data: normalizeSocialMsgData(payload.data) }
                  : event === 'originFiveMinuteData' && this.isEventRecord(payload)
                    ? {
                        ...payload,
                        data: normalizeOriginDataList([payload.data])[0],
                      }
                    : event === 'originHalfHourData' && this.isEventRecord(payload)
                      ? { ...payload, data: normalizeHalfHourData(payload.data) }
                      : event === 'sleepData' && this.isEventRecord(payload)
                        ? {
                            ...payload,
                            data: normalizeSleepDataList(payload.data)[0],
                          }
                        : event === 'sportStepData' && this.isEventRecord(payload)
                          ? { ...payload, data: normalizeSportStepData(payload.data) }
                          : event === 'heartRateTestResult' && this.isEventRecord(payload)
                            ? { ...payload, result: normalizeHeartRateTestResult(payload.result) }
                            : event === 'bloodPressureTestResult' && this.isEventRecord(payload)
                              ? {
                                  ...payload,
                                  result: normalizeBloodPressureTestResult(payload.result),
                                }
                              : event === 'bloodOxygenTestResult' && this.isEventRecord(payload)
                                ? {
                                    ...payload,
                                    result: normalizeBloodOxygenTestResult(payload.result),
                                  }
                                : event === 'temperatureTestResult' && this.isEventRecord(payload)
                                  ? {
                                      ...payload,
                                      result: normalizeTemperatureTestResult(payload.result),
                                    }
                                  : event === 'stressData' && this.isEventRecord(payload)
                                    ? { ...payload, data: normalizeStressData(payload.data) }
                                    : event === 'bloodGlucoseData' && this.isEventRecord(payload)
                                      ? {
                                          ...payload,
                                          data: normalizeBloodGlucoseData(payload.data),
                                        }
                                      : event === 'batteryData' && this.isEventRecord(payload)
                                        ? { ...payload, data: normalizeBatteryInfo(payload.data) }
          : payload;

    if (event === 'bluetoothStateChanged') {
      const bluetoothStatus = normalizedPayload as { isScanning?: boolean };
      if (typeof bluetoothStatus.isScanning === 'boolean') {
        this.isScanning = bluetoothStatus.isScanning;
      }
    }

    if (event === 'deviceConnected') {
      const device = normalizedPayload as { deviceId?: string };
      if (typeof device.deviceId === 'string' && device.deviceId.length > 0) {
        this.connectedDeviceId = device.deviceId;
      }
    }

    if (event === 'deviceDisconnected') {
      const device = normalizedPayload as { deviceId?: string };
      if (!device.deviceId || this.connectedDeviceId === device.deviceId) {
        this.connectedDeviceId = null;
      }
      this.isScanning = false;
    }

    if (event === 'deviceConnectStatus' || event === 'connectionStatusChanged') {
      const connection = normalizedPayload as { deviceId?: string; status?: ConnectionStatus };
      if (connection.status === 'disconnected' && (!connection.deviceId || this.connectedDeviceId === connection.deviceId)) {
        this.connectedDeviceId = null;
      }
    }

    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach((listener) => {
        try {
          listener(normalizedPayload);
        } catch (e) {
          console.error(`Error in event listener for ${event}:`, e);
        }
      });
    }
  }

  private isEventRecord(payload: unknown): payload is Record<string, any> {
    return typeof payload === 'object' && payload !== null;
  }

  private handleError(error: unknown, code: VeepooError['code'], deviceId?: string): VeepooError {
    const veepooError: VeepooError = {
      code,
      message: error instanceof Error ? error.message : String(error),
      deviceId,
    };
    this.emitLocal('error', veepooError);
    return veepooError;
  }

  async init(): Promise<void> {
    if (this.isInitialized) return;
    this.setupEventListeners();
    await NativeModule.init();
    this.isInitialized = true;
  }

  async checkBluetoothStatus(): Promise<boolean> {
    try {
      return await NativeModule.isBluetoothEnabled();
    } catch (error) {
      this.handleError(error, 'UNKNOWN');
      return false;
    }
  }

  async requestPermissions(): Promise<PermissionsResult> {
    try {
      return normalizePermissionsResult(await NativeModule.requestPermissions());
    } catch (error) {
      this.handleError(error, 'PERMISSION_DENIED');
      return { granted: false, status: 'denied', canAskAgain: true };
    }
  }

  async startScan(options?: ScanOptions): Promise<void> {
    if (this.isScanning) return;

    try {
      this.isScanning = true;
      await NativeModule.startScan(options);
    } catch (error) {
      this.isScanning = false;
      throw this.handleError(error, 'UNKNOWN');
    }
  }

  async stopScan(): Promise<void> {
    if (!this.isScanning) return;

    try {
      await NativeModule.stopScan();
      this.isScanning = false;
    } catch (error) {
      this.isScanning = false;
      throw this.handleError(error, 'UNKNOWN');
    }
  }

  async connect(deviceId: string, options?: ConnectOptions): Promise<void> {
    try {
      await NativeModule.connect(deviceId, options);
      this.connectedDeviceId = deviceId;
    } catch (error) {
      throw this.handleError(error, 'CONNECTION_FAILED', deviceId);
    }
  }

  async disconnect(deviceId?: string): Promise<void> {
    const id = deviceId || this.connectedDeviceId;
    if (!id) return;

    try {
      await NativeModule.disconnect(id);
      if (this.connectedDeviceId === id) {
        this.connectedDeviceId = null;
      }
    } catch (error) {
      throw this.handleError(error, 'DISCONNECTION_FAILED', id);
    }
  }

  async getConnectionStatus(deviceId?: string): Promise<ConnectionStatus> {
    const id = deviceId || this.connectedDeviceId;
    if (!id) return 'disconnected';

    try {
      return await NativeModule.getConnectionStatus(id);
    } catch (error) {
      this.handleError(error, 'UNKNOWN', id);
      return 'disconnected';
    }
  }

  async verifyPassword(password: string = '0000', is24Hour: boolean = false): Promise<PasswordData> {
    return normalizePasswordData(await NativeModule.verifyPassword(password, is24Hour));
  }

  async readBattery(): Promise<BatteryInfo> {
    return normalizeBatteryInfo(await NativeModule.readBattery());
  }

  async syncPersonalInfo(info: PersonalInfo): Promise<boolean> {
    return NativeModule.syncPersonalInfo(info);
  }

  async readDeviceFunctions(): Promise<DeviceFunctions> {
    return normalizeDeviceFunctions(await NativeModule.readDeviceFunctions());
  }

  async readSocialMsgData(): Promise<SocialMsgData> {
    return normalizeSocialMsgData(await NativeModule.readSocialMsgData());
  }

  async readDeviceVersion(): Promise<DeviceVersion> {
    return normalizeDeviceVersion(await NativeModule.readDeviceVersion());
  }

  async startReadOriginData(): Promise<void> {
    return NativeModule.startReadOriginData();
  }

  async readDeviceAllData(): Promise<boolean> {
    return NativeModule.readDeviceAllData();
  }

  async readSleepData(date?: string): Promise<SleepData[]> {
    return normalizeSleepDataList(await NativeModule.readSleepData(date));
  }

  async readSportStepData(date?: string): Promise<SportStepData> {
    return normalizeSportStepData(await NativeModule.readSportStepData(date));
  }

  async readOriginData(dayOffset: number = 0): Promise<OriginData[]> {
    return normalizeOriginDataList(await NativeModule.readOriginData(dayOffset));
  }

  async readDaySummaryData(dayOffset: number = 0): Promise<DaySummaryData> {
    return normalizeDaySummaryData(await NativeModule.readDaySummaryData(dayOffset));
  }

  async readAutoMeasureSetting(): Promise<AutoMeasureSetting[]> {
    return normalizeAutoMeasureSettings(await NativeModule.readAutoMeasureSetting());
  }

  async modifyAutoMeasureSetting(setting: Partial<AutoMeasureSetting>): Promise<AutoMeasureSetting[]> {
    return normalizeAutoMeasureSettings(await NativeModule.modifyAutoMeasureSetting(setting));
  }

  async setLanguage(language: Language): Promise<boolean> {
    return NativeModule.setLanguage(language);
  }

  async startHeartRateTest(): Promise<void> {
    return NativeModule.startHeartRateTest();
  }

  async stopHeartRateTest(): Promise<void> {
    return NativeModule.stopHeartRateTest();
  }

  async startBloodPressureTest(): Promise<void> {
    return NativeModule.startBloodPressureTest();
  }

  async stopBloodPressureTest(): Promise<void> {
    return NativeModule.stopBloodPressureTest();
  }

  async startBloodOxygenTest(): Promise<void> {
    return NativeModule.startBloodOxygenTest();
  }

  async stopBloodOxygenTest(): Promise<void> {
    return NativeModule.stopBloodOxygenTest();
  }

  async startTemperatureTest(): Promise<void> {
    return NativeModule.startTemperatureTest();
  }

  async stopTemperatureTest(): Promise<void> {
    return NativeModule.stopTemperatureTest();
  }

  async startStressTest(): Promise<void> {
    return NativeModule.startStressTest();
  }

  async stopStressTest(): Promise<void> {
    return NativeModule.stopStressTest();
  }

  async startBloodGlucoseTest(): Promise<void> {
    return NativeModule.startBloodGlucoseTest();
  }

  async stopBloodGlucoseTest(): Promise<void> {
    return NativeModule.stopBloodGlucoseTest();
  }

  isScanningActive(): boolean {
    return this.isScanning;
  }

  isSDKInitialized(): boolean {
    return this.isInitialized;
  }

  getConnectedDeviceId(): string | null {
    return this.connectedDeviceId;
  }

  on<K extends VeepooEvent>(
    event: K,
    listener: (payload: VeepooEventPayload[K]) => void
  ): this {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(listener as EventListener);
    return this;
  }

  off<K extends VeepooEvent>(
    event: K,
    listener: (payload: VeepooEventPayload[K]) => void
  ): this {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.delete(listener as EventListener);
    }
    return this;
  }

  once<K extends VeepooEvent>(
    event: K,
    listener: (payload: VeepooEventPayload[K]) => void
  ): this {
    const onceWrapper: EventListener = (payload) => {
      this.off(event, listener);
      (listener as EventListener)(payload);
    };
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(onceWrapper);
    return this;
  }

  removeAllListeners(event?: VeepooEvent): this {
    if (event) {
      this.listeners.delete(event);
    } else {
      this.listeners.clear();
    }
    return this;
  }

  destroy(): void {
    this.nativeSubscriptions.forEach((subscription) => {
      subscription.remove();
    });
    this.nativeSubscriptions = [];
    this.listeners.clear();
    this.eventListenersSetup = false;
    this.isScanning = false;
    this.connectedDeviceId = null;
    this.isInitialized = false;
  }
}

const sdk = new VeepooSDK();
export default sdk;
