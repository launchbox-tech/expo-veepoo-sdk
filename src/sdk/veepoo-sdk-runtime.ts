import type { EventSubscription } from "expo-modules-core";
import { Platform } from "react-native";

import type {
  ConnectionStatus,
  LogEntry,
  LogLevel,
  LogScope,
  VeepooError,
  VeepooEvent,
  VeepooEventPayload,
} from "../types/index.js";
import type { NativeVeepooSDKInterface } from "../NativeVeepooSDK.js";
import type { LogListener } from "../VeepooSDKModule.js";
import { normalizeEventPayload } from "../normalizers/index.js";
import { mapNativeRejection } from "../errors/map-native-rejection.js";
import { VeepooSdkState } from "./veepoo-sdk-state.js";

export type EventListener = (payload: unknown) => void;

/**
 * Shared **Session** / scan / init state (`state`), logging, native subscriptions, and JS event hub.
 * Single owner for `nativeSubscriptions` teardown (see `teardownNativeListeners`).
 */
export class VeepooSDKRuntime {
  readonly native: NativeVeepooSDKInterface;
  readonly state = new VeepooSdkState();
  private eventListenersSetup = false;
  private logEnabled = false;
  private logger: LogListener | null = null;
  private listeners: Map<VeepooEvent, Set<EventListener>> = new Map();
  private nativeSubscriptions: EventSubscription[] = [];

  constructor(native: NativeVeepooSDKInterface) {
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

  log(
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

    if (this.logEnabled && (typeof __DEV__ === "undefined" || __DEV__)) {
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

  setupEventListeners(): void {
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
      "bodyCompositionTestResult",
      "batteryData",
      "connectionStatusChanged",
      "originSpo2Data",
      "alarmData",
      "findDeviceState",
      "firmwareDfuProgress",
      "contactsData",
      "sosCallTimesData",
      "cameraShutter",
      "musicRemoteCommand",
      "deviceBTStateChanged",
      "deviceSosTriggered",
      "customSettingsData",
      "healthRemindData",
      "apneaRemindData",
      "sportModeData",
      "bloodAnalysisTestResult",
      "gsrTestResult",
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

  emitLocal(event: VeepooEvent, payload: unknown): void {
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
      const lastProgress = this.state.getLastReadOriginProgress(deviceId);

      if (typeof progressValue === "number" && Number.isFinite(progressValue)) {
        if (
          readState === "start" ||
          lastProgress === undefined ||
          progressValue < lastProgress
        ) {
          this.state.recordReadOriginProgress(deviceId, progressValue);
        } else if (progressValue === lastProgress) {
          return;
        } else {
          this.state.recordReadOriginProgress(deviceId, progressValue);
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
        this.state.setScanning(bluetoothStatus.isScanning);
      }
    }

    if (event === "deviceConnected") {
      const device = normalizedPayload as { deviceId?: string };
      if (typeof device.deviceId === "string" && device.deviceId.length > 0) {
        this.state.setConnectedDeviceId(device.deviceId);
      }
    }

    if (event === "deviceDisconnected") {
      const device = normalizedPayload as { deviceId?: string };
      if (!device.deviceId || this.state.connectedDeviceId === device.deviceId) {
        this.state.setConnectedDeviceId(null);
      }
      if (device.deviceId) {
        this.state.clearReadOriginProgressForDevice(device.deviceId);
      }
      this.state.setScanning(false);
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
        (!connection.deviceId ||
          this.state.connectedDeviceId === connection.deviceId)
      ) {
        this.state.setConnectedDeviceId(null);
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
      event === "breathingTestResult" ||
      event === "bodyCompositionTestResult"
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

  private isEventRecord(payload: unknown): payload is Record<string, unknown> {
    return typeof payload === "object" && payload !== null;
  }

  handleError(
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

  nativeOpFailed(error: unknown): never {
    throw this.handleError(
      error,
      "OPERATION_FAILED",
      this.state.connectedDeviceId ?? undefined,
    );
  }

  setLogEnabled(enabled: boolean): void {
    this.logEnabled = enabled;
    this.log(
      "info",
      "sdk",
      "logger.toggle",
      enabled ? "SDK logging enabled" : "SDK logging disabled",
    );
  }

  isLogEnabled(): boolean {
    return this.logEnabled;
  }

  setLogger(logger: LogListener | null): void {
    this.logger = logger;
    this.log(
      "debug",
      "sdk",
      "logger.set",
      logger ? "Custom logger attached" : "Custom logger cleared",
    );
  }

  on<K extends VeepooEvent>(
    event: K,
    listener: (payload: VeepooEventPayload[K]) => void,
  ): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(listener as EventListener);
  }

  off<K extends VeepooEvent>(
    event: K,
    listener: (payload: VeepooEventPayload[K]) => void,
  ): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.delete(listener as EventListener);
    }
  }

  once<K extends VeepooEvent>(
    event: K,
    listener: (payload: VeepooEventPayload[K]) => void,
  ): void {
    const wrapper: EventListener = payload => {
      this.listeners.get(event)?.delete(wrapper);
      (listener as EventListener)(payload);
    };
    if (!this.listeners.has(event)) this.listeners.set(event, new Set());
    this.listeners.get(event)!.add(wrapper);
  }

  removeAllListeners(event?: VeepooEvent): void {
    if (event) {
      this.listeners.delete(event);
    } else {
      this.listeners.clear();
    }
  }

  teardownNativeListeners(): void {
    this.nativeSubscriptions.forEach(subscription => {
      subscription.remove();
    });
    this.nativeSubscriptions = [];
    this.eventListenersSetup = false;
  }

  resetAfterDestroy(): void {
    this.listeners.clear();
    this.state.reset();
    this.logger = null;
    this.logEnabled = false;
  }
}
