import type {
  LogLevel,
  LogScope,
  VeepooError,
  VeepooEvent,
} from "@/types/index";
import type { NativeVeepooSDKInterface } from "@/native-veepoo-sdk";
import { invokeOrThrow } from "@/bridge/native-invoke-pipeline";
import type { VeepooSdkState } from "./veepoo-sdk-state";

/** Subset of `VeepooSDKRuntime` that `SdkLifecycle` reads. */
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

export class SdkLifecycle {
  constructor(private readonly rt: LifecycleRuntime) {}

  async init(): Promise<void> {
    if (this.rt.state.isInitialized) return;
    this.rt.log("info", "sdk", "init.start", "Initializing SDK");
    this.rt.setupEventListeners();
    await invokeOrThrow({
      invoke: () => this.rt.native.init(),
      mapError: (error: unknown) => this.rt.handleError(error, "UNKNOWN"),
      afterSuccess: () => {
        this.rt.state.markInitialized(true);
        this.rt.emitLocal("sdk_initialized", {});
        this.rt.log("info", "sdk", "init.success", "SDK initialized");
      },
    });
  }

  destroy(): void {
    this.rt.log("info", "sdk", "destroy", "Destroying SDK instance");
    this.rt.teardownNativeListeners();
    this.rt.resetAfterDestroy();
  }
}
