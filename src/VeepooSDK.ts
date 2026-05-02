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
  HeartRateAlarm,
} from "./types/index.js";
import type { NativeVeepooSDKInterface } from "./NativeVeepooSDK.js";
import { NativeVeepooSDK } from "./NativeVeepooSDK.js";
import type { VeepooSDKModuleInterface, LogListener } from "./VeepooSDKModule.js";
import { validateDeviceId, validateConnectOptions, validatePersonalInfo, validateAutoMeasureSetting, validateAlarm, validateDeleteAlarm, validateSocialMsgData, validateDeviceTime, validateHeartRateAlarm } from "./validators/index.js";
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
  normalizeHeartRateAlarm,
} from "./normalizers/index.js";
import { mapNativeRejection } from "./errors/map-native-rejection.js";
import { invokeNative } from "./bridge/native-invoke-pipeline.js";

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
    fallbackCode: VeepooError["code"],
    deviceId?: string,
  ): VeepooError {
    const veepooError = mapNativeRejection(error, { fallbackCode, deviceId });
    this.log("error", "sdk", `error.${veepooError.code}`, veepooError.message, {
      deviceId: veepooError.deviceId,
      error,
    });
    this.emitLocal("error", veepooError);
    return veepooError;
  }

  private nativeOpFailed(error: unknown): never {
    throw this.handleError(
      error,
      "OPERATION_FAILED",
      this.connectedDeviceId ?? undefined,
    );
  }

  async init(): Promise<void> {
    if (this.isInitialized) return;
    this.log("info", "sdk", "init.start", "Initializing SDK");
    this.setupEventListeners();
    await invokeNative({
      invoke: () => this.native.init(),
      fallbackCode: "UNKNOWN",
      throwMapped: (error: unknown) => {
        throw this.handleError(error, "UNKNOWN");
      },
      afterSuccess: () => {
        this.isInitialized = true;
        this.log("info", "sdk", "init.success", "SDK initialized");
      },
    });
  }

  async checkBluetoothStatus(): Promise<boolean> {
    return invokeNative({
      invoke: () => this.native.isBluetoothEnabled(),
      fallbackCode: "UNKNOWN",
      recover: (error: unknown) => {
        this.handleError(error, "UNKNOWN");
        return false;
      },
      afterSuccess: (enabled: boolean) => {
        this.log(
          "debug",
          "bluetooth",
          "bluetooth.check",
          "Checked Bluetooth status",
          {
            data: { enabled },
          },
        );
      },
    });
  }

  async requestPermissions(): Promise<PermissionsResult> {
    return invokeNative({
      invoke: () => this.native.requestPermissions(),
      normalize: normalizePermissionsResult,
      fallbackCode: "PERMISSION_DENIED",
      recover: (error: unknown) => {
        this.handleError(error, "PERMISSION_DENIED");
        return { granted: false, status: "denied", canAskAgain: true };
      },
      afterSuccess: (result: PermissionsResult) => {
        this.log(
          "info",
          "permissions",
          "permissions.request",
          "Requested Bluetooth permissions",
          {
            data: result,
          },
        );
      },
    });
  }

  async startScan(options?: ScanOptions): Promise<void> {
    if (this.isScanning) return;

    this.isScanning = true;
    try {
      this.log("info", "scan", "scan.start", "Starting device scan", {
        data: options,
      });
      await invokeNative({
        invoke: () => this.native.startScan(options),
        fallbackCode: "UNKNOWN",
        throwMapped: (error: unknown) => {
          throw this.handleError(error, "UNKNOWN");
        },
      });
    } catch (e) {
      this.isScanning = false;
      throw e;
    }
  }

  async stopScan(): Promise<void> {
    if (!this.isScanning) return;

    try {
      await invokeNative({
        invoke: () => this.native.stopScan(),
        fallbackCode: "UNKNOWN",
        throwMapped: (error: unknown) => {
          throw this.handleError(error, "UNKNOWN");
        },
      });
      this.isScanning = false;
      this.log("info", "scan", "scan.stop", "Stopped device scan");
    } catch (e) {
      this.isScanning = false;
      throw e;
    }
  }

  async connect(deviceId: string, options?: ConnectOptions): Promise<void> {
    validateDeviceId(deviceId);
    if (options) validateConnectOptions(options);
    this.log("info", "connection", "connect.start", "Connecting device", {
      deviceId,
      data: options,
    });
    await invokeNative({
      invoke: () => this.native.connect(deviceId, options),
      fallbackCode: "CONNECTION_FAILED",
      deviceId,
      throwMapped: (error: unknown) => {
        throw this.handleError(error, "CONNECTION_FAILED", deviceId);
      },
      afterSuccess: () => {
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
      },
    });
  }

  async disconnect(deviceId?: string): Promise<void> {
    const id = deviceId || this.connectedDeviceId;
    if (!id) return;

    this.log("info", "connection", "disconnect.start", "Disconnecting device", {
      deviceId: id,
    });
    await invokeNative({
      invoke: () => this.native.disconnect(id),
      fallbackCode: "DISCONNECTION_FAILED",
      deviceId: id,
      throwMapped: (error: unknown) => {
        throw this.handleError(error, "DISCONNECTION_FAILED", id);
      },
      afterSuccess: () => {
        if (this.connectedDeviceId === id) {
          this.connectedDeviceId = null;
        }
        this.log("info", "connection", "disconnect.success", "Device disconnected", {
          deviceId: id,
        });
      },
    });
  }

  async getConnectionStatus(deviceId?: string): Promise<ConnectionStatus> {
    const id = deviceId || this.connectedDeviceId;
    if (!id) return "disconnected";

    return invokeNative({
      invoke: () => this.native.getConnectionStatus(id),
      fallbackCode: "UNKNOWN",
      deviceId: id,
      recover: (error: unknown) => {
        this.handleError(error, "UNKNOWN", id);
        return "disconnected";
      },
      afterSuccess: (status: ConnectionStatus) => {
        this.log("debug", "connection", "connection.status", "Fetched connection status", {
          deviceId: id,
          data: { status },
        });
      },
    });
  }

  async verifyPassword(
    password: string = "0000",
    is24Hour: boolean = false,
  ): Promise<PasswordData> {
    this.log("info", "connection", "password.verify.start", "Verifying device password", {
      deviceId: this.connectedDeviceId ?? undefined,
      data: { is24Hour },
    });
    return invokeNative({
      invoke: () => this.native.verifyPassword(password, is24Hour),
      normalize: normalizePasswordData,
      fallbackCode: "OPERATION_FAILED",
      deviceId: this.connectedDeviceId ?? undefined,
      throwMapped: (error: unknown) => {
        throw this.handleError(error, "OPERATION_FAILED", this.connectedDeviceId ?? undefined);
      },
      afterSuccess: (result: PasswordData) => {
        this.log("info", "connection", "password.verify.result", "Device password verified", {
          deviceId: this.connectedDeviceId ?? undefined,
          data: {
            status: result.status,
            deviceNumber: result.deviceNumber,
            deviceVersion: result.deviceVersion,
          },
        });
      },
    });
  }

  async readBattery(): Promise<BatteryInfo> {
    this.log("debug", "device", "battery.read.start", "Reading battery info", {
      deviceId: this.connectedDeviceId ?? undefined,
    });
    return invokeNative({
      invoke: () => this.native.readBattery(),
      normalize: normalizeBatteryInfo,
      fallbackCode: "OPERATION_FAILED",
      deviceId: this.connectedDeviceId ?? undefined,
      throwMapped: (e: unknown) => this.nativeOpFailed(e),
      afterSuccess: (result: BatteryInfo) => {
        this.log("debug", "device", "battery.read.result", "Battery info received", {
          deviceId: this.connectedDeviceId ?? undefined,
          data: result,
        });
      },
    });
  }

  syncPersonalInfo = (info: PersonalInfo): Promise<boolean> =>
    invokeNative({
      validate: () => validatePersonalInfo(info),
      invoke: () => this.native.syncPersonalInfo(info),
      fallbackCode: "OPERATION_FAILED",
      deviceId: this.connectedDeviceId ?? undefined,
      throwMapped: (e: unknown) => this.nativeOpFailed(e),
    });

  async readDeviceFunctions(): Promise<DeviceFunctions> {
    return invokeNative({
      invoke: () => this.native.readDeviceFunctions(),
      normalize: normalizeDeviceFunctions,
      fallbackCode: "OPERATION_FAILED",
      deviceId: this.connectedDeviceId ?? undefined,
      throwMapped: (e: unknown) => this.nativeOpFailed(e),
      afterSuccess: (result: DeviceFunctions) => {
        this.log("debug", "device", "device.functions.read", "Device functions received", {
          deviceId: this.connectedDeviceId ?? undefined,
          data: result,
        });
      },
    });
  }

  async readSocialMsgData(): Promise<SocialMsgData> {
    return invokeNative({
      invoke: () => this.native.readSocialMsgData(),
      normalize: normalizeSocialMsgData,
      fallbackCode: "OPERATION_FAILED",
      deviceId: this.connectedDeviceId ?? undefined,
      throwMapped: (e: unknown) => this.nativeOpFailed(e),
      afterSuccess: (result: SocialMsgData) => {
        this.log("debug", "device", "device.social.read", "Social message settings received", {
          deviceId: this.connectedDeviceId ?? undefined,
          data: result,
        });
      },
    });
  }

  async writeSocialMsgData(data: Partial<SocialMsgData>): Promise<OperationStatus> {
    return invokeNative({
      validate: () => validateSocialMsgData(data),
      invoke: () => this.native.writeSocialMsgData(data),
      fallbackCode: "OPERATION_FAILED",
      deviceId: this.connectedDeviceId ?? undefined,
      throwMapped: (e: unknown) => this.nativeOpFailed(e),
    });
  }

  async readDeviceVersion(): Promise<DeviceVersion> {
    return invokeNative({
      invoke: () => this.native.readDeviceVersion(),
      normalize: normalizeDeviceVersion,
      fallbackCode: "OPERATION_FAILED",
      deviceId: this.connectedDeviceId ?? undefined,
      throwMapped: (e: unknown) => this.nativeOpFailed(e),
      afterSuccess: (result: DeviceVersion) => {
        this.log("debug", "device", "device.version.read", "Device version received", {
          deviceId: this.connectedDeviceId ?? undefined,
          data: result,
        });
      },
    });
  }

  startReadOriginData = (): Promise<void> => {
    this.log("info", "read", "read.origin.start", "Starting origin data read", {
      deviceId: this.connectedDeviceId ?? undefined,
    });
    return invokeNative({
      invoke: () => this.native.startReadOriginData(),
      fallbackCode: "OPERATION_FAILED",
      deviceId: this.connectedDeviceId ?? undefined,
      throwMapped: (e: unknown) => this.nativeOpFailed(e),
    });
  };

  readDeviceAllData = (): Promise<boolean> =>
    invokeNative({
      invoke: () => this.native.readDeviceAllData(),
      fallbackCode: "OPERATION_FAILED",
      deviceId: this.connectedDeviceId ?? undefined,
      throwMapped: (e: unknown) => this.nativeOpFailed(e),
    });

  async readSleepData(date?: string): Promise<SleepData[]> {
    return invokeNative({
      invoke: () => this.native.readSleepData(date),
      normalize: normalizeSleepDataList,
      fallbackCode: "OPERATION_FAILED",
      deviceId: this.connectedDeviceId ?? undefined,
      throwMapped: (e: unknown) => this.nativeOpFailed(e),
      afterSuccess: (result: SleepData[]) => {
        this.log("debug", "read", "read.sleep.result", "Sleep data received", {
          deviceId: this.connectedDeviceId ?? undefined,
          data: { date, count: result.length },
        });
      },
    });
  }

  async readSportStepData(date?: string): Promise<SportStepData> {
    return invokeNative({
      invoke: () => this.native.readSportStepData(date),
      normalize: normalizeSportStepData,
      fallbackCode: "OPERATION_FAILED",
      deviceId: this.connectedDeviceId ?? undefined,
      throwMapped: (e: unknown) => this.nativeOpFailed(e),
      afterSuccess: (result: SportStepData) => {
        this.log("debug", "read", "read.sport.result", "Sport step data received", {
          deviceId: this.connectedDeviceId ?? undefined,
          data: result,
        });
      },
    });
  }

  async readOriginData(dayOffset: number = 0): Promise<OriginData[]> {
    return invokeNative({
      invoke: () => this.native.readOriginData(dayOffset),
      normalize: normalizeOriginDataList,
      fallbackCode: "OPERATION_FAILED",
      deviceId: this.connectedDeviceId ?? undefined,
      throwMapped: (e: unknown) => this.nativeOpFailed(e),
      afterSuccess: (result: OriginData[]) => {
        this.log("debug", "read", "read.origin.result", "Origin data received", {
          deviceId: this.connectedDeviceId ?? undefined,
          data: { dayOffset, count: result.length },
        });
      },
    });
  }

  async readDaySummaryData(dayOffset: number = 0): Promise<DaySummaryData> {
    return invokeNative({
      invoke: () => this.native.readDaySummaryData(dayOffset),
      normalize: normalizeDaySummaryData,
      fallbackCode: "OPERATION_FAILED",
      deviceId: this.connectedDeviceId ?? undefined,
      throwMapped: (e: unknown) => this.nativeOpFailed(e),
      afterSuccess: (result: DaySummaryData) => {
        this.log("debug", "read", "read.summary.result", "Day summary data received", {
          deviceId: this.connectedDeviceId ?? undefined,
          data: { dayOffset, date: result.date },
        });
      },
    });
  }

  async readAutoMeasureSetting(): Promise<AutoMeasureSetting[]> {
    return invokeNative({
      invoke: () => this.native.readAutoMeasureSetting(),
      normalize: normalizeAutoMeasureSettings,
      fallbackCode: "OPERATION_FAILED",
      deviceId: this.connectedDeviceId ?? undefined,
      throwMapped: (e: unknown) => this.nativeOpFailed(e),
      afterSuccess: (result: AutoMeasureSetting[]) => {
        this.log("debug", "device", "autoMeasure.read", "Auto measure settings received", {
          deviceId: this.connectedDeviceId ?? undefined,
          data: { count: result.length },
        });
      },
    });
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
    return invokeNative({
      invoke: () => this.native.modifyAutoMeasureSetting(setting),
      normalize: normalizeAutoMeasureSettings,
      fallbackCode: "OPERATION_FAILED",
      deviceId: this.connectedDeviceId ?? undefined,
      throwMapped: (e: unknown) => this.nativeOpFailed(e),
      afterSuccess: (result: AutoMeasureSetting[]) => {
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
      },
    });
  }

  setLanguage = (language: Language): Promise<boolean> =>
    invokeNative({
      invoke: () => this.native.setLanguage(language),
      fallbackCode: "OPERATION_FAILED",
      deviceId: this.connectedDeviceId ?? undefined,
      throwMapped: (e: unknown) => this.nativeOpFailed(e),
    });

  async setDeviceTime(time?: Date): Promise<boolean> {
    validateDeviceTime(time);
    return invokeNative({
      invoke: () =>
        this.native.setDeviceTime(
          time === undefined ? undefined : {
            year: time.getFullYear(),
            month: time.getMonth() + 1,
            day: time.getDate(),
            hour: time.getHours(),
            minute: time.getMinutes(),
            second: time.getSeconds(),
          },
        ),
      fallbackCode: "OPERATION_FAILED",
      deviceId: this.connectedDeviceId ?? undefined,
      throwMapped: (e: unknown) => this.nativeOpFailed(e),
    });
  }

  async readAlarms(): Promise<DeviceAlarm[]> {
    return invokeNative({
      invoke: () => this.native.readAlarms(),
      normalize: normalizeAlarmList,
      fallbackCode: "OPERATION_FAILED",
      deviceId: this.connectedDeviceId ?? undefined,
      throwMapped: (e: unknown) => this.nativeOpFailed(e),
      afterSuccess: (alarms: DeviceAlarm[]) => {
        this.emitLocal("alarmData", { deviceId: this.connectedDeviceId, alarms });
      },
    });
  }

  async setAlarm(alarm: DeviceAlarm): Promise<OperationStatus> {
    return invokeNative({
      validate: () => validateAlarm(alarm),
      invoke: () => this.native.setAlarm(alarm),
      fallbackCode: "OPERATION_FAILED",
      deviceId: this.connectedDeviceId ?? undefined,
      throwMapped: (e: unknown) => this.nativeOpFailed(e),
    });
  }

  async deleteAlarm(alarmId: number): Promise<OperationStatus> {
    return invokeNative({
      validate: () => validateDeleteAlarm(alarmId),
      invoke: () => this.native.deleteAlarm(alarmId),
      fallbackCode: "OPERATION_FAILED",
      deviceId: this.connectedDeviceId ?? undefined,
      throwMapped: (e: unknown) => this.nativeOpFailed(e),
    });
  }

  async readHeartRateAlarm(): Promise<HeartRateAlarm> {
    return invokeNative({
      invoke: () => this.native.readHeartRateAlarm(),
      normalize: normalizeHeartRateAlarm,
      fallbackCode: "OPERATION_FAILED",
      deviceId: this.connectedDeviceId ?? undefined,
      throwMapped: (e: unknown) => this.nativeOpFailed(e),
      afterSuccess: (data: HeartRateAlarm) => {
        this.emitLocal("heartRateAlarmData", {
          deviceId: this.connectedDeviceId ?? "",
          data,
        });
      },
    });
  }

  async setHeartRateAlarm(alarm: HeartRateAlarm): Promise<OperationStatus> {
    return invokeNative({
      validate: () => validateHeartRateAlarm(alarm),
      invoke: () => this.native.setHeartRateAlarm(alarm),
      fallbackCode: "OPERATION_FAILED",
      deviceId: this.connectedDeviceId ?? undefined,
      throwMapped: (e: unknown) => this.nativeOpFailed(e),
      afterSuccess: () => {
        this.emitLocal("heartRateAlarmData", {
          deviceId: this.connectedDeviceId ?? "",
          data: alarm,
        });
      },
    });
  }

  private invokeRealtimeTestVoid(
    scope: LogScope,
    action: string,
    message: string,
    invoke: () => Promise<void>,
  ): Promise<void> {
    this.log("info", scope, action, message, { deviceId: this.connectedDeviceId ?? undefined });
    return invokeNative({
      invoke,
      fallbackCode: "OPERATION_FAILED",
      deviceId: this.connectedDeviceId ?? undefined,
      throwMapped: (e: unknown) => this.nativeOpFailed(e),
    });
  }

  startHeartRateTest = (): Promise<void> =>
    this.invokeRealtimeTestVoid("test", "test.heartRate.start", "Starting heart rate test", () => this.native.startHeartRateTest());

  stopHeartRateTest = (): Promise<void> =>
    this.invokeRealtimeTestVoid("test", "test.heartRate.stop", "Stopping heart rate test", () => this.native.stopHeartRateTest());

  startBloodPressureTest = (): Promise<void> =>
    this.invokeRealtimeTestVoid("test", "test.bloodPressure.start", "Starting blood pressure test", () => this.native.startBloodPressureTest());

  stopBloodPressureTest = (): Promise<void> =>
    this.invokeRealtimeTestVoid("test", "test.bloodPressure.stop", "Stopping blood pressure test", () => this.native.stopBloodPressureTest());

  startBloodOxygenTest = (): Promise<void> =>
    this.invokeRealtimeTestVoid("test", "test.bloodOxygen.start", "Starting blood oxygen test", () => this.native.startBloodOxygenTest());

  stopBloodOxygenTest = (): Promise<void> =>
    this.invokeRealtimeTestVoid("test", "test.bloodOxygen.stop", "Stopping blood oxygen test", () => this.native.stopBloodOxygenTest());

  startTemperatureTest = (): Promise<void> =>
    this.invokeRealtimeTestVoid("test", "test.temperature.start", "Starting temperature test", () => this.native.startTemperatureTest());

  stopTemperatureTest = (): Promise<void> =>
    this.invokeRealtimeTestVoid("test", "test.temperature.stop", "Stopping temperature test", () => this.native.stopTemperatureTest());

  startStressTest = (): Promise<void> =>
    this.invokeRealtimeTestVoid("test", "test.stress.start", "Starting stress test", () => this.native.startStressTest());

  stopStressTest = (): Promise<void> =>
    this.invokeRealtimeTestVoid("test", "test.stress.stop", "Stopping stress test", () => this.native.stopStressTest());

  startBloodGlucoseTest = (): Promise<void> =>
    this.invokeRealtimeTestVoid("test", "test.bloodGlucose.start", "Starting blood glucose test", () => this.native.startBloodGlucoseTest());

  stopBloodGlucoseTest = (): Promise<void> =>
    this.invokeRealtimeTestVoid("test", "test.bloodGlucose.stop", "Stopping blood glucose test", () => this.native.stopBloodGlucoseTest());

  startHrvTest = (): Promise<void> =>
    this.invokeRealtimeTestVoid("test", "test.hrv.start", "Starting HRV test", () => this.native.startHrvTest());

  stopHrvTest = (): Promise<void> =>
    this.invokeRealtimeTestVoid("test", "test.hrv.stop", "Stopping HRV test", () => this.native.stopHrvTest());

  async startEcgTest(options?: EcgTestOptions): Promise<void> {
    this.log("info", "test", "test.ecg.start", "Starting ECG test", {
      deviceId: this.connectedDeviceId ?? undefined,
      data: options,
    });
    await invokeNative({
      invoke: () => this.native.startEcgTest(options),
      fallbackCode: "OPERATION_FAILED",
      deviceId: this.connectedDeviceId ?? undefined,
      throwMapped: (e: unknown) => this.nativeOpFailed(e),
    });
  }

  stopEcgTest = (): Promise<void> =>
    this.invokeRealtimeTestVoid("test", "test.ecg.stop", "Stopping ECG test", () => this.native.stopEcgTest());

  startFatigueTest = (): Promise<void> =>
    this.invokeRealtimeTestVoid("test", "test.fatigue.start", "Starting fatigue test", () => this.native.startFatigueTest());

  stopFatigueTest = (): Promise<void> =>
    this.invokeRealtimeTestVoid("test", "test.fatigue.stop", "Stopping fatigue test", () => this.native.stopFatigueTest());

  startBreathingTest = (): Promise<void> =>
    this.invokeRealtimeTestVoid("test", "test.breathing.start", "Starting breathing test", () => this.native.startBreathingTest());

  stopBreathingTest = (): Promise<void> =>
    this.invokeRealtimeTestVoid("test", "test.breathing.stop", "Stopping breathing test", () => this.native.stopBreathingTest());

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
