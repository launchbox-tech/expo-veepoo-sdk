"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BtStatusCapability = void 0;
exports.normalizeDeviceBTState = normalizeDeviceBTState;
exports.normalizeDeviceBTStatus = normalizeDeviceBTStatus;
const primitives_1 = require("../shared/primitives");
// ── Normalizers ─────────────────────────────────────────────────────────────
const BT_STATE_MAP = {
    0: "disconnected",
    1: "connected",
    2: "pairing",
};
function normalizeDeviceBTState(value) {
    if (typeof value === "number")
        return BT_STATE_MAP[value] ?? "disconnected";
    if (typeof value === "string") {
        if (value === "connected")
            return "connected";
        if (value === "pairing")
            return "pairing";
    }
    return "disconnected";
}
function normalizeDeviceBTStatus(value) {
    if (!(0, primitives_1.isRecord)(value)) {
        return {
            is_bt_open: false,
            is_auto_connect: false,
            is_audio_open: false,
            has_pair_info: false,
            state: "disconnected",
        };
    }
    return {
        is_bt_open: (0, primitives_1.toBoolean)(value.isBTOpen ?? value.is_bt_open),
        is_auto_connect: (0, primitives_1.toBoolean)(value.isAutoCon ?? value.isAutoConnect ?? value.is_auto_connect),
        is_audio_open: (0, primitives_1.toBoolean)(value.isAudioOpen ?? value.is_audio_open),
        has_pair_info: (0, primitives_1.toBoolean)(value.isHavePairInfo ?? value.hasPairInfo ?? value.has_pair_info),
        state: normalizeDeviceBTState(value.status ?? value.state),
    };
}
// ── Capability ──────────────────────────────────────────────────────────────
class BtStatusCapability {
    constructor(ctx) {
        this.ctx = ctx;
    }
    readDeviceBTStatus() {
        return this.ctx.invoke({
            invoke: () => this.ctx.native.readDeviceBTStatus(),
            normalize: normalizeDeviceBTStatus,
        });
    }
    setDeviceBTSwitch(open) {
        return this.ctx.invoke({
            invoke: () => this.ctx.native.setDeviceBTSwitch(open),
        });
    }
}
exports.BtStatusCapability = BtStatusCapability;
//# sourceMappingURL=bt-status.js.map