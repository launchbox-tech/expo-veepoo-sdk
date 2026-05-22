import type { CapabilityContext } from "@/capabilities/shared/context";

// ── Types ────────────────────────────────────────────────────────────────────

/** Camera shutter status emitted when the Band triggers a photo (`cameraShutter` event). */
export type CameraShutterStatus = "canTake" | "cannotTake";

// ── Native methods ──────────────────────────────────────────────────────────

export interface CameraNativeMethods {
  enterCameraMode(): Promise<void>;
  exitCameraMode(): Promise<void>;
}

// ── Normalizers ─────────────────────────────────────────────────────────────

/**
 * Normalizes camera shutter status from native.
 * Android: ECameraStatus string (TAKEPHOTO_CAN / TAKEPHOTO_CAN_NOT or already mapped).
 * iOS: 'canTake' / 'cannotTake' passed directly.
 */
export function normalizeCameraShutterStatus(value: unknown): CameraShutterStatus {
  const s = typeof value === "string" ? value : "";
  if (s === "canTake" || s === "TAKEPHOTO_CAN") return "canTake";
  return "cannotTake";
}

// ── Capability ──────────────────────────────────────────────────────────────

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
