import type {
  LogLevel,
  LogScope,
  VeepooError,
  VeepooEvent,
} from "@/types/index";
import type { NativeVeepooSDKInterface } from "@/native-veepoo-sdk";
import type { VeepooSdkState } from "./veepoo-sdk-state";

/** Runtime surface needed by `SdkLifecycle`. */
export interface LifecycleRuntime {
  readonly native: NativeVeepooSDKInterface;
  readonly state: VeepooSdkState;
  log(
    level: LogLevel,
    scope: LogScope,
    action: string,
    message: string,
    options?: { deviceId?: string; data?: unknown; error?: unknown },
  ): void;
  emitLocal(event: VeepooEvent, payload: unknown): void;
  handleError(
    error: unknown,
    fallbackCode: VeepooError["code"],
    deviceId?: string,
  ): VeepooError;
  setupEventListeners(): void;
  teardownNativeListeners(): void;
  resetAfterDestroy(): void;
}
