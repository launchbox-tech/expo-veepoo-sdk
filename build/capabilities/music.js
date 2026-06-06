"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MusicCapability = void 0;
exports.normalizeMusicRemoteCommand = normalizeMusicRemoteCommand;
exports.validateMusicData = validateMusicData;
const deep_keys_1 = require("../shared/deep-keys");
// ── Normalizers ─────────────────────────────────────────────────────────────
/** Normalizes a music remote command string from native. */
function normalizeMusicRemoteCommand(value) {
    const s = typeof value === "string" ? value : "";
    if (s === "next")
        return "next";
    if (s === "previous")
        return "previous";
    if (s === "pausePlay" || s === "pause_play")
        return "pause_play";
    return "pause_play";
}
// ── Validators ──────────────────────────────────────────────────────────────
function validateMusicData(data) {
    if (typeof data.name !== "string" || data.name.trim().length === 0) {
        throw { code: "INVALID_ARGUMENT", message: "name is required" };
    }
    if (typeof data.artist !== "string" || data.artist.trim().length === 0) {
        throw { code: "INVALID_ARGUMENT", message: "artist is required" };
    }
    if (!Number.isInteger(data.volume) || data.volume < 1 || data.volume > 100) {
        throw { code: "INVALID_ARGUMENT", message: "volume must be an integer between 1 and 100" };
    }
}
// ── Capability ──────────────────────────────────────────────────────────────
class MusicCapability {
    constructor(ctx) {
        this.ctx = ctx;
    }
    setMusicControlEnabled(enabled) {
        return this.ctx.invoke({
            invoke: () => this.ctx.native.setMusicControlEnabled(enabled),
        });
    }
    pushMusicData(data) {
        return this.ctx.invoke({
            validate: () => validateMusicData(data),
            invoke: () => this.ctx.native.pushMusicData((0, deep_keys_1.deepCamelKeys)(data)),
        });
    }
}
exports.MusicCapability = MusicCapability;
//# sourceMappingURL=music.js.map