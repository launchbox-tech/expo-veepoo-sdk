import { invokeOrThrow } from "@/bridge/native-invoke-pipeline";
import type { ThrowingInvoke } from "@/bridge/native-invoke-pipeline";
import type { CapabilityContext } from "@/capabilities/shared/context";
import type { CameraNativeMethods } from "./native";

export class CameraCapability {
  constructor(private readonly ctx: CapabilityContext<CameraNativeMethods>) {}

  private call<T>(opts: Omit<ThrowingInvoke<T>, "mapError">): Promise<T> {
    return invokeOrThrow({ ...opts, mapError: (e) => this.ctx.mapError(e) });
  }

  enterCameraMode(): Promise<void> {
    return this.call({
      invoke: () => this.ctx.native.enterCameraMode(),
    });
  }

  exitCameraMode(): Promise<void> {
    return this.call({
      invoke: () => this.ctx.native.exitCameraMode(),
    });
  }
}
