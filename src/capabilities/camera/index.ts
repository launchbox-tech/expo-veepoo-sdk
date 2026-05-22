import type { CapabilityContext } from "@/capabilities/shared/context";
import type { CameraNativeMethods } from "./native";

export class CameraCapability {
  constructor(private readonly ctx: CapabilityContext<CameraNativeMethods>) {}

  enterCameraMode(): Promise<void> {
    return this.ctx.invoke({
      invoke: () => this.ctx.native.enterCameraMode(),
    });
  }

  exitCameraMode(): Promise<void> {
    return this.ctx.invoke({
      invoke: () => this.ctx.native.exitCameraMode(),
    });
  }
}
