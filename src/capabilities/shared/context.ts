import type { ThrowingInvoke } from "@/bridge/native-invoke-pipeline";
import type { LogLevel, LogScope, VeepooError, VeepooEvent } from "@/types/index";

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
  emit: (event: VeepooEvent, payload: unknown) => void;
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
