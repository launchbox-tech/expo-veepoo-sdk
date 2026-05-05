import { Platform } from "react-native";

import type {
  ConnectionStatus,
  LogEntry,
  LogLevel,
  LogScope,
  VeepooError,
  VeepooEvent,
  VeepooEventPayload,
} from "@/types/index";
import type { NativeVeepooSDKInterface } from "@/native-veepoo-sdk";
import type { LogListener } from "@/veepoo-sdk-module";
import { normalizeEventPayload } from "@/bridge/event-normalizer";
import { mapNativeRejection } from "@/errors/map-native-rejection";
import { VeepooSdkState } from "./veepoo-sdk-state";
import { OriginReadPipeline } from "@/bridge/origin-read-pipeline";
import { EventBus } from "@/bridge/event-bus";
import type { CapabilityContext } from "@/capabilities/shared/context";

/**
 * Shared **Session** / scan / init state (`state`), logging, and wiring between
 * the native module, `EventBus`, and domain subsystems.
 */
export class VeepooSDKRuntime {
  readonly native: NativeVeepooSDKInterface;
  readonly state = new VeepooSdkState();
  private readonly originReadPipeline = new OriginReadPipeline();
  private readonly bus = new EventBus(
    (error, event, payload) => {
      this.log(
        "error",
        "listener",
        `listener.${event}.failed`,
        `Event listener for ${event} threw`,
        {
          deviceId: this.getPayloadDeviceId(payload),
          error,
          data: payload,
        },
      );
      console.error(`Error in event listener for ${event}:`, error);
    },
  );
  private logEnabled = false;
  private logger: LogListener | null = null;

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
      device_id: options?.deviceId,
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
    this.bus.setupEventListeners(this.native, (event, payload) =>
      this.emitLocal(event, payload),
    );
  }

  emitLocal(event: VeepooEvent, payload: unknown): void {
    const normalizedPayload = normalizeEventPayload(event, payload);

    if (event === "readOriginProgress") {
      if (!this.originReadPipeline.shouldEmit(
        normalizedPayload as VeepooEventPayload["readOriginProgress"],
      )) {
        return;
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
      const bluetoothStatus = normalizedPayload as { is_scanning?: boolean };
      if (typeof bluetoothStatus.is_scanning === "boolean") {
        this.state.setScanning(bluetoothStatus.is_scanning);
      }
    }

    if (event === "deviceConnected") {
      const device = normalizedPayload as { device_id?: string };
      this.state.onDeviceConnected(device.device_id ?? "");
    }

    if (event === "deviceDisconnected") {
      const device = normalizedPayload as { device_id?: string };
      this.state.onDeviceDisconnected(device.device_id);
      if (device.device_id) {
        this.originReadPipeline.clearDevice(device.device_id);
      }
    }

    if (
      event === "deviceConnectStatus" ||
      event === "connectionStatusChanged"
    ) {
      const connection = normalizedPayload as {
        device_id?: string;
        status?: ConnectionStatus;
      };
      if (connection.status) {
        this.state.onConnectionStatusChanged(connection.device_id, connection.status);
      }
    }

    this.bus.emit(event, normalizedPayload);
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
    if (event === "error" || event === "sdkInitialized") return "sdk";
    if (event === "scanStarted" || event === "scanStopped") return "scan";
    return "device";
  }

  private getPayloadDeviceId(payload: unknown): string | undefined {
    if (typeof payload !== "object" || payload === null) {
      return undefined;
    }
    const deviceId = (payload as { device_id?: unknown }).device_id;
    return typeof deviceId === "string" && deviceId.length > 0
      ? deviceId
      : undefined;
  }

  handleError(
    error: unknown,
    fallbackCode: VeepooError["code"],
    deviceId?: string,
  ): VeepooError {
    const veepooError = mapNativeRejection(error, { fallbackCode, deviceId });
    this.log("error", "sdk", `error.${veepooError.code}`, veepooError.message, {
      deviceId: veepooError.device_id,
      error,
    });
    this.emitLocal("error", veepooError);
    return veepooError;
  }

  nativeOpFailed(error: unknown): VeepooError {
    return this.handleError(
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
    this.bus.on(event, listener);
  }

  off<K extends VeepooEvent>(
    event: K,
    listener: (payload: VeepooEventPayload[K]) => void,
  ): void {
    this.bus.off(event, listener);
  }

  once<K extends VeepooEvent>(
    event: K,
    listener: (payload: VeepooEventPayload[K]) => void,
  ): void {
    this.bus.once(event, listener);
  }

  removeAllListeners(event?: VeepooEvent): void {
    this.bus.removeAllListeners(event);
  }

  teardownNativeListeners(): void {
    this.bus.teardownNativeListeners();
  }

  resetAfterDestroy(): void {
    this.bus.removeAllListeners();
    this.state.reset();
    this.logger = null;
    this.logEnabled = false;
  }

  createCapabilityContext(): CapabilityContext<NativeVeepooSDKInterface> {
    return {
      native: this.native,
      mapError: (error, opts) =>
        this.handleError(
          error,
          opts?.code ?? "OPERATION_FAILED",
          opts?.deviceId ?? this.state.connectedDeviceId ?? undefined,
        ),
      emit: (event, payload) => this.emitLocal(event, payload),
      connectedDeviceId: () => this.state.connectedDeviceId,
      setConnectedDeviceId: (id) => this.state.setConnectedDeviceId(id),
      isScanning: () => this.state.isScanning,
      setScanning: (v) => this.state.setScanning(v),
      log: (level, scope, action, message, options) =>
        this.log(level, scope, action, message, options),
    };
  }
}
