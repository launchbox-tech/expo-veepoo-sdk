import type { CapabilityContext } from "../capabilities/shared/context";
/** Camera shutter status emitted when the Band triggers a photo (`cameraShutter` event). */
export type CameraShutterStatus = "canTake" | "cannotTake";
export interface CameraNativeMethods {
    enterCameraMode(): Promise<void>;
    exitCameraMode(): Promise<void>;
}
/**
 * Normalizes camera shutter status from native.
 * Android: ECameraStatus string (TAKEPHOTO_CAN / TAKEPHOTO_CAN_NOT or already mapped).
 * iOS: 'canTake' / 'cannotTake' passed directly.
 */
export declare function normalizeCameraShutterStatus(value: unknown): CameraShutterStatus;
export declare class CameraCapability {
    private readonly ctx;
    constructor(ctx: CapabilityContext<CameraNativeMethods>);
    enterCameraMode(): Promise<void>;
    exitCameraMode(): Promise<void>;
}
//# sourceMappingURL=camera.d.ts.map