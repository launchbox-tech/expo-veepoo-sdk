import { Platform } from "react-native";

import type {
  LogEntry,
  LogLevel,
  LogListener,
  LogScope,
  VeepooError,
  VeepooEvent,
  VeepooEventPayload,
} from "@/types/index";
import type { NativeVeepooSDKInterface } from "@/native-veepoo-sdk";
import { EVENT_LOG_SCOPES, normalizeEventPayload } from "@/bridge/event-registry";
import { invokeOrThrow, invokeWithRecovery } from "@/bridge/native-invoke-pipeline";
import { mapNativeRejection } from "@/errors/map-native-rejection";
import { VeepooSdkState } from "./veepoo-sdk-state";
import { OriginReadPipeline } from "@/bridge/origin-read-pipeline";
import { EventBus } from "@/bridge/event-bus";
import type {
  CapabilityContext,
  CapabilityInvokeOpts,
  CapabilityRecoveryOpts,
} from "@/capabilities/shared/context";

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

  private setupEventListeners(): void {
    this.bus.setupEventListeners(this.native, (event, payload) =>
      this.emitLocal(event, payload),
    );
  }

  emitLocal(event: VeepooEvent, payload: unknown): void {
    const normalizedPayload = normalizeEventPayload(event, payload);

    if (event === "read_origin_progress") {
      if (!this.originReadPipeline.shouldEmit(
        normalizedPayload as VeepooEventPayload["read_origin_progress"],
      )) {
        return;
      }
    }

    this.log(
      "debug",
      EVENT_LOG_SCOPES[event],
      `event.${event}`,
      `Received ${event} event`,
      {
        deviceId: this.getPayloadDeviceId(normalizedPayload),
        data: normalizedPayload,
      },
    );

    this.state.applyEvent(event, normalizedPayload);
    if (event === "device_disconnected") {
      const deviceId = (normalizedPayload as { device_id?: string }).device_id;
      if (deviceId) {
        this.originReadPipeline.clearDevice(deviceId);
      }
    }

    this.bus.emit(event, normalizedPayload);
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

  private handleError(
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

  private teardownNativeListeners(): void {
    this.bus.teardownNativeListeners();
  }

  private resetAfterDestroy(): void {
    this.bus.removeAllListeners();
    this.state.reset();
    this.logger = null;
    this.logEnabled = false;
  }

  async init(): Promise<void> {
    if (this.state.isInitialized) return;
    this.log("info", "sdk", "init.start", "Initializing SDK");
    this.setupEventListeners();
    await invokeOrThrow({
      invoke: () => this.native.init(),
      mapError: (error: unknown) => this.handleError(error, "UNKNOWN"),
      afterSuccess: () => {
        this.state.markInitialized(true);
        this.emitLocal("sdk_initialized", {});
        this.log("info", "sdk", "init.success", "SDK initialized");
      },
    });
  }

  destroy(): void {
    this.log("info", "sdk", "destroy", "Destroying SDK instance");
    this.teardownNativeListeners();
    this.resetAfterDestroy();
  }

  createCapabilityContext(): CapabilityContext<NativeVeepooSDKInterface> {
    const mapError = (
      error: unknown,
      opts?: { code?: VeepooError["code"]; deviceId?: string },
    ): VeepooError =>
      this.handleError(
        error,
        opts?.code ?? "OPERATION_FAILED",
        opts?.deviceId ?? this.state.connectedDeviceId ?? undefined,
      );
    return {
      native: this.native,
      invoke: <T>(opts: CapabilityInvokeOpts<T>): Promise<T> => {
        const { errorCode, errorDeviceId, ...rest } = opts;
        return invokeOrThrow({
          ...rest,
          mapError: (error: unknown) =>
            mapError(error, { code: errorCode, deviceId: errorDeviceId }),
        });
      },
      invokeWithRecovery: <T>(opts: CapabilityRecoveryOpts<T>): Promise<T> => {
        const { errorCode, errorDeviceId, recoverWith, ...rest } = opts;
        return invokeWithRecovery({
          ...rest,
          recover: (error: unknown) => {
            mapError(error, { code: errorCode, deviceId: errorDeviceId });
            return recoverWith;
          },
        });
      },
      emit: (event, payload) => this.emitLocal(event, payload),
      emitDeviceEvent: (event, payload) => {
        const deviceId = this.state.connectedDeviceId;
        if (deviceId === null) {
          this.log(
            "warn",
            "sdk",
            `emit.${event}.no_device`,
            `emitDeviceEvent("${event}") called with no connected Band`,
            { data: payload },
          );
        }
        this.emitLocal(event, {
          device_id: deviceId ?? "",
          ...payload,
        });
      },
      connectedDeviceId: () => this.state.connectedDeviceId,
      setConnectedDeviceId: (id) => this.state.setConnectedDeviceId(id),
      isScanning: () => this.state.isScanning,
      setScanning: (v) => this.state.setScanning(v),
      log: (level, scope, action, message, options) =>
        this.log(level, scope, action, message, {
          ...options,
          deviceId:
            options?.deviceId ?? this.state.connectedDeviceId ?? undefined,
        }),
    };
  }
}
