import { invokeOrThrow } from "../../bridge/native-invoke-pipeline.js";
import { validateMusicData } from "../../validators/index.js";
import type { MusicData } from "../../types/index.js";
import type { MediaInteractionInterface, SubsystemRuntime } from "../subsystem-interfaces.js";

/** Media interaction: find-device buzz, camera mode, and music control. */
export class MediaInteraction implements MediaInteractionInterface {
  constructor(private readonly rt: SubsystemRuntime) {}

  startFindDevice(): Promise<void> {
    return invokeOrThrow({
      invoke: () => this.rt.native.startFindDevice(),
      mapError: (e: unknown) => this.rt.nativeOpFailed(e),
    });
  }

  stopFindDevice(): Promise<void> {
    return invokeOrThrow({
      invoke: () => this.rt.native.stopFindDevice(),
      mapError: (e: unknown) => this.rt.nativeOpFailed(e),
    });
  }

  enterCameraMode(): Promise<void> {
    return invokeOrThrow({
      invoke: () => this.rt.native.enterCameraMode(),
      mapError: (e: unknown) => this.rt.nativeOpFailed(e),
    });
  }

  exitCameraMode(): Promise<void> {
    return invokeOrThrow({
      invoke: () => this.rt.native.exitCameraMode(),
      mapError: (e: unknown) => this.rt.nativeOpFailed(e),
    });
  }

  setMusicControlEnabled(enabled: boolean): Promise<void> {
    return invokeOrThrow({
      invoke: () => this.rt.native.setMusicControlEnabled(enabled),
      mapError: (e: unknown) => this.rt.nativeOpFailed(e),
    });
  }

  pushMusicData(data: MusicData): Promise<void> {
    return invokeOrThrow({
      validate: () => validateMusicData(data),
      invoke: () => this.rt.native.pushMusicData(data),
      mapError: (e: unknown) => this.rt.nativeOpFailed(e),
    });
  }
}
