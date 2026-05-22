import type { ThrowingInvoke } from "@/bridge/native-invoke-pipeline";
import type {
  LogLevel,
  LogScope,
  VeepooError,
  VeepooEvent,
  VeepooEventPayload,
} from "@/types/index";

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
  /** Maps a native rejection to VeepooError. Defaults to OPERATION_FAILED + connectedDeviceId. */
  mapError: (error: unknown, opts?: { code?: VeepooError["code"]; deviceId?: string }) => VeepooError;
  /**
   * Runs the native-invoke pipeline with the context's default `mapError`.
   * Use this for the common path; capabilities that need a non-default
   * `code` / `deviceId` (e.g. band-discovery, session) call `invokeOrThrow`
   * directly with a custom `mapError`.
   */
  invoke: <T>(opts: Omit<ThrowingInvoke<T>, "mapError">) => Promise<T>;
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
