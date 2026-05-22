import type {
  RecoveringInvoke,
  ThrowingInvoke,
} from "@/bridge/native-invoke-pipeline";
import type {
  LogLevel,
  LogScope,
  VeepooErrorCode,
  VeepooEvent,
  VeepooEventPayload,
} from "@/types/index";

/**
 * Pipeline opts plus optional error-context customization. Capabilities pass
 * `errorCode` / `errorDeviceId` when they need something other than the
 * defaults (`OPERATION_FAILED` + `state.connectedDeviceId`).
 */
export type CapabilityInvokeOpts<T> = Omit<ThrowingInvoke<T>, "mapError"> & {
  errorCode?: VeepooErrorCode;
  errorDeviceId?: string;
};

/**
 * Recovering variant of {@link CapabilityInvokeOpts}: on failure the
 * `VeepooError` is still emitted/logged through the runtime's error pipeline,
 * but the operation resolves with `recoverWith` instead of throwing.
 */
export type CapabilityRecoveryOpts<T> = Omit<RecoveringInvoke<T>, "recover"> & {
  errorCode?: VeepooErrorCode;
  errorDeviceId?: string;
  recoverWith: T;
};

/**
 * Events whose payload includes a `device_id: string` envelope. Capability
 * emit sites should use `emitDeviceEvent` for these so the bridge injects
 * `device_id` from `connectedDeviceId()` in one place instead of every
 * capability re-implementing the envelope.
 */
export type DeviceScopedEvent = {
  [K in VeepooEvent]: VeepooEventPayload[K] extends { device_id: string } ? K : never;
}[VeepooEvent];

export interface CapabilityContext<TNative> {
  native: TNative;
  /**
   * Runs the native-invoke pipeline. Failures are mapped through the
   * runtime's error handler (logged + emitted as `error` event) and thrown
   * to the caller. Pass `errorCode` / `errorDeviceId` to override the
   * defaults (`OPERATION_FAILED` and `state.connectedDeviceId`) — the only
   * way capabilities should reach the throwing error pipeline.
   */
  invoke: <T>(opts: CapabilityInvokeOpts<T>) => Promise<T>;
  /**
   * Like {@link invoke}, but on failure the error is logged and a
   * `recoverWith` value is returned instead of throwing. Use for operations
   * where a safe default exists and partial results are valid.
   */
  invokeWithRecovery: <T>(opts: CapabilityRecoveryOpts<T>) => Promise<T>;
  /**
   * Emit a JS-local event. Use for envelope-less events (e.g. `scan_started`).
   * Prefer `emitDeviceEvent` for any event whose payload includes `device_id`.
   */
  emit: (event: VeepooEvent, payload: unknown) => void;
  /**
   * Emit a device-scoped event, injecting `device_id` from
   * `connectedDeviceId()`. The bridge owns the envelope shape so individual
   * capabilities stop re-implementing it (and stop drifting on whether to
   * write `?? ""` or pass `null`).
   */
  emitDeviceEvent: <K extends DeviceScopedEvent>(
    event: K,
    payload: Omit<VeepooEventPayload[K], "device_id">,
  ) => void;
  connectedDeviceId: () => string | null;
  setConnectedDeviceId: (id: string | null) => void;
  isScanning: () => boolean;
  setScanning: (scanning: boolean) => void;
  log: (
    level: LogLevel,
    scope: LogScope,
    action: string,
    message: string,
    options?: { deviceId?: string; data?: unknown; error?: unknown }
  ) => void;
}
