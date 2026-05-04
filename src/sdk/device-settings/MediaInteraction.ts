import { invokeNative } from "../../bridge/native-invoke-pipeline.js";
import { validateMusicData } from "../../validators/index.js";
import type { MusicData } from "../../types/index.js";
import type { MediaInteractionInterface, SubsystemRuntime } from "../subsystem-interfaces.js";

/** Media interaction: find-device buzz, camera mode, and music control. */
export class MediaInteraction implements MediaInteractionInterface {
  constructor(private readonly rt: SubsystemRuntime) {}

  startFindDevice(): Promise<void> {
    return invokeNative({
      invoke: () => this.rt.native.startFindDevice(),
      fallbackCode: "OPERATION_FAILED",
      deviceId: this.rt.state.connectedDeviceId ?? undefined,
      throwMapped: (e: unknown) => this.rt.nativeOpFailed(e),
    });
  }

  stopFindDevice(): Promise<void> {
    return invokeNative({
      invoke: () => this.rt.native.stopFindDevice(),
      fallbackCode: "OPERATION_FAILED",
      deviceId: this.rt.state.connectedDeviceId ?? undefined,
      throwMapped: (e: unknown) => this.rt.nativeOpFailed(e),
    });
  }

  enterCameraMode(): Promise<void> {
    return invokeNative({
      invoke: () => this.rt.native.enterCameraMode(),
      fallbackCode: "OPERATION_FAILED",
      deviceId: this.rt.state.connectedDeviceId ?? undefined,
      throwMapped: (e: unknown) => this.rt.nativeOpFailed(e),
    });
  }

  exitCameraMode(): Promise<void> {
    return invokeNative({
      invoke: () => this.rt.native.exitCameraMode(),
      fallbackCode: "OPERATION_FAILED",
      deviceId: this.rt.state.connectedDeviceId ?? undefined,
      throwMapped: (e: unknown) => this.rt.nativeOpFailed(e),
    });
  }

  setMusicControlEnabled(enabled: boolean): Promise<void> {
    return invokeNative({
      invoke: () => this.rt.native.setMusicControlEnabled(enabled),
      fallbackCode: "OPERATION_FAILED",
      deviceId: this.rt.state.connectedDeviceId ?? undefined,
      throwMapped: (e: unknown) => this.rt.nativeOpFailed(e),
    });
  }

  pushMusicData(data: MusicData): Promise<void> {
    return invokeNative({
      validate: () => validateMusicData(data),
      invoke: () => this.rt.native.pushMusicData(data),
      fallbackCode: "OPERATION_FAILED",
      deviceId: this.rt.state.connectedDeviceId ?? undefined,
      throwMapped: (e: unknown) => this.rt.nativeOpFailed(e),
    });
  }
}
