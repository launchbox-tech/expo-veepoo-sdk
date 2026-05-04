export interface CameraNativeMethods {
  enterCameraMode(): Promise<void>;
  exitCameraMode(): Promise<void>;
}
