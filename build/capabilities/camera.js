"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CameraCapability = void 0;
exports.normalizeCameraShutterStatus = normalizeCameraShutterStatus;
// ── Normalizers ─────────────────────────────────────────────────────────────
/**
 * Normalizes camera shutter status from native.
 * Android: ECameraStatus string (TAKEPHOTO_CAN / TAKEPHOTO_CAN_NOT or already mapped).
 * iOS: 'canTake' / 'cannotTake' passed directly.
 */
function normalizeCameraShutterStatus(value) {
    const s = typeof value === "string" ? value : "";
    if (s === "canTake" || s === "TAKEPHOTO_CAN")
        return "canTake";
    return "cannotTake";
}
// ── Capability ──────────────────────────────────────────────────────────────
class CameraCapability {
    constructor(ctx) {
        this.ctx = ctx;
    }
    enterCameraMode() {
        return this.ctx.invoke({
            invoke: () => this.ctx.native.enterCameraMode(),
        });
    }
    exitCameraMode() {
        return this.ctx.invoke({
            invoke: () => this.ctx.native.exitCameraMode(),
        });
    }
}
exports.CameraCapability = CameraCapability;
//# sourceMappingURL=camera.js.map