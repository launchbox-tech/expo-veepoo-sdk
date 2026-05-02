import { invokeNative } from "../bridge/native-invoke-pipeline.js";
import type { VeepooSDKRuntime } from "./veepoo-sdk-runtime.js";

export class SdkLifecycle {
  constructor(private readonly rt: VeepooSDKRuntime) {}

  async init(): Promise<void> {
    if (this.rt.isInitialized) return;
    this.rt.log("info", "sdk", "init.start", "Initializing SDK");
    this.rt.setupEventListeners();
    await invokeNative({
      invoke: () => this.rt.native.init(),
      fallbackCode: "UNKNOWN",
      throwMapped: (error: unknown) => {
        throw this.rt.handleError(error, "UNKNOWN");
      },
      afterSuccess: () => {
        this.rt.isInitialized = true;
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
