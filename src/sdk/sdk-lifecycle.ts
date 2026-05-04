import { invokeOrThrow } from "../bridge/native-invoke-pipeline.js";
import type { LifecycleRuntime } from "./subsystem-interfaces.js";

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
        this.rt.emitLocal("sdkInitialized", {});
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
