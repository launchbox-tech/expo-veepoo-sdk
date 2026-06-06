"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FindDeviceCapability = void 0;
exports.normalizeFindDeviceStatePayload = normalizeFindDeviceStatePayload;
const primitives_1 = require("../shared/primitives");
// ── Normalizers ─────────────────────────────────────────────────────────────
const FIND_DEVICE_PHASES = [
    "unsupported",
    "searching",
    "found",
    "timeout",
    "stopped",
];
function normalizeFindDeviceStatePayload(value) {
    const record = (0, primitives_1.isRecord)(value) ? value : {};
    const phaseRaw = (0, primitives_1.toStringValue)(record.phase);
    const phase = FIND_DEVICE_PHASES.includes(phaseRaw)
        ? phaseRaw
        : "unsupported";
    const raw = record.rawState ?? record.raw_state;
    const raw_state = typeof raw === "number" && Number.isFinite(raw) ? Math.trunc(raw) : undefined;
    return {
        device_id: (0, primitives_1.toStringValue)(record.deviceId ?? record.device_id),
        phase,
        raw_state,
    };
}
// ── Capability ──────────────────────────────────────────────────────────────
class FindDeviceCapability {
    constructor(ctx) {
        this.ctx = ctx;
    }
    startFindDevice() {
        return this.ctx.invoke({
            invoke: () => this.ctx.native.startFindDevice(),
        });
    }
    stopFindDevice() {
        return this.ctx.invoke({
            invoke: () => this.ctx.native.stopFindDevice(),
        });
    }
}
exports.FindDeviceCapability = FindDeviceCapability;
//# sourceMappingURL=find-device.js.map