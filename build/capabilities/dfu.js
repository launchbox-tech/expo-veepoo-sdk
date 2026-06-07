"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DfuCapability = void 0;
exports.normalizeFirmwareDfuProgress = normalizeFirmwareDfuProgress;
const primitives_1 = require("../shared/primitives");
// ── Normalizers ─────────────────────────────────────────────────────────────
const FIRMWARE_DFU_STATES = [
    "file_not_exist",
    "start",
    "updating",
    "success",
    "failure",
    "prepared",
    "reboot",
    "reconnecting",
    "dfu_lang_connect_success",
    "dfu_lang_connect_failed",
    "unknown",
];
const FIRMWARE_DFU_STATE_VALUE_MAP = {
    fileNotExist: "file_not_exist",
    dfuLangConnectSuccess: "dfu_lang_connect_success",
    dfuLangConnectFailed: "dfu_lang_connect_failed",
};
function normalizeFirmwareDfuProgress(value) {
    const p = (0, primitives_1.isRecord)(value) ? value : {};
    const stateRaw = (0, primitives_1.toStringValue)(p.state, "unknown");
    const stateMapped = FIRMWARE_DFU_STATE_VALUE_MAP[stateRaw] ?? stateRaw;
    const state = FIRMWARE_DFU_STATES.includes(stateMapped)
        ? stateMapped
        : "unknown";
    let message;
    if (p.message !== undefined && p.message !== null) {
        message = String(p.message);
    }
    const out = {
        device_id: (0, primitives_1.toStringValue)(p.deviceId ?? p.device_id) ?? "",
        progress: (0, primitives_1.clamp)((0, primitives_1.toInt)(p.progress) ?? 0, 0, 100),
        state,
    };
    if (message !== undefined) {
        out.message = message;
    }
    return out;
}
// ── Validators ──────────────────────────────────────────────────────────────
function validateFirmwareDfuFilePath(filePath) {
    if (typeof filePath !== "string" || filePath.trim().length === 0) {
        throw { code: "INVALID_ARGUMENT", message: "filePath is required" };
    }
    if (filePath.length > 4096) {
        throw { code: "INVALID_ARGUMENT", message: "filePath is too long" };
    }
}
// ── Capability ──────────────────────────────────────────────────────────────
class DfuCapability {
    constructor(ctx) {
        this.ctx = ctx;
    }
    /**
     * Local-file firmware DFU. Listen to `firmwareDfuProgress`. **High risk:** can brick a Band if misused.
     * Android: JL-platform Bands only (`VPOperateManager.isJLDevice`). iOS: `VPDFUOperation` local file path.
     */
    startLocalFirmwareDfu(filePath) {
        return this.ctx.invoke({
            validate: () => validateFirmwareDfuFilePath(filePath),
            invoke: () => this.ctx.native.startLocalFirmwareDfu(filePath.trim()),
        });
    }
}
exports.DfuCapability = DfuCapability;
//# sourceMappingURL=dfu.js.map