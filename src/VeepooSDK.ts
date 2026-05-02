import type { EventSubscription } from "expo-modules-core";
import { Platform } from "react-native";

import type {
  ConnectionStatus,
  DeviceAlarm,
  OperationStatus,
  ScanOptions,
  ConnectOptions,
  LogEntry,
  LogLevel,
  LogScope,
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
  EcgTestOptions,
} from "./types/index.js";
import type { NativeVeepooSDKInterface } from "./NativeVeepooSDK.js";
import { NativeVeepooSDK } from "./NativeVeepooSDK.js";
import type { VeepooSDKModuleInterface, LogListener } from "./VeepooSDKModule.js";
import { validateDeviceId, validateConnectOptions, validatePersonalInfo, validateAutoMeasureSetting, validateAlarm, validateDeleteAlarm, validateSocialMsgData, validateDeviceTime } from "./validators/index.js";
import {
  normalizeAlarmList,
  normalizeAutoMeasureSettings,
  normalizeBatteryInfo,
  normalizeDaySummaryData,
  normalizeDeviceFunctions,
  normalizeDeviceVersion,
  normalizeOriginDataList,
  normalizePasswordData,
  normalizePermissionsResult,
  normalizeSleepDataList,
  normalizeSocialMsgData,
  normalizeSportStepData,
  normalizeEventPayload,
} from "./normalizers/index.js";

type EventListener = (payload: unknown) => void;

export class VeepooSDK implements VeepooSDKModuleInterface {
  private readonly native: NativeVeepooSDKInterface;
  private isScanning = false;
  private isInitialized = false;
  private connectedDeviceId: string | null = null;
  private eventListenersSetup = false;
  private lastReadOriginProgressByDevice: Map<string, number> = new Map();
  private logEnabled = false;
  private logger: LogListener | null = null;
  private listeners: Map<VeepooEvent, Set<EventListener>> = new Map();
  private nativeSubscriptions: EventSubscription[] = [];

  constructor(native: NativeVeepooSDKInterface = NativeVeepooSDK) {
    this.native = native;
  }

  private getPlatform(): LogEntry["platform"] {
    if (
      Platform.OS === "ios" ||
      Platform.OS === "android" ||
      Platform.OS === "web"
    ) {
      return Platform.OS;
    }
    return "unknown";
  }

  private log(
    level: LogLevel,
    scope: LogScope,
    action: string,
    message: string,
    options?: {
      deviceId?: string;
      data?: unknown;
      error?: unknown;
    },
  ): void {
    if (!this.logEnabled && !this.logger) return;

    const entry: LogEntry = {
      timestamp: Date.now(),
      level,
      scope,
      action,
      platform: this.getPlatform(),
      message,
      deviceId: options?.deviceId,
      data: options?.data,
      error:
        options?.error instanceof Error
          ? options.error.message
          : typeof options?.error === "string"
          ? options.error
          : undefined,
    };

    if (this.logEnabled && (typeof __DEV__ === 'undefined' || __DEV__)) {
      const consoleMethod =
        level === "error"
          ? console.error
          : level === "warn"
          ? console.warn
          : level === "info"
          ? console.info
          : console.debug;
      consoleMethod("[VeepooSDK]", entry);
    }

    if (this.logger) {
      try {
        this.logger(entry);
      } catch (error) {
        if (this.logEnabled) {
          console.error("[VeepooSDK]", {
            timestamp: Date.now(),
            level: "error",
            scope: "listener",
            action: "logger.callback.failed",
            platform: this.getPlatform(),
            message: "Logger callback failed",
            error: error instanceof Error ? error.message : String(error),
          } satisfies LogEntry);
        }
      }
    }
  }

  private setupEventListeners(): void {
    if (this.eventListenersSetup) return;
    this.eventListenersSetup = true;

    const events: VeepooEvent[] = [
      "deviceFound",
      "deviceConnected",
      "deviceDisconnected",
      "deviceConnectStatus",
      "deviceReady",
      "bluetoothStateChanged",
      "deviceFunction",
      "deviceVersion",
      "passwordData",
      "socialMsgData",
      "readOriginProgress",
      "readOriginComplete",
      "originFiveMinuteData",
      "originHalfHourData",
      "sleepData",
      "sportStepData",
      "heartRateTestResult",
      "bloodPressureTestResult",
      "bloodOxygenTestResult",
      "temperatureTestResult",
      "stressData",
      "bloodGlucoseData",
      "hrvTestResult",
      "ecgTestResult",
      "fatigueTestResult",
      "breathingTestResult",
      "batteryData",
      "connectionStatusChanged",
      "originSpo2Data",
      "alarmData",
      "error",
    ];

    events.forEach(event => {
      const subscription = this.native.addListener(
        event,
        (payload: unknown) => {
          this.emitLocal(event, payload);
        },
      );
      this.nativeSubscriptions.push(subscription);
    });
  }

  private emitLocal(event: VeepooEvent, payload: unknown): void {
    const normalizedPayload = normalizeEventPayload(event, payload);

    if (
      event === "readOriginProgress" &&
      this.isEventRecord(normalizedPayload) &&
      this.isEventRecord(normalizedPayload.progress)
    ) {
      const deviceId =
        this.getPayloadDeviceId(normalizedPayload) ?? "__default__";
      const progressValue = normalizedPayload.progress.progress;
      const readState = normalizedPayload.progress.readState;
      const lastProgress = this.lastReadOriginProgressByDevice.get(deviceId);

      if (typeof progressValue === "number" && Number.isFinite(progressValue)) {
        if (
          readState === "start" ||
          lastProgress === undefined ||
          progressValue < lastProgress
        ) {
          this.lastReadOriginProgressByDevice.set(deviceId, progressValue);
        } else if (progressValue === lastProgress) {
          return;
        } else {
          this.lastReadOriginProgressByDevice.set(deviceId, progressValue);
        }
      }
    }

    this.log(
      "debug",
      this.getEventScope(event),
      `event.${event}`,
      `Received ${event} event`,
      {
        deviceId: this.getPayloadDeviceId(normalizedPayload),
        data: normalizedPayload,
      },
    );

    if (event === "bluetoothStateChanged") {
      const bluetoothStatus = normalizedPayload as { isScanning?: boolean };
      if (typeof bluetoothStatus.isScanning === "boolean") {
        this.isScanning = bluetoothStatus.isScanning;
      }
    }

    if (event === "deviceConnected") {
      const device = normalizedPayload as { deviceId?: string };
      if (typeof device.deviceId === "string" && device.deviceId.length > 0) {
        this.connectedDeviceId = device.deviceId;
      }
    }

    if (event === "deviceDisconnected") {
      const device = normalizedPayload as { deviceId?: string };
      if (!device.deviceId || this.connectedDeviceId === device.deviceId) {
        this.connectedDeviceId = null;
      }
      if (device.deviceId) {
        this.lastReadOriginProgressByDevice.delete(device.deviceId);
      }
      this.isScanning = false;
    }

    if (
      event === "deviceConnectStatus" ||
      event === "connectionStatusChanged"
    ) {
      const connection = normalizedPayload as {
        deviceId?: string;
        status?: ConnectionStatus;
      };
      if (
        connection.status === "disconnected" &&
        (!connection.deviceId || this.connectedDeviceId === connection.deviceId)
      ) {
        this.connectedDeviceId = null;
      }
    }

    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach(listener => {
        try {
          listener(normalizedPayload);
        } catch (e) {
          this.log(
            "error",
            "listener",
            `listener.${event}.failed`,
            `Event listener for ${event} threw`,
            {
              deviceId: this.getPayloadDeviceId(normalizedPayload),
              error: e,
              data: normalizedPayload,
            },
          );
          console.error(`Error in event listener for ${event}:`, e);
        }
      });
    }
  }

  private getEventScope(event: VeepooEvent): LogScope {
    if (event === "deviceFound") return "scan";
    if (event === "bluetoothStateChanged") return "bluetooth";
    if (
      event === "deviceConnected" ||
      event === "deviceDisconnected" ||
      event === "deviceConnectStatus" ||
      event === "deviceReady" ||
      event === "connectionStatusChanged"
    ) {
      return "connection";
    }
    if (
      event === "readOriginProgress" ||
      event === "readOriginComplete" ||
      event === "originFiveMinuteData" ||
      event === "originHalfHourData" ||
      event === "sleepData" ||
      event === "sportStepData"
    ) {
      return "read";
    }
    if (
      event === "heartRateTestResult" ||
      event === "bloodPressureTestResult" ||
      event === "bloodOxygenTestResult" ||
      event === "temperatureTestResult" ||
      event === "stressData" ||
      event === "bloodGlucoseData" ||
      event === "hrvTestResult" ||
      event === "ecgTestResult" ||
      event === "fatigueTestResult" ||
      event === "breathingTestResult"
    ) {
      return "test";
    }
    if (event === "error") return "sdk";
    return "device";
  }

  private getPayloadDeviceId(payload: unknown): string | undefined {
    if (typeof payload !== "object" || payload === null) {
      return undefined;
    }
    const deviceId = (payload as { deviceId?: unknown }).deviceId;
    return typeof deviceId === "string" && deviceId.length > 0
      ? deviceId
      : undefined;
  }

  private isEventRecord(payload: unknown): payload is Record<string, any> {
    return typeof payload === "object" && payload !== null;
  }

  private handleError(
    error: unknown,
    code: VeepooError["code"],
    deviceId?: string,
  ): VeepooError {
    const veepooError: VeepooError = {
      code,
      message: error instanceof Error ? error.message : String(error),
      deviceId,
    };
    this.log("error", "sdk", `error.${code}`, veepooError.message, {
      deviceId,
      error,
    });
    this.emitLocal("error", veepooError);
    return veepooError;
  }

  async init(): Promise<void> {
    if (this.isInitialized) return;
    this.log("info", "sdk", "init.start", "Initializing SDK");
    this.setupEventListeners();
    await this.native.init();
    this.isInitialized = true;
    this.log("info", "sdk", "init.success", "SDK initialized");
  }

  async checkBluetoothStatus(): Promise<boolean> {
    try {
      const enabled = await this.native.isBluetoothEnabled();
      this.log(
        "debug",
        "bluetooth",
        "bluetooth.check",
        "Checked Bluetooth status",
        {
          data: { enabled },
        },
      );
      return enabled;
    } catch (error) {
      this.handleError(error, "UNKNOWN");
      return false;
    }
  }

  async requestPermissions(): Promise<PermissionsResult> {
    try {
      const result = normalizePermissionsResult(
        await this.native.requestPermissions(),
      );
      this.log(
        "info",
        "permissions",
        "permissions.request",
        "Requested Bluetooth permissions",
        {
          data: result,
        },
      );
      return result;
    } catch (error) {
      this.handleError(error, "PERMISSION_DENIED");
      return { granted: false, status: "denied", canAskAgain: true };
    }
  }

  async startScan(options?: ScanOptions): Promise<void> {
    if (this.isScanning) return;

    try {
      this.isScanning = true;
      this.log("info", "scan", "scan.start", "Starting device scan", {
        data: options,
      });
      await this.native.startScan(options);
    } catch (error) {
      this.isScanning = false;
      throw this.handleError(error, "UNKNOWN");
    }
  }

  async stopScan(): Promise<void> {
    if (!this.isScanning) return;

    try {
      await this.native.stopScan();
      this.isScanning = false;
      this.log("info", "scan", "scan.stop", "Stopped device scan");
    } catch (error) {
      this.isScanning = false;
      throw this.handleError(error, "UNKNOWN");
    }
  }

  async connect(deviceId: string, options?: ConnectOptions): Promise<void> {
    validateDeviceId(deviceId);
    if (options) validateConnectOptions(options);
    try {
      this.log("info", "connection", "connect.start", "Connecting device", {
        deviceId,
        data: options,
      });
      await this.native.connect(deviceId, options);
      this.connectedDeviceId = deviceId;
      this.log(
        "info",
        "connection",
        "connect.success",
        "Device connect request completed",
        {
          deviceId,
        },
      );
    } catch (error) {
      throw this.handleError(error, "CONNECTION_FAILED", deviceId);
    }
  }

  async disconnect(deviceId?: string): Promise<void> {
    const id = deviceId || this.connectedDeviceId;
    if (!id) return;

    try {
      this.log(
        "info",
        "connection",
        "disconnect.start",
        "Disconnecting device",
        {
          deviceId: id,
        },
      );
      await this.native.disconnect(id);
      if (this.connectedDeviceId === id) {
        this.connectedDeviceId = null;
      }
      this.log(
        "info",
        "connection",
        "disconnect.success",
        "Device disconnected",
        {
          deviceId: id,
        },
      );
    } catch (error) {
      throw this.handleError(error, "DISCONNECTION_FAILED", id);
    }
  }

  async getConnectionStatus(deviceId?: string): Promise<ConnectionStatus> {
    const id = deviceId || this.connectedDeviceId;
    if (!id) return "disconnected";

    try {
      const status = await this.native.getConnectionStatus(id);
      this.log(
        "debug",
        "connection",
        "connection.status",
        "Fetched connection status",
        {
          deviceId: id,
          data: { status },
        },
      );
      return status;
    } catch (error) {
      this.handleError(error, "UNKNOWN", id);
      return "disconnected";
    }
  }

  async verifyPassword(
    password: string = "0000",
    is24Hour: boolean = false,
  ): Promise<PasswordData> {
    this.log(
      "info",
      "connection",
      "password.verify.start",
      "Verifying device password",
      {
        deviceId: this.connectedDeviceId ?? undefined,
        data: { is24Hour },
      },
    );
    const result = normalizePasswordData(
      await this.native.verifyPassword(password, is24Hour),
    );
    this.log(
      "info",
      "connection",
      "password.verify.result",
      "Device password verified",
      {
        deviceId: this.connectedDeviceId ?? undefined,
        data: {
          status: result.status,
          deviceNumber: result.deviceNumber,
          deviceVersion: result.deviceVersion,
        },
      },
    );
    return result;
  }

  async readBattery(): Promise<BatteryInfo> {
    this.log("debug", "device", "battery.read.start", "Reading battery info", {
      deviceId: this.connectedDeviceId ?? undefined,
    });
    const result = normalizeBatteryInfo(await this.native.readBattery());
    this.log(
      "debug",
      "device",
      "battery.read.result",
      "Battery info received",
      {
        deviceId: this.connectedDeviceId ?? undefined,
        data: result,
      },
    );
    return result;
  }

  syncPersonalInfo = (info: PersonalInfo): Promise<boolean> => {
    validatePersonalInfo(info);
    return this.native.syncPersonalInfo(info);
  };

  async readDeviceFunctions(): Promise<DeviceFunctions> {
    const result = normalizeDeviceFunctions(
      await this.native.readDeviceFunctions(),
    );
    this.log(
      "debug",
      "device",
      "device.functions.read",
      "Device functions received",
      {
        deviceId: this.connectedDeviceId ?? undefined,
        data: result,
      },
    );
    return result;
  }

  async readSocialMsgData(): Promise<SocialMsgData> {
    const result = normalizeSocialMsgData(
      await this.native.readSocialMsgData(),
    );
    this.log(
      "debug",
      "device",
      "device.social.read",
      "Social message settings received",
      {
        deviceId: this.connectedDeviceId ?? undefined,
        data: result,
      },
    );
    return result;
  }

  async writeSocialMsgData(data: Partial<SocialMsgData>): Promise<OperationStatus> {
    validateSocialMsgData(data);
    return this.native.writeSocialMsgData(data);
  }

  async readDeviceVersion(): Promise<DeviceVersion> {
    const result = normalizeDeviceVersion(
      await this.native.readDeviceVersion(),
    );
    this.log(
      "debug",
      "device",
      "device.version.read",
      "Device version received",
      {
        deviceId: this.connectedDeviceId ?? undefined,
        data: result,
      },
    );
    return result;
  }

  startReadOriginData = (): Promise<void> =>
    this.loggedVoidCall("read", "read.origin.start", "Starting origin data read", () => this.native.startReadOriginData());

  readDeviceAllData = (): Promise<boolean> => this.native.readDeviceAllData();

  async readSleepData(date?: string): Promise<SleepData[]> {
    const result = normalizeSleepDataList(
      await this.native.readSleepData(date),
    );
    this.log("debug", "read", "read.sleep.result", "Sleep data received", {
      deviceId: this.connectedDeviceId ?? undefined,
      data: { date, count: result.length },
    });
    return result;
  }

  async readSportStepData(date?: string): Promise<SportStepData> {
    const result = normalizeSportStepData(
      await this.native.readSportStepData(date),
    );
    this.log("debug", "read", "read.sport.result", "Sport step data received", {
      deviceId: this.connectedDeviceId ?? undefined,
      data: result,
    });
    return result;
  }

  async readOriginData(dayOffset: number = 0): Promise<OriginData[]> {
    const result = normalizeOriginDataList(
      await this.native.readOriginData(dayOffset),
    );
    this.log("debug", "read", "read.origin.result", "Origin data received", {
      deviceId: this.connectedDeviceId ?? undefined,
      data: { dayOffset, count: result.length },
    });
    return result;
  }

  async readDaySummaryData(dayOffset: number = 0): Promise<DaySummaryData> {
    const result = normalizeDaySummaryData(
      await this.native.readDaySummaryData(dayOffset),
    );
    this.log(
      "debug",
      "read",
      "read.summary.result",
      "Day summary data received",
      {
        deviceId: this.connectedDeviceId ?? undefined,
        data: { dayOffset, date: result.date },
      },
    );
    return result;
  }

  async readAutoMeasureSetting(): Promise<AutoMeasureSetting[]> {
    const result = normalizeAutoMeasureSettings(
      await this.native.readAutoMeasureSetting(),
    );
    this.log(
      "debug",
      "device",
      "autoMeasure.read",
      "Auto measure settings received",
      {
        deviceId: this.connectedDeviceId ?? undefined,
        data: { count: result.length },
      },
    );
    return result;
  }

  async modifyAutoMeasureSetting(
    setting: Partial<AutoMeasureSetting>,
  ): Promise<AutoMeasureSetting[]> {
    validateAutoMeasureSetting(setting);
    this.log(
      "info",
      "device",
      "autoMeasure.modify.start",
      "Modifying auto measure settings",
      {
        deviceId: this.connectedDeviceId ?? undefined,
        data: setting,
      },
    );
    const result = normalizeAutoMeasureSettings(
      await this.native.modifyAutoMeasureSetting(setting),
    );
    this.log(
      "info",
      "device",
      "autoMeasure.modify.result",
      "Auto measure settings updated",
      {
        deviceId: this.connectedDeviceId ?? undefined,
        data: { count: result.length },
      },
    );
    return result;
  }

  setLanguage = (language: Language): Promise<boolean> => this.native.setLanguage(language);

  async setDeviceTime(time?: Date): Promise<boolean> {
    validateDeviceTime(time);
    return this.native.setDeviceTime(
      time === undefined ? undefined : {
        year: time.getFullYear(),
        month: time.getMonth() + 1,
        day: time.getDate(),
        hour: time.getHours(),
        minute: time.getMinutes(),
        second: time.getSeconds(),
      }
    );
  }

  async readAlarms(): Promise<DeviceAlarm[]> {
    const raw = await this.native.readAlarms();
    const alarms = normalizeAlarmList(raw);
    this.emitLocal('alarmData', { deviceId: this.connectedDeviceId, alarms: raw });
    return alarms;
  }

  async setAlarm(alarm: DeviceAlarm): Promise<OperationStatus> {
    validateAlarm(alarm);
    return this.native.setAlarm(alarm);
  }

  async deleteAlarm(alarmId: number): Promise<OperationStatus> {
    validateDeleteAlarm(alarmId);
    return this.native.deleteAlarm(alarmId);
  }

  private loggedVoidCall(
    scope: LogScope,
    action: string,
    message: string,
    fn: () => Promise<void>,
  ): Promise<void> {
    this.log("info", scope, action, message, { deviceId: this.connectedDeviceId ?? undefined });
    return fn();
  }

  startHeartRateTest = (): Promise<void> =>
    this.loggedVoidCall("test", "test.heartRate.start", "Starting heart rate test", () => this.native.startHeartRateTest());

  stopHeartRateTest = (): Promise<void> =>
    this.loggedVoidCall("test", "test.heartRate.stop", "Stopping heart rate test", () => this.native.stopHeartRateTest());

  startBloodPressureTest = (): Promise<void> =>
    this.loggedVoidCall("test", "test.bloodPressure.start", "Starting blood pressure test", () => this.native.startBloodPressureTest());

  stopBloodPressureTest = (): Promise<void> =>
    this.loggedVoidCall("test", "test.bloodPressure.stop", "Stopping blood pressure test", () => this.native.stopBloodPressureTest());

  startBloodOxygenTest = (): Promise<void> =>
    this.loggedVoidCall("test", "test.bloodOxygen.start", "Starting blood oxygen test", () => this.native.startBloodOxygenTest());

  stopBloodOxygenTest = (): Promise<void> =>
    this.loggedVoidCall("test", "test.bloodOxygen.stop", "Stopping blood oxygen test", () => this.native.stopBloodOxygenTest());

  startTemperatureTest = (): Promise<void> =>
    this.loggedVoidCall("test", "test.temperature.start", "Starting temperature test", () => this.native.startTemperatureTest());

  stopTemperatureTest = (): Promise<void> =>
    this.loggedVoidCall("test", "test.temperature.stop", "Stopping temperature test", () => this.native.stopTemperatureTest());

  startStressTest = (): Promise<void> =>
    this.loggedVoidCall("test", "test.stress.start", "Starting stress test", () => this.native.startStressTest());

  stopStressTest = (): Promise<void> =>
    this.loggedVoidCall("test", "test.stress.stop", "Stopping stress test", () => this.native.stopStressTest());

  startBloodGlucoseTest = (): Promise<void> =>
    this.loggedVoidCall("test", "test.bloodGlucose.start", "Starting blood glucose test", () => this.native.startBloodGlucoseTest());

  stopBloodGlucoseTest = (): Promise<void> =>
    this.loggedVoidCall("test", "test.bloodGlucose.stop", "Stopping blood glucose test", () => this.native.stopBloodGlucoseTest());

  startHrvTest = (): Promise<void> =>
    this.loggedVoidCall("test", "test.hrv.start", "Starting HRV test", () => this.native.startHrvTest());

  stopHrvTest = (): Promise<void> =>
    this.loggedVoidCall("test", "test.hrv.stop", "Stopping HRV test", () => this.native.stopHrvTest());

  async startEcgTest(options?: EcgTestOptions): Promise<void> {
    this.log("info", "test", "test.ecg.start", "Starting ECG test", {
      deviceId: this.connectedDeviceId ?? undefined,
      data: options,
    });
    await this.native.startEcgTest(options);
  }

  stopEcgTest = (): Promise<void> =>
    this.loggedVoidCall("test", "test.ecg.stop", "Stopping ECG test", () => this.native.stopEcgTest());

  startFatigueTest = (): Promise<void> =>
    this.loggedVoidCall("test", "test.fatigue.start", "Starting fatigue test", () => this.native.startFatigueTest());

  stopFatigueTest = (): Promise<void> =>
    this.loggedVoidCall("test", "test.fatigue.stop", "Stopping fatigue test", () => this.native.stopFatigueTest());

  startBreathingTest = (): Promise<void> =>
    this.loggedVoidCall("test", "test.breathing.start", "Starting breathing test", () => this.native.startBreathingTest());

  stopBreathingTest = (): Promise<void> =>
    this.loggedVoidCall("test", "test.breathing.stop", "Stopping breathing test", () => this.native.stopBreathingTest());

  setLogEnabled(enabled: boolean): this {
    this.logEnabled = enabled;
    this.log(
      "info",
      "sdk",
      "logger.toggle",
      enabled ? "SDK logging enabled" : "SDK logging disabled",
    );
    return this;
  }

  isLogEnabled(): boolean {
    return this.logEnabled;
  }

  setLogger(logger: LogListener | null): this {
    this.logger = logger;
    this.log(
      "debug",
      "sdk",
      "logger.set",
      logger ? "Custom logger attached" : "Custom logger cleared",
    );
    return this;
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
    listener: (payload: VeepooEventPayload[K]) => void,
  ): this {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(listener as EventListener);
    return this;
  }

  off<K extends VeepooEvent>(
    event: K,
    listener: (payload: VeepooEventPayload[K]) => void,
  ): this {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.delete(listener as EventListener);
    }
    return this;
  }

  once<K extends VeepooEvent>(
    event: K,
    listener: (payload: VeepooEventPayload[K]) => void,
  ): this {
    let wrapper!: EventListener;
    wrapper = payload => {
      this.listeners.get(event)?.delete(wrapper);
      (listener as EventListener)(payload);
    };
    if (!this.listeners.has(event)) this.listeners.set(event, new Set());
    this.listeners.get(event)!.add(wrapper);
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
    this.log("info", "sdk", "destroy", "Destroying SDK instance");
    this.nativeSubscriptions.forEach(subscription => {
      subscription.remove();
    });
    this.nativeSubscriptions = [];
    this.listeners.clear();
    this.lastReadOriginProgressByDevice.clear();
    this.eventListenersSetup = false;
    this.isScanning = false;
    this.connectedDeviceId = null;
    this.isInitialized = false;
    this.logger = null;
    this.logEnabled = false;
  }
}

const sdk = new VeepooSDK();
export default sdk;
